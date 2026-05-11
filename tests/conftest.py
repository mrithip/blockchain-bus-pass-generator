import hashlib
import hmac
import os
import random
import string
import time

import pytest
import requests
from pymongo import MongoClient
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager


def random_email():
    timestamp = int(time.time() * 1000)
    suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
    return f"qa-{timestamp}-{suffix}@example.com"


@pytest.fixture(scope='session')
def ui_base_url():
    return os.getenv('UI_BASE_URL', 'http://localhost:5173')


@pytest.fixture(scope='session')
def api_base_url():
    return os.getenv('API_BASE_URL', 'http://localhost:5000/api')


@pytest.fixture(scope='session')
def mongo_uri():
    return os.getenv('MONGODB_URI') or os.getenv('MONGO_URI') or 'mongodb://localhost:27017/buspass'


@pytest.fixture(scope='session')
def mongo_client(mongo_uri):
    client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
    try:
        client.server_info()
    except Exception:
        pytest.skip('MongoDB is not available for QA automation')
    yield client
    client.close()


@pytest.fixture(scope='function')
def api_session():
    session = requests.Session()
    session.headers.update({'Content-Type': 'application/json'})
    return session


@pytest.fixture(scope='function')
def browser():
    options = Options()
    options.add_argument('--headless=new')
    options.add_argument('--disable-gpu')
    options.add_argument('--window-size=1280,1024')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--disable-extensions')
    options.add_argument('--disable-infobars')
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    driver.implicitly_wait(8)
    yield driver
    driver.quit()


def register_user(api_base_url, api_session, role='user'):
    payload = {
        'name': 'QA User',
        'email': random_email(),
        'password': 'Passw0rd!',
        'role': role,
    }
    response = api_session.post(f'{api_base_url}/auth/register', json=payload, timeout=15)
    response.raise_for_status()
    return response.json()


@pytest.fixture(scope='function')
def fresh_user(api_base_url, api_session):
    data = register_user(api_base_url, api_session, role='user')
    user = data['user']
    token = data['token']
    yield {
        'user': user,
        'token': token,
        'password': 'Passw0rd!',
        'email': user['email']
    }


@pytest.fixture(scope='function')
def admin_user(api_base_url, api_session):
    data = register_user(api_base_url, api_session, role='admin')
    user = data['user']
    token = data['token']
    yield {
        'user': user,
        'token': token,
        'password': 'Passw0rd!',
        'email': user['email']
    }


@pytest.fixture(scope='function')
def seeded_user(api_base_url, api_session, admin_user, mongo_client):
    user_payload = {
        'name': 'QA Token User',
        'email': random_email(),
        'password': 'Passw0rd!',
        'role': 'user'
    }
    result = api_session.post(f'{api_base_url}/auth/register', json=user_payload, timeout=15)
    result.raise_for_status()
    token_user = result.json()['token']
    user_id = result.json()['user']['id']

    api_session.headers.update({'Authorization': f'Bearer {admin_user["token"]}'})
    transfer_result = api_session.post(
        f'{api_base_url}/admin/tokens/sell',
        json={'userId': user_id, 'amount': 3},
        timeout=15
    )
    transfer_result.raise_for_status()

    api_session.headers.update({'Authorization': f'Bearer {token_user}'})
    yield {
        'user': result.json()['user'],
        'token': token_user,
        'id': user_id
    }

    # cleanup inserted user artifacts
    db = mongo_client.get_default_database()
    db.users.delete_many({'email': user_payload['email']})
    db.passes.delete_many({'userId': user_id})
    db.mempools.delete_many({'to': user_id})


def compute_razorpay_signature(secret, order_id, payment_id):
    payload = f'{order_id}|{payment_id}'.encode('utf-8')
    return hmac.new(secret.encode('utf-8'), payload, hashlib.sha256).hexdigest()


@pytest.fixture(scope='function')
def valid_payment_credentials():
    secret = os.getenv('RAZORPAY_KEY_SECRET')
    if not secret:
        pytest.skip('RAZORPAY_KEY_SECRET is required for mocked payment verification tests')
    return secret


@pytest.fixture(scope='function')
def restart_enabled():
    return os.getenv('ENABLE_BACKEND_RESTART_TESTS', 'false').lower() in ('1', 'true', 'yes')
