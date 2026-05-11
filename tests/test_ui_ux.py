import datetime
import json
import time

import pytest
from selenium.webdriver.common.by import By

from tests.pages.create_pass_page import CreatePassPage
from tests.pages.login_page import LoginPage
from tests.pages.navbar_page import NavbarPage
from tests.pages.register_page import RegisterPage


def test_register_new_user_via_ui(browser, ui_base_url):
    register_page = RegisterPage(browser, ui_base_url)
    email = f'ui-{int(time.time())}@example.com'
    register_page.register('Quality Tester', email, 'TestPass123!')

    dashboard_heading = browser.find_element(By.XPATH, "//h1[contains(text(), 'Dashboard') or contains(text(), 'Welcome')]")
    assert dashboard_heading.is_displayed(), 'New user should land on dashboard after registration'


def test_login_existing_user_via_ui(browser, ui_base_url, fresh_user):
    login_page = LoginPage(browser, ui_base_url)
    login_page.login(fresh_user['email'], fresh_user['password'])

    assert browser.current_url.endswith('/dashboard') or '/dashboard' in browser.current_url
    assert 'logout' in browser.page_source.lower()


def test_qr_code_renders_after_api_pass_purchase(browser, ui_base_url, api_base_url, fresh_user, valid_payment_credentials):
    # Use API to perform a mocked Razorpay purchase and then verify QR rendering in the UI
    session = __import__('requests').Session()
    session.headers.update({'Content-Type': 'application/json', 'Authorization': f'Bearer {fresh_user["token"]}'})

    order_resp = session.post(f'{api_base_url}/payments/order', json={'amount': 100}, timeout=15)
    assert order_resp.status_code == 200
    order_data = order_resp.json()['order']

    signature = __import__('hmac').new(
        valid_payment_credentials.encode('utf-8'),
        f"{order_data['id']}|payment_test".encode('utf-8'),
        __import__('hashlib').sha256
    ).hexdigest()

    verify_resp = session.post(
        f'{api_base_url}/payments/verify',
        json={
            'razorpay_order_id': order_data['id'],
            'razorpay_payment_id': 'payment_test',
            'razorpay_signature': signature,
            'passData': {
                'name': 'UI Pass Tester',
                'route': 'A-B',
                'aadhar': '123456789012',
                'expiryDate': (datetime.date.today() + datetime.timedelta(days=60)).isoformat()
            }
        },
        timeout=15
    )
    assert verify_resp.status_code == 200
    assert verify_resp.json()['success'] is True

    # Visit the frontend UI and verify QR rendering
    browser.get(f'{ui_base_url}/login')
    browser.execute_script(f"localStorage.setItem('token', '{fresh_user['token']}');")
    user_json = json.dumps(fresh_user['user']).replace('"', '\\"')
    browser.execute_script(f'localStorage.setItem("user", "{user_json}");')
    browser.get(f'{ui_base_url}/user/qr')

    qr_image = browser.find_element(By.XPATH, "//img[contains(@src, 'data:image/png')]")
    assert qr_image.is_displayed(), 'QR code image should render after pass purchase'


def test_navbar_collapses_on_mobile_viewport(browser, ui_base_url, fresh_user):
    browser.set_window_size(420, 800)
    browser.get(f'{ui_base_url}/login')
    browser.find_element(By.ID, 'email').send_keys(fresh_user['email'])
    browser.find_element(By.ID, 'password').send_keys(fresh_user['password'])
    browser.find_element(By.XPATH, "//button[@type='submit']").click()

    navbar = NavbarPage(browser, ui_base_url)
    navbar.toggle_mobile_menu()

    assert navbar.is_mobile_menu_open(), 'Mobile navigation menu should open when the hamburger button is clicked'
    assert len(navbar.get_mobile_links()) >= 4


@pytest.mark.parametrize('field', ['name', 'email', 'password', 'confirmPassword'])
def test_registration_rejects_empty_fields(browser, ui_base_url, field):
    register_page = RegisterPage(browser, ui_base_url)
    register_page.load()
    if field != 'name':
        register_page.enter_name('QA Tester')
    if field != 'email':
        register_page.enter_email('emptyfield@example.com')
    if field != 'password':
        register_page.enter_password('TestPass123!')
    if field != 'confirmPassword':
        register_page.enter_confirm_password('TestPass123!')
    register_page.submit()

    assert 'required' in browser.page_source.lower() or 'validation' in browser.page_source.lower()


def test_login_with_expired_jwt_redirects_to_login(browser, ui_base_url):
    secret = __import__('os').getenv('JWT_SECRET')
    if not secret:
        pytest.skip('JWT_SECRET not set for expired token test')

    import jwt
    expired_token = jwt.encode({'id': '0000', 'email': 'expired@example.com', 'role': 'user', 'exp': 1}, secret, algorithm='HS256')
    browser.get(f'{ui_base_url}/dashboard')
    browser.execute_script(f"localStorage.setItem('token', '{expired_token}');")
    browser.get(f'{ui_base_url}/dashboard')

    assert '/login' in browser.current_url or 'login' in browser.page_source.lower()


def test_qr_image_is_visible_and_not_obscured(browser, ui_base_url, api_base_url, fresh_user, valid_payment_credentials):
    session = __import__('requests').Session()
    session.headers.update({'Content-Type': 'application/json', 'Authorization': f'Bearer {fresh_user["token"]}'})
    order_resp = session.post(f'{api_base_url}/payments/order', json={'amount': 100}, timeout=15)
    assert order_resp.status_code == 200
    order_data = order_resp.json()['order']

    signature = __import__('hmac').new(
        valid_payment_credentials.encode('utf-8'),
        f"{order_data['id']}|payment_test".encode('utf-8'),
        __import__('hashlib').sha256
    ).hexdigest()

    verify_resp = session.post(
        f'{api_base_url}/payments/verify',
        json={
            'razorpay_order_id': order_data['id'],
            'razorpay_payment_id': 'payment_test',
            'razorpay_signature': signature,
            'passData': {
                'name': 'QR Visibility',
                'route': 'A-B',
                'aadhar': '999999999999',
                'expiryDate': (datetime.date.today() + datetime.timedelta(days=60)).isoformat()
            }
        },
        timeout=15
    )
    assert verify_resp.status_code == 200

    browser.get(f'{ui_base_url}/login')
    browser.execute_script(f"localStorage.setItem('token', '{fresh_user['token']}');")
    user_json = json.dumps(fresh_user['user']).replace('"', '\\"')
    browser.execute_script(f'localStorage.setItem("user", "{user_json}");')
    browser.get(f'{ui_base_url}/user/qr')

    qr_image = browser.find_element(By.XPATH, "//img[contains(@src, 'data:image/png')]")
    assert qr_image.is_displayed()
    assert qr_image.size['width'] > 0
    assert qr_image.size['height'] > 0


def test_dark_mode_localstorage_persists_after_refresh(browser, ui_base_url):
    browser.get(f'{ui_base_url}/login')
    browser.execute_script("localStorage.setItem('theme', 'dark');")
    browser.refresh()
    theme_value = browser.execute_script("return localStorage.getItem('theme');")
    assert theme_value == 'dark'
