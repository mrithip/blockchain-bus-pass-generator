# Testing and Three-Way Data Audit Methodology

This repository includes a dedicated testing documentation file for QA, SDET, and recruiter audiences. The testing strategy focuses on data integrity, cryptographic soundness, resilience, and security for the Blockchain Bus Pass System.

## Three-Way Data Audit Overview

The Three-Way Data Audit is a methodology for verifying data consistency across the full stack:

1. **Frontend state**: the data presented in the UI must match user expectations and the live application state.
2. **Backend API responses**: the API must return authoritative, validated results for authentication, pass issuance, blockchain blocks, and mempool transactions.
3. **Database records**: MongoDB must store the authoritative source of truth with correct schemas, indexes, and immutable blockchain history.

This testing methodology ensures that the system maintains integrity from the user interface through the API layer into the persistent storage layer.

## Why the audit matters

- It verifies that the blockchain ledger is internally consistent and that blocks are properly hashed.
- It detects orphaned records, duplicate keys, and schema inconsistencies that could indicate data corruption.
- It confirms that the UI reflects the same state as the stored blockchain and database records.
- It allows recruiters and stakeholders to understand how test design validates both business and technical requirements.

## Key Audit Principles

### Schema and index validation
- Confirm unique indexes for critical fields such as user email, block index, payment IDs, and mempool transactions.
- Verify that attempts to insert duplicate unique values are rejected by MongoDB.

### Orphaned and stale data handling
- Validate that deleting a user does not unexpectedly remove unrelated blockchain artifacts.
- Verify that payments, passes, and blockchain history remain consistent when ownership changes.

### Blockchain ledger integrity
- Recalculate SHA256 local hashes for every block and compare them to stored hashes.
- Confirm that each block references the previous block correctly.
- Ensure the Genesis block remains stable and non-duplicable.

### Cryptographic edge cases
- Verify expired pass validation using stored pass hashes and blockchain transactions.
- Confirm that JWT header tampering cannot bypass RBAC protections.

### Resilience and chaos scenarios
- Simulate database latency and verify graceful 503 responses.
- Create partial transaction failure states and validate system reconciliation expectations.
- Stress the mempool with 100+ transactions and verify mining stability.

## How this repository implements the audit

- `tests/test_advanced_integrity.py`: high-value audit tests covering schema validation, ledger consistency, cryptographic edge cases, and resilience.
- `tests/test_ui_ux.py`: UI verification using Selenium, including QR rendering and persistence checks.
- `backend/blockchain/Blockchain.js`: configured to respect `MINING_DIFFICULTY` for test-driven difficulty validation.
- `backend/server.js`: includes optional simulated MongoDB latency for chaos testing.
- `automation_master.sh`: installs dependencies, updates `.gitignore`, and generates an HTML report for the full test suite.
- `.github/workflows/qa.yml`: CI automation for the complete QA suite on GitHub Actions.

## How recruiters can use this documentation

Recruiters can use `README_TESTING.md` to understand the QA scope, the focus areas for test coverage, and how the repository is structured for audit-quality testing. The document demonstrates a strong SDET approach to:

- audit-style testing
- resilience and chaos engineering
- cryptographic integrity validation
- cross-layer data consistency

## Running the QA suite

```bash
./automation_master.sh
```

This command installs the required dependencies in `.venv`, runs the full Pytest suite, and generates an HTML report at `reports/full_audit_report.html`.
