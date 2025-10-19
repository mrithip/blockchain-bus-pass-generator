# 🚇 Blockchain Bus Pass System

A revolutionary transportation solution that leverages blockchain technology for secure, transparent, and efficient public transit passes. Built with a custom Proof-of-Work blockchain, this system enables users to create, manage, and validate digital bus passes while participating in a mining ecosystem.

## 🌟 Features

### 🚇 **Bus Pass Management**
- **Secure QR Code Generation**: Blockchain-verified digital passes
- **Multi-payment Support**: Token-based or cash payments via Razorpay
- **Real-time Validation**: Conductor QR scanning with instant verification
- **Pass History**: Complete audit trail of all transactions

### ⛏️ **Blockchain Mining Ecosystem**
- **Proof-of-Work Mining**: Custom SHA256 implementation
- **Permission-based Access**: User request → Admin approval → Mining rights
- **Token Economy**: Earn tokens by mining, use tokens for passes
- **Decentralized Verification**: Trustless pass validation

### 👑 **Admin Control Panel**
- **Request Approval System**: Review and approve mining permissions
- **User Management**: Monitor users, tokens, and permissions
- **Token Distribution**: Transfer tokens to users as needed
- **System Monitoring**: Oversight of blockchain health

### 🔗 **Public Blockchain Explorer**
- **Transparent Ledger**: Full transaction history visible to all
- **Chain Validation**: Independent verification of blockchain integrity
- **Real-time Updates**: Live view of mining activity and transactions

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **Tailwind CSS** - Utility-first styling
- **Context API** - State management
- **React Icons** - Beautiful iconography

### Backend
- **Node.js + Express.js** - Robust web framework
- **MongoDB Atlas** - Cloud database
- **JWT + bcrypt** - Secure authentication
- **Razorpay API** - Payment integration

### Blockchain
- **Custom Proof-of-Work** - SHA256 mining algorithm
- **Mempool Management** - Transaction queue
- **Chain Validation** - Integrity verification
- **Token Economy** - Mining rewards system

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- MongoDB Atlas account
- Razorpay account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd blockchain-bus-pass
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env  # Add your environment variables
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

4. **Environment Configuration**
   Create `.env` files in both `backend/` and `frontend/` directories with appropriate variables.

## 📋 API Documentation

### Authentication
```
POST /api/auth/register - User registration
POST /api/auth/login    - User login
GET  /api/auth/profile  - Get user profile
```

### User Routes
```
POST /api/user/passes/create      - Create new bus pass
GET  /api/user/passes/latest      - Get latest pass
GET  /api/user/passes/history     - Get pass history
POST /api/user/permissions/request - Request mining permission
```

### Admin Routes
```
GET  /api/admin/mempool              - Get pending transactions
POST /api/admin/mine                 - Mine new block
GET  /api/admin/blocks               - Get blockchain data
GET  /api/admin/mining-requests      - Get mining requests
PUT  /api/admin/mining-requests/:id/approve - Approve request
PUT  /api/admin/mining-requests/:id/reject  - Reject request
```

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://...
JWT_SECRET=your-jwt-secret
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
```

## �️ User Roles & Permissions

### Regular Users
- ✅ Create and manage bus passes
- ✅ View QR codes and pass history
- ✅ Request mining permissions
- ✅ Explore blockchain data
- ⚠️ Cannot mine blocks without approval

### Approved Miners
- ✅ All regular user features
- ✅ Access to mining interface
- ✅ Mine blocks for token rewards
- ✅ Mempool transaction viewing

### Administrators
- ✅ All miner features
- ✅ Review mining permission requests
- ✅ Approve/reject mining requests
- ✅ Transfer tokens to users
- ✅ Full system management

## 💰 Economic Model

- **Mining Reward**: 2 tokens per block mined
- **Pass Cost**: 1 token or ₹100 via Razorpay
- **Token Utility**: Digital currency for transit payments
- **Incentive System**: Mining creates economic participation

## 🔒 Security

- **JWT Authentication**: Secure stateless authentication
- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Configured for production deployment
- **Environment Isolation**: Sensitive data in environment variables

## 📱 Responsive Design

- **Mobile-First**: Optimized for phones and tablets
- **Desktop Support**: Full functionality on laptops/desktops
- **Progressive Enhancement**: Works without JavaScript enabled
- **Cross-Browser**: Tested on modern browsers

## 🚀 Deployment

### Backend Deployment
```bash
# Build for production
npm run build

# Start production server
npm start
```

### Frontend Deployment
```bash
# Build for production
npm run build

# Serve static files
npm run preview
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋 Support

For support, email support@blockbus.com or join our community Discord.

## 📰 Changelog

### v1.0.0 (Current)
- Complete blockchain integration
- Mining permission system
- Payment gateway integration
- Admin control panel
- Mobile-responsive UI
- Production-ready deployment

---

**Made with ❤️ for the future of public transportation**

*Blockchain Bus Pass System - Revolutionizing Transit, One Block at a Time* 🚇🔗🚀
