import hashlib
import hmac
import json
import time

import pytest
from selenium.webdriver.common.by import By


def test_chain_validation_matches_mongo_and_frontend(browser, ui_base_url, api_base_url, admin_user, mongo_client):
    token = admin_user['token']
    headers = {'Authorization': f'Bearer {token}'}

    # Ensure at least one block exists and the chain is valid
    valid_response = __import__('requests').get(f'{api_base_url}/admin/validate-chain', headers=headers, timeout=15)
    assert valid_response.status_code == 200
    assert valid_response.json()['valid'] is True

    blocks_response = __import__('requests').get(f'{api_base_url}/admin/blocks', headers=headers, timeout=15)
    assert blocks_response.status_code == 200
    api_blocks = blocks_response.json()['blocks']

    db_blocks = list(mongo_client.get_default_database().blocks.find())
    assert len(api_blocks) == len(db_blocks)

    # Login through frontend and verify block count in explorer matches the API / DB state
    browser.get(f'{ui_base_url}/login')
    browser.execute_script(f"localStorage.setItem('token', '{token}');")
    user_json = json.dumps(admin_user['user']).replace('"', '\\"')
    browser.execute_script(f'localStorage.setItem("user", "{user_json}");')
    browser.get(f'{ui_base_url}/admin/blocks')

    time.sleep(2)
    rendered_blocks = browser.find_elements(By.XPATH, "//table//tbody//tr")
    assert len(rendered_blocks) == len(api_blocks)


def test_chain_invalidates_after_database_tamper(api_base_url, admin_user, mongo_client):
    token = admin_user['token']
    headers = {'Authorization': f'Bearer {token}'}

    # Create a pass with admin account if no recent transaction exists
    create_resp = __import__('requests').post(
        f'{api_base_url}/user/passes/create',
        json={
            'name': 'Audit Tamper',
            'route': 'A-B',
            'aadhar': '555555555555',
            'expiryDate': time.strftime('%Y-%m-%d', time.localtime(time.time() + 86400 * 30))
        },
        headers=headers,
        timeout=15
    )
    assert create_resp.status_code == 200

    mine_resp = __import__('requests').post(f'{api_base_url}/admin/mine', headers=headers, timeout=15)
    assert mine_resp.status_code == 200

    # Tamper with the blockchain block transaction directly in Mongo
    db = mongo_client.get_default_database()
    target_block = db.blocks.find_one({'index': {'$gt': 0}})
    assert target_block is not None
    db.blocks.update_one(
        {'_id': target_block['_id'], 'transactions.txId': target_block['transactions'][0]['txId']},
        {'$set': {'transactions.$.passHash': 'tampered-hash'}}
    )

    validate_resp = __import__('requests').get(f'{api_base_url}/admin/validate-chain', headers=headers, timeout=15)
    assert validate_resp.status_code == 200
    assert validate_resp.json()['valid'] is False


def test_mempool_persists_transactions_until_mine(api_base_url, admin_user):
    token = admin_user['token']
    headers = {'Authorization': f'Bearer {token}'}

    create_resp = __import__('requests').post(
        f'{api_base_url}/user/passes/create',
        json={
            'name': 'Mempool Test',
            'route': 'A-B',
            'aadhar': '222222222222',
            'expiryDate': time.strftime('%Y-%m-%d', time.localtime(time.time() + 86400 * 30))
        },
        headers=headers,
        timeout=15
    )
    assert create_resp.status_code == 200

    mempool_resp = __import__('requests').get(f'{api_base_url}/admin/mempool', headers=headers, timeout=15)
    assert mempool_resp.status_code == 200
    assert len(mempool_resp.json().get('transactions', [])) >= 1

    mine_resp = __import__('requests').post(f'{api_base_url}/admin/mine', headers=headers, timeout=15)
    assert mine_resp.status_code == 200

    mempool_after = __import__('requests').get(f'{api_base_url}/admin/mempool', headers=headers, timeout=15)
    assert mempool_after.status_code == 200
    assert len(mempool_after.json().get('transactions', [])) == 0
