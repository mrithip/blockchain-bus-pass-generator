const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Delay MongoDB operations in test mode to simulate latency
const TEST_MONGO_LATENCY_MS = parseInt(process.env.TEST_MONGO_LATENCY_MS, 10) || 0;
if (TEST_MONGO_LATENCY_MS > 0) {
  mongoose.plugin((schema) => {
    const delay = function (next) {
      setTimeout(next, TEST_MONGO_LATENCY_MS);
    };
    ['save', 'validate', 'find', 'findOne', 'findOneAndUpdate', 'updateOne', 'updateMany', 'deleteOne', 'deleteMany'].forEach((hook) => {
      schema.pre(hook, delay);
    });
  });
}

// Import models and blockchain after latency plugin is attached
const User = require('./models/User');
const Pass = require('./models/Pass');
const Payment = require('./models/Payment');
const Blockchain = require('./blockchain/Blockchain');

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payments');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'Content-Type']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const REQUEST_TIMEOUT_MS = parseInt(process.env.REQUEST_TIMEOUT_MS, 10) || 25000;
app.use((req, res, next) => {
  req.setTimeout(REQUEST_TIMEOUT_MS, () => {
    if (!res.headersSent) {
      res.status(503).json({
        success: false,
        message: 'Service unavailable due to database timeout'
      });
    }
  });
  next();
});

// Initialize blockchain
const blockchain = new Blockchain();

// Database connection and server startup
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');

    // Create genesis block on startup
    await blockchain.createGenesisBlock();
    console.log('Genesis block created');

    // Create required indexes for data integrity and query performance
    const db = mongoose.connection.db;
    await Promise.all([
      db.collection('users').createIndex({ email: 1 }, { unique: true }),
      db.collection('payments').createIndex({ paymentId: 1 }, { unique: true }),
      db.collection('blocks').createIndex({ index: 1 }, { unique: true }),
      db.collection('mempools').createIndex({ txId: 1 }, { unique: true }),
    ]);
    console.log('Database indexes created and verified successfully');

    // Start server after database is fully ready
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Database connection or initialization error:', error);
    process.exit(1);
  }
};

startServer();

// Make blockchain available in all routes
app.locals.blockchain = blockchain;

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Blockchain Bus Pass API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});


// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down server...');
  await mongoose.connection.close();
  process.exit(0);
});

module.exports = app;
