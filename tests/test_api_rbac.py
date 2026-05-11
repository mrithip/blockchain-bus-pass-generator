import concurrent.futures
import hashlib
import hmac
import time

import pytest


def create_user(api_base_url, api_session, role='user'):
    payload = {
        'name': 'RBAC Tester',
        'email': f'rbac-{int(time.time() * 1000)}@example.com',
        'password': 'Secure123!',
        'role': role
    }
    response = api_session.post(f'{api_base_url}/auth/register', json=payload, timeout=15)
    response.raise_for_status()
    return response.json()


def login(api_base_url, api_session, email, password):
    response = api_session.post(f'{api_base_url}/auth/login', json={'email': email, 'password': password}, timeout=15)
    response.raise_for_status()
    return response.json()['token']


def test_regular_user_cannot_mine_block(admin_user, api_base_url, api_session):
    regular = create_user(api_base_url, api_session, role='user')
    token = login(api_base_url, api_session, regular['user']['email'], 'Secure123!')

    headers = {'Authorization': f'Bearer {token}'}
    result = api_session.post(f'{api_base_url}/admin/mine', headers=headers, timeout=15)

    assert result.status_code == 403
    assert 'Mining permission required' in result.json().get('message', '')


def test_tampered_jwt_signature_blocks_pass_history(api_base_url, api_session, fresh_user):
    original_token = fresh_user['token']
    token_parts = original_token.split('.')
    assert len(token_parts) == 3
    tampered_payload = token_parts[1][:-1] + ('A' if token_parts[1][-1] != 'A' else 'B')
    tampered_token = '.'.join([token_parts[0], tampered_payload, token_parts[2]])

    headers = {'Authorization': f'Bearer {tampered_token}'}
    response = api_session.get(f'{api_base_url}/user/passes/history', headers=headers, timeout=15)

    assert response.status_code == 403
    assert 'Invalid or expired token' in response.json().get('message', '')


def test_empty_registration_fields_rejected(api_base_url, api_session):
    response = api_session.post(f'{api_base_url}/auth/register', json={'name': '', 'email': '', 'password': ''}, timeout=15)
    assert response.status_code == 400
    assert response.json().get('success') is False


def test_invalid_credit_card_format_fails_payment(api_base_url, api_session, fresh_user, valid_payment_credentials):
    order_resp = api_session.post(
        f'{api_base_url}/payments/order',
        json={'amount': 100},
        headers={'Authorization': f"Bearer {fresh_user['token']}"},
        timeout=15
    )
    assert order_resp.status_code == 200
    order_id = order_resp.json()['order']['id']

    invalid_signature = 'invalid-signature-format'
    response = api_session.post(
        f'{api_base_url}/payments/verify',
        json={
            'razorpay_order_id': order_id,
            'razorpay_payment_id': 'invalid_payment',
            'razorpay_signature': invalid_signature,
            'passData': {
                'name': 'Invalid Card',
                'route': 'A-B',
                'aadhar': '123456789012',
                'expiryDate': (time.strftime('%Y-%m-%d', time.localtime(time.time() + 86400 * 30)))
            }
        },
        headers={'Authorization': f"Bearer {fresh_user['token']}"},
        timeout=15
    )

    assert response.status_code == 400
    assert 'Payment verification failed' in response.json().get('message', '')


def attempt_fast_pass_create(api_base_url, token):
    session = __import__('requests').Session()
    response = session.post(
        f'{api_base_url}/user/passes/create',
        json={
            'name': 'Rate Test',
            'route': 'A-B',
            'aadhar': '123456789012',
            'expiryDate': __import__('datetime').date.today().isoformat()
        },
        headers={'Authorization': f'Bearer {token}'},
        timeout=15
    )
    return response.status_code


def test_rate_limiting_on_pass_creation(api_base_url, admin_user):
    token = admin_user['token']
    statuses = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
        futures = [executor.submit(attempt_fast_pass_create, api_base_url, token) for _ in range(20)]
        for future in concurrent.futures.as_completed(futures):
            statuses.append(future.result())

    assert any(status == 429 for status in statuses), 'Expected at least one throttled request when flooding pass creation endpoint'
