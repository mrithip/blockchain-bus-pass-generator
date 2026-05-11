import datetime
import hashlib
import json
import os
import random
import string
import subprocess
import time
import uuid

import jwt
import pytest
import requests
from pymongo.errors import DuplicateKeyError


def random_string(length=8):
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))


def build_headers(token=None):
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    return headers


def wait_for_server(url, timeout=20):
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            response = requests.get(url, timeout=3)
            if response.status_code == 200:
                return True
        except requests.RequestException:
            pass
        time.sleep(1)
    raise RuntimeError(f'Server did not become available at {url}')


def start_backend_server(port, env):
    process = subprocess.Popen(
        ['node', 'backend/server.js'],
        cwd=os.getcwd(),
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    wait_for_server(f'http://localhost:{port}/api/health', timeout=30)
    return process


def stop_backend_server(process):
    process.terminate()
    try:
        process.wait(timeout=10)
    except subprocess.TimeoutExpired:
        process.kill()


@pytest.fixture(scope='function')
def clean_test_records(mongo_client):
    created = {'users': [], 'passes': [], 'payments': []}
    yield created
    db = mongo_client.get_default_database()
    if created['passes']:
        db.passes.delete_many({'_id': {'$in': created['passes']}})
    if created['payments']:
        db.payments.delete_many({'paymentId': {'$in': created['payments']}})
    if created['users']:
        db.users.delete_many({'_id': {'$in': created['users']}})


@pytest.mark.parametrize(
    'collection_name,index_name,expected_unique',
    [
        ('users', 'email_1', True),
        ('payments', 'paymentId_1', True),
        ('blocks', 'index_1', True),
        ('mempools', 'txId_1', True),
    ]
)
def test_mongodb_has_expected_unique_indexes(mongo_client, collection_name, index_name, expected_unique):
    db = mongo_client.get_default_database()
    index_info = db[collection_name].index_information()
    assert index_name in index_info, f'Expected index {index_name} on {collection_name}'
    assert index_info[index_name].get('unique', False) is expected_unique


@pytest.mark.parametrize(
    'collection_name,document_one,document_two',
    [
        (
            'users',
            {'_id': 'dup-email-1', 'name': 'Duplicate A', 'email': 'dup@example.com', 'passwordHash': 'X', 'role': 'user', 'tokens': 0, 'canMine': False},
            {'_id': 'dup-email-2', 'name': 'Duplicate B', 'email': 'dup@example.com', 'passwordHash': 'Y', 'role': 'user', 'tokens': 0, 'canMine': False},
        ),
        (
            'payments',
            {'paymentId': 'pay-dupe-1', 'userId': 'dummy-user', 'amount': 1, 'razorpayOrderId': 'order-1', 'status': 'created', 'currency': 'INR'},
            {'paymentId': 'pay-dupe-1', 'userId': 'dummy-user', 'amount': 1, 'razorpayOrderId': 'order-2', 'status': 'created', 'currency': 'INR'},
        ),
        (
            'blocks',
            {'index': 99999, 'timestamp': datetime.datetime.utcnow(), 'transactions': [], 'previousHash': '0', 'hash': 'dummy', 'nonce': 0, 'miner': 'SYS', 'reward': 0},
            {'index': 99999, 'timestamp': datetime.datetime.utcnow(), 'transactions': [], 'previousHash': '0', 'hash': 'dummy2', 'nonce': 1, 'miner': 'SYS', 'reward': 0},
        ),
        (
            'mempools',
            {'txId': 'tx-dupe-1', 'type': 'buspass', 'passHash': 'hash-1', 'to': 'dummy', 'timestamp': datetime.datetime.utcnow()},
            {'txId': 'tx-dupe-1', 'type': 'buspass', 'passHash': 'hash-2', 'to': 'dummy', 'timestamp': datetime.datetime.utcnow()},
        ),
    ]
)
def test_duplicate_unique_fields_are_rejected_by_db(mongo_client, collection_name, document_one, document_two):
    db = mongo_client.get_default_database()
    collection = db[collection_name]

    try:
        collection.insert_one(document_one)
        with pytest.raises(Exception):
            collection.insert_one(document_two)
    finally:
        if collection_name == 'users':
            collection.delete_many({'_id': {'$in': [document_one.get('_id'), document_two.get('_id')]}})
        if collection_name == 'payments':
            collection.delete_many({'paymentId': {'$in': [document_one.get('paymentId'), document_two.get('paymentId')]}})
        if collection_name == 'blocks':
            collection.delete_many({'index': 99999})
        if collection_name == 'mempools':
            collection.delete_many({'txId': {'$in': [document_one.get('txId'), document_two.get('txId')]}})


def test_orphaned_passes_remain_after_user_deletion(api_base_url, api_session, mongo_client, clean_test_records):
    email = f'orphan-{random_string()}@example.com'
    password = 'TestPass!234'
    register_resp = api_session.post(
        f'{api_base_url}/auth/register',
        json={'name': 'Orphan Test', 'email': email, 'password': password},
        timeout=15,
    )
    assert register_resp.status_code == 201
    user_id = register_resp.json()['user']['id']
    clean_test_records['users'].append(user_id)

    pass_id = str(uuid.uuid4())
    db = mongo_client.get_default_database()
    db.passes.insert_one({
        '_id': pass_id,
        'userId': user_id,
        'name': 'Orphaned Pass',
        'route': 'A-B',
        'aadharHash': hashlib.sha256('123456789012'.encode('utf-8')).hexdigest(),
        'expiryDate': datetime.datetime.utcnow() + datetime.timedelta(days=30),
        'qrDataUri': 'data:image/png;base64,placeholder',
        'passHash': hashlib.sha256(f'{pass_id}'.encode('utf-8')).hexdigest(),
        'mined': False,
        'createdAt': datetime.datetime.utcnow(),
    })
    clean_test_records['passes'].append(pass_id)

    db.users.delete_one({'_id': user_id})
    assert db.users.find_one({'_id': user_id}) is None
    assert db.passes.find_one({'_id': pass_id}) is not None


def test_orphaned_payments_exist_after_user_cleanup(api_base_url, api_session, mongo_client, clean_test_records):
    email = f'orphan-payment-{random_string()}@example.com'
    password = 'TestPass!234'
    register_resp = api_session.post(
        f'{api_base_url}/auth/register',
        json={'name': 'Orphan Payment', 'email': email, 'password': password},
        timeout=15,
    )
    assert register_resp.status_code == 201
    user_id = register_resp.json()['user']['id']
    clean_test_records['users'].append(user_id)

    db = mongo_client.get_default_database()
    db.payments.insert_one({
        'paymentId': f'payment-{random_string()}',
        'userId': user_id,
        'amount': 100,
        'currency': 'INR',
        'status': 'created',
        'razorpayOrderId': f'order-{random_string()}',
        'createdAt': datetime.datetime.utcnow(),
    })

    db.users.delete_one({'_id': user_id})
    orphaned_payment = db.payments.find_one({'userId': user_id})
    assert orphaned_payment is not None
    assert orphaned_payment['status'] == 'created'


def test_block_hash_recalculation_matches_api_blockchain(api_base_url, admin_user):
    headers = build_headers(admin_user['token'])
    blocks_resp = requests.get(f'{api_base_url}/admin/blocks', headers=headers, timeout=15)
    assert blocks_resp.status_code == 200
    blocks = blocks_resp.json().get('blocks', [])

    for block in blocks:
        reconstructed = (
            str(block['index'])
            + block['timestamp']
            + json.dumps(block['transactions'], separators=(',', ':'), sort_keys=False)
            + block['previousHash']
            + str(block['nonce'])
        )
        calculated_hash = hashlib.sha256(reconstructed.encode('utf-8')).hexdigest()
        assert calculated_hash == block['hash']


def test_blockchain_previous_hash_chain_consistency(api_base_url, admin_user):
    headers = build_headers(admin_user['token'])
    blocks_resp = requests.get(f'{api_base_url}/admin/blocks', headers=headers, timeout=15)
    assert blocks_resp.status_code == 200
    blocks = blocks_resp.json().get('blocks', [])

    for previous, current in zip(blocks, blocks[1:]):
        assert current['previousHash'] == previous['hash']


def test_chain_transaction_passhash_matches_pass_record(api_base_url, admin_user, mongo_client):
    headers = build_headers(admin_user['token'])
    blocks_resp = requests.get(f'{api_base_url}/admin/blocks', headers=headers, timeout=15)
    assert blocks_resp.status_code == 200

    db = mongo_client.get_default_database()
    for block in blocks_resp.json().get('blocks', []):
        for tx in block['transactions']:
            if tx.get('passId'):
                pass_record = db.passes.find_one({'_id': tx['passId']})
                assert pass_record is not None
                assert pass_record['passHash'] == tx['passHash']


def test_genesis_block_cannot_be_duplicated(mongo_client):
    db = mongo_client.get_default_database()
    genesis = db.blocks.find_one({'index': 0})
    assert genesis is not None
    assert genesis['previousHash'] == '0'

    with pytest.raises(Exception):
        db.blocks.insert_one({
            'index': 0,
            'timestamp': datetime.datetime.utcnow(),
            'transactions': [],
            'previousHash': '0',
            'hash': 'invalidhash',
            'nonce': 0,
            'miner': 'TEST',
            'reward': 0,
        })


def test_mining_difficulty_adjustment_requires_more_leading_zeros(api_base_url):
    env = os.environ.copy()
    env['PORT'] = '5001'
    env['MONGODB_URI'] = os.environ.get('MONGODB_URI', 'mongodb://localhost:27017/buspass')
    env['JWT_SECRET'] = os.environ.get('JWT_SECRET', 'test-secret')
    env['MINING_DIFFICULTY'] = '3'

    process = start_backend_server(5001, env)
    try:
        session = requests.Session()
        email = f'adjust-{random_string()}@example.com'
        register_resp = session.post(
            'http://localhost:5001/api/auth/register',
            json={'name': 'Difficulty Admin', 'email': email, 'password': 'TestPass!1', 'role': 'admin'},
            timeout=15,
        )
        assert register_resp.status_code == 201
        token = register_resp.json()['token']

        pass_resp = session.post(
            'http://localhost:5001/api/user/passes/create',
            headers=build_headers(token),
            json={
                'name': 'Difficulty Pass',
                'route': 'A-B',
                'aadhar': '111222333444',
                'expiryDate': (datetime.date.today() + datetime.timedelta(days=30)).isoformat(),
            },
            timeout=15,
        )
        assert pass_resp.status_code == 200

        mine_resp = session.post('http://localhost:5001/api/admin/mine', headers=build_headers(token), timeout=30)
        assert mine_resp.status_code == 200
        assert mine_resp.json()['block']['hash'].startswith('000')
    finally:
        stop_backend_server(process)


def test_mempool_flooding_with_many_pending_transactions(api_base_url, admin_user, mongo_client):
    db = mongo_client.get_default_database()
    admin_id = admin_user['user']['id']
    tx_ids = []
    for _ in range(105):
        tx_id = str(uuid.uuid4())
        tx_ids.append(tx_id)
        db.mempools.insert_one({
            'txId': tx_id,
            'type': 'buspass',
            'passId': str(uuid.uuid4()),
            'passHash': hashlib.sha256(tx_id.encode('utf-8')).hexdigest(),
            'to': admin_id,
            'timestamp': datetime.datetime.utcnow(),
        })

    headers = build_headers(admin_user['token'])
    mempool_resp = requests.get(f'{api_base_url}/admin/mempool', headers=headers, timeout=15)
    assert mempool_resp.status_code == 200
    assert len(mempool_resp.json()['transactions']) >= 105

    mine_resp = requests.post(f'{api_base_url}/admin/mine', headers=headers, timeout=30)
    assert mine_resp.status_code == 200
    assert mine_resp.json()['success'] is True

    remaining = requests.get(f'{api_base_url}/admin/mempool', headers=headers, timeout=15)
    assert remaining.status_code == 200
    assert len(remaining.json()['transactions']) <= 95


def test_nosql_injection_is_blocked_on_login(api_base_url):
    payload = {'email': {'$gt': ''}, 'password': 'doesnotmatter'}
    response = requests.post(f'{api_base_url}/auth/login', json=payload, timeout=15)
    assert response.status_code in (400, 401)


def test_jwt_alg_none_does_not_access_admin_endpoints(api_base_url):
    token = jwt.encode(
        {'id': 'fake-admin', 'email': 'fake@admin.com', 'role': 'admin', 'exp': int(time.time()) + 60},
        key='',
        algorithm='none',
    )
    headers = build_headers(token)
    response = requests.post(f'{api_base_url}/admin/mine', headers=headers, timeout=15)
    assert response.status_code in (401, 403)


def test_expired_pass_verification_returns_invalid(api_base_url, admin_user, mongo_client):
    pass_id = str(uuid.uuid4())
    pass_hash = hashlib.sha256(pass_id.encode('utf-8')).hexdigest()
    expiry_date = datetime.datetime.utcnow() - datetime.timedelta(seconds=1)

    db = mongo_client.get_default_database()
    db.passes.insert_one({
        '_id': pass_id,
        'userId': admin_user['user']['id'],
        'name': 'Expired Pass',
        'route': 'A-B',
        'aadharHash': hashlib.sha256('888888888888'.encode('utf-8')).hexdigest(),
        'expiryDate': expiry_date,
        'qrDataUri': json.dumps({'passId': pass_id, 'passHash': pass_hash}),
        'passHash': pass_hash,
        'mined': True,
        'blockIndex': 1,
        'createdAt': datetime.datetime.utcnow(),
    })
    db.blocks.insert_one({
        'index': 99998,
        'timestamp': datetime.datetime.utcnow(),
        'transactions': [{
            'txId': str(uuid.uuid4()),
            'type': 'buspass',
            'passId': pass_id,
            'passHash': pass_hash,
            'to': admin_user['user']['id'],
            'amount': 0,
        }],
        'previousHash': '0',
        'hash': hashlib.sha256('test'.encode('utf-8')).hexdigest(),
        'nonce': 0,
        'miner': admin_user['user']['id'],
        'reward': 0,
        'createdAt': datetime.datetime.utcnow(),
    })

    headers = build_headers(admin_user['token'])
    response = requests.post(
        f'{api_base_url}/payments/passes/verify',
        json={'passHash': pass_hash},
        headers=headers,
        timeout=15,
    )
    assert response.status_code == 400
    assert 'expired' in response.json().get('message', '').lower()


def test_database_latency_returns_503_during_slow_db(api_base_url):
    env = os.environ.copy()
    env['PORT'] = '5002'
    env['MONGODB_URI'] = os.environ.get('MONGODB_URI', 'mongodb://localhost:27017/buspass')
    env['JWT_SECRET'] = os.environ.get('JWT_SECRET', 'test-secret')
    env['REQUEST_TIMEOUT_MS'] = '1000'
    env['TEST_MONGO_LATENCY_MS'] = '30000'

    process = start_backend_server(5002, env)
    try:
        response = requests.post(
            'http://localhost:5002/api/auth/login',
            json={'email': 'doesnotexist@example.com', 'password': 'test'},
            timeout=15,
        )
        assert response.status_code == 503
    finally:
        stop_backend_server(process)


def test_partial_transaction_failure_creates_orphaned_pass(api_base_url, api_session, mongo_client):
    email = f'partial-{random_string()}@example.com'
    password = 'TestPass!234'
    register_resp = api_session.post(
        f'{api_base_url}/auth/register',
        json={'name': 'Partial Failure', 'email': email, 'password': password},
        timeout=15,
    )
    assert register_resp.status_code == 201
    user_id = register_resp.json()['user']['id']
    token = register_resp.json()['token']

    pass_id = str(uuid.uuid4())
    pass_hash = hashlib.sha256(pass_id.encode('utf-8')).hexdigest()
    db = mongo_client.get_default_database()
    db.passes.insert_one({
        '_id': pass_id,
        'userId': user_id,
        'name': 'Partial Failure Pass',
        'route': 'A-B',
        'aadharHash': hashlib.sha256('777777777777'.encode('utf-8')).hexdigest(),
        'expiryDate': datetime.datetime.utcnow() + datetime.timedelta(days=30),
        'qrDataUri': 'data:image/png;base64,partial',
        'passHash': pass_hash,
        'mined': False,
        'createdAt': datetime.datetime.utcnow(),
    })

    response = api_session.get(
        f'{api_base_url}/user/passes/history',
        headers=build_headers(token),
        timeout=15,
    )
    assert response.status_code == 200
    assert any(pass_record['id'] == pass_id for pass_record in response.json().get('passes', []))
    assert db.mempools.count_documents({'passHash': pass_hash}) == 0
    assert db.passes.find_one({'_id': pass_id})['mined'] is False
