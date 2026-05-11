#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$REPO_ROOT"

# Ensure .gitignore excludes QA artifacts
for entry in "test-reports/" ".env" "__pycache__/" "reports/"; do
  if ! grep -qxF "$entry" .gitignore; then
    echo "$entry" >> .gitignore
  fi
done

# Add Quality Assurance section to README if missing
QA_SECTION="## Quality Assurance & Blockchain Audit"
if ! grep -qF "$QA_SECTION" README.md; then
  cat >> README.md <<'EOF'

## Quality Assurance & Blockchain Audit

This repository includes a comprehensive automation suite for functional, security, and blockchain integrity testing.

- Pytest test suites for UI/UX validation, RBAC and API security, blockchain consistency, rate-limiting, and crash recovery.
- Selenium Page Object Model for structured browser-based acceptance testing.
- Requests-based smoke tests for authentication, pass creation, and tamper detection.
- MongoDB-assisted audits for immutability and mempool validation.

### Running the QA Suite

```bash
./automation_master.sh
```

The script installs Python dependencies, updates `.gitignore`, and generates a full HTML report at `reports/full_audit_report.html`.
EOF
fi

# Create and activate virtual environment
if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi
source .venv/bin/activate

# Install Python dependencies in the virtual environment
python3 -m pip install --upgrade pip
python3 -m pip install -r requirements.txt

# Create reports directory if missing
mkdir -p reports

# Run the full regression suite and generate a report
pytest --html=reports/full_audit_report.html --self-contained-html
