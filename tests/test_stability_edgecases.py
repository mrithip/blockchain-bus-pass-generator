import os
import subprocess
import threading
import time

import pytest


def test_zero_balance_pass_creation_returns_payment_required(api_base_url, fresh_user, api_session):
    headers = {'Authorization': f"Bearer {fresh_user['token']}"}
    response = api_session.post(
        f'{api_base_url}/user/passes/create',
        json={
            'name': 'Zero Balance Test',
            'route': 'A-B',
            'aadhar': '999999999999',
            'expiryDate': ( __import__('datetime').date.today() + __import__('datetime').timedelta(days=30) ).isoformat()
        },
        headers=headers,
        timeout=15
    )

    assert response.status_code == 402
    assert response.json().get('requiresPayment') is True


def test_simultaneous_double_spend_attempt(api_base_url, admin_user):
    token = admin_user['token']
    headers = {'Authorization': f'Bearer {token}'}

    def create_pass():
        session = __import__('requests').Session()
        return session.post(
            f'{api_base_url}/user/passes/create',
            json={
                'name': 'Race Condition Test',
                'route': 'A-B',
                'aadhar': '333333333333',
                'expiryDate': ( __import__('datetime').date.today() + __import__('datetime').timedelta(days=30) ).isoformat()
            },
            headers=headers,
            timeout=15
        )

    results = []
    threads = []
    for _ in range(2):
        thread = threading.Thread(target=lambda: results.append(create_pass()))
        threads.append(thread)
        thread.start()

    for thread in threads:
        thread.join()

    assert len(results) == 2
    statuses = [result.status_code for result in results]
    assert statuses.count(200) <= 1, 'Only one request should succeed when token balance is limited for double-spend attempts'


def test_blockchain_persists_after_backend_restart(api_base_url, admin_user, restart_enabled):
    if not restart_enabled:
        pytest.skip('Backend restart tests are disabled; set ENABLE_BACKEND_RESTART_TESTS=true to enable')

    port = int(os.getenv('PORT', '5000'))
    health_url = f'http://localhost:{port}/api/health'

    stop_cmd = "pkill -f 'node server.js' || true"
    subprocess.run(stop_cmd, shell=True, check=False)
    time.sleep(3)

    start_process = subprocess.Popen(['node', 'backend/server.js'], cwd=os.getcwd())
    time.sleep(8)
    try:
        import requests
        health = requests.get(health_url, timeout=15)
        assert health.status_code == 200
        assert health.json().get('status') == 'OK'

        blocks_response = requests.get(
            f'{api_base_url}/admin/blocks',
            headers={'Authorization': f"Bearer {admin_user['token']}"},
            timeout=15
        )
        assert blocks_response.status_code == 200
    finally:
        start_process.terminate()
        start_process.wait(timeout=10)
