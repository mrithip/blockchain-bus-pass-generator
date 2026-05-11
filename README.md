# Blockchain Bus Pass System

Blockchain Bus Pass System is a public transit management platform that leverages a custom Proof-of-Work blockchain for secure, transparent, and auditable bus passes. The system provides user registration, pass creation, QR validation, token economy, mining workflows, and administrative control.

## Features

### Bus Pass Management
- Secure QR code generation for blockchain-verified passes
- Token-based pass purchase and Razorpay cash payments
- Complete pass history and status tracking
- Approval workflows for mining and pass generation
- SHA256 hashing for data integrity

### Blockchain Mining Ecosystem
- Custom Proof-of-Work mining with adjustable difficulty
- Miner permission requests and admin approvals
- Token reward distribution for miners
- Mempool transaction queue and block formation
- Chain validation endpoint for integrity checks

### Admin Control Panel
- Mining request review and approval
- Transaction and user monitoring
- Token transfers and economic controls
- Blockchain explorer and system analytics
- Mining, mempool, and block management

### Blockchain Explorer
- Full block ledger accessible through API and UI
- Chain validation and immutability checks
- Transaction-level detail for pass creation and rewards
- Explorer access for authenticated users

## Technical Architecture

### Frontend
- React 18 with functional components and hooks
- Tailwind CSS for responsive UI
- React Router for protected routes
- Axios for authenticated API requests
- LocalStorage-based JWT token management

### Backend
- Node.js and Express.js REST API
- MongoDB with Mongoose schemas
- JWT authentication and bcrypt password hashing
- Razorpay integration for payment processing
- Custom blockchain implementation in `backend/blockchain/Blockchain.js`

### Blockchain Implementation
- SHA256 hashing for blocks and pass validation
- Genesis block initialization on startup
- Mempool transaction storage in MongoDB
- Block mining and validation logic in the backend
- Chain validation endpoint at `/api/admin/validate-chain`

## Installation and Quick Start

### Prerequisites
- Node.js 16 or higher
- MongoDB database (MongoDB Atlas or local)
- Razorpay account for payment integration
- Git

### Setup

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd blockchain-bus-pass
   ```

2. Start the backend
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Update .env values for MONGO_URI, JWT_SECRET, RAZORPAY keys
   npm run dev
   ```

3. Start the frontend
   ```bash
   cd ../frontend
   npm install
   # Add REACT_APP_API_URL=http://localhost:5000/api to .env if needed
   npm run dev
   ```

4. Access the application
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile`

### User Routes
- `POST /api/user/passes/create`
- `GET /api/user/passes/latest`
- `GET /api/user/passes/history`
- `POST /api/user/permissions/request`
- `GET /api/user/permissions/status`

### Admin Routes
- `GET /api/admin/mempool`
- `POST /api/admin/mine`
- `GET /api/admin/blocks`
- `GET /api/admin/users`
- `GET /api/admin/mining-requests`
- `PUT /api/admin/mining-requests/:id/approve`
- `PUT /api/admin/mining-requests/:id/reject`
- `POST /api/admin/tokens/sell`

### Payments and Chain Validation
- `POST /api/payments/order`
- `POST /api/payments/verify`
- `GET /api/admin/validate-chain`

## Environment Configuration

### Backend Environment Variables
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/buspass
JWT_SECRET=your-super-secure-jwt-secret-key-here
SALT_SECRET=additional-salt-for-pass-hashing
RAZORPAY_KEY_ID=rzp_test_your-key-id
RAZORPAY_KEY_SECRET=your-secret-key-here
MINING_DIFFICULTY=1
MINING_REWARD=2
```

### Frontend Environment Variables
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_RAZORPAY_KEY_ID=rzp_test_your-key-id
```

## Roles and Permissions

### Regular Users
- Create and manage personal bus passes
- View QR codes and pass history
- Request mining permissions
- Access blockchain explorer and chain validation
- Cannot mine blocks without approval

### Miners with Permission
- All regular user privileges
- Access mining interface and mempool
- Execute block mining operations
- Earn tokens for mined blocks
- Participate in network consensus

### Administrators
- Full access to admin endpoints
- Grant mining permissions
- Transfer tokens between users
- Monitor blockchain and system statistics
- Review pending mining requests

## Quality Assurance and Automation Suite

This repository includes a complete QA automation suite under `tests/`.

### QA Suite Files

- `tests/conftest.py`: Fixtures for browser setup, API session, MongoDB client, and helper functions
- `tests/pages/base_page.py`: Base Page Object Model for Selenium
- `tests/pages/login_page.py`: Login page object model
- `tests/pages/register_page.py`: Registration page object model
- `tests/pages/create_pass_page.py`: Create pass page object model
- `tests/pages/navbar_page.py`: Navbar page object model and responsive menu checks
- `tests/test_ui_ux.py`: UI/UX Selenium scenarios
- `tests/test_api_rbac.py`: API and RBAC validation using Requests
- `tests/test_blockchain_audit.py`: Blockchain data integrity and audit validation
- `tests/test_stability_edgecases.py`: Stability and edge-case scenarios
- `requirements.txt`: Python dependencies for the QA suite
- `automation_master.sh`: Automation wrapper to install dependencies and run the full suite

### UI/UX Test Coverage
- User registration through the web interface
- User login and dashboard access
- Pass creation and QR code rendering verification
- Responsive navigation menu behavior on mobile viewports
- Empty registration field validation
- Expired JWT login behavior

### API and RBAC Test Coverage
- Confirm regular users cannot access admin-only mining endpoints
- Tampered JWT signature rejects protected routes
- Reject registration with missing required fields
- Reject invalid Razorpay payment verification
- Simulate rapid pass creation for rate limiting

### Blockchain and Data Integrity Test Coverage
- Cross-reference frontend block explorer state with MongoDB blocks and `/admin/validate-chain`
- Corrupt a MongoDB transaction and verify chain validation fails
- Confirm mempool retains transactions until mining completes

### Stability and Edge Case Test Coverage
- Verify zero-token users receive a payment-required response
- Simultaneously request pass creation to detect race conditions
- Optionally restart backend and validate blockchain persistence

### Running the QA Suite

Run the full automation from the repository root:

```bash
./automation_master.sh
```

The script will:
- Create and activate `.venv` if needed
- Install requirements in `.venv`
- Update `.gitignore` with QA artifact exclusions
- Run the full Pytest suite
- Generate `reports/full_audit_report.html`

## Project Structure

```
blockchain-bus-pass/
├── frontend/                    # React frontend application
│   ├── src/
│   │   ├── components/          # UI components
│   │   ├── pages/               # Page components
│   │   ├── api.js               # HTTP wrapper
│   │   └── main.jsx             # Frontend entry point
│   ├── public/                  # Static assets
│   └── package.json
├── backend/                     # Node.js Express API server
│   ├── models/                  # MongoDB schemas
│   ├── routes/                  # API routes
│   ├── middleware/              # Auth middleware
│   ├── blockchain/              # Blockchain implementation
│   └── server.js                # Server startup
├── tests/                       # QA automation suite
│   ├── pages/                   # Selenium Page Object Model classes
│   ├── conftest.py
│   ├── test_ui_ux.py
│   ├── test_api_rbac.py
│   ├── test_blockchain_audit.py
│   └── test_stability_edgecases.py
├── .gitignore
├── automation_master.sh
├── requirements.txt
└── README.md
```

## License

This project is distributed under the MIT License. See the LICENSE file for full terms.
