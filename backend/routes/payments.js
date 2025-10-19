const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

const { authenticateToken } = require('../middleware/auth');
const Payment = require('../models/Payment');
const Pass = require('../models/Pass');
const User = require('../models/User');

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create Razorpay order
// @route   POST /api/payments/order
// @access  Private
router.post('/order', authenticateToken, async (req, res) => {
  const { amount, currency = 'INR' } = req.body;
  const userId = req.user._id;

  if (!amount || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid amount' });
  }

  const options = {
    amount: Math.floor(amount * 100), // convert rupees to paise, ensure integer
    currency,
    receipt: `receipt_${Date.now()}`,
  };

  try {
    const order = await razorpay.orders.create(options);

    // Create payment record in database
    const paymentId = uuidv4();
    const payment = new Payment({
      paymentId,
      userId,
      passId: null, // Will be updated after pass creation
      amount,
      currency,
      status: 'created',
      razorpayOrderId: order.id,
    });

    await payment.save();

    res.json({
      success: true,
      message: 'Payment order created successfully',
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID,
        paymentId: paymentId
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to create Razorpay order',
      error: error.message
    });
  }
});

// Verify payment and create bus pass
router.post('/verify', authenticateToken, [
  body('razorpay_order_id').exists().withMessage('Order ID required'),
  body('razorpay_payment_id').exists().withMessage('Payment ID required'),
  body('razorpay_signature').exists().withMessage('Signature required'),
  body('passData').exists().withMessage('Pass data required'),
  body('passData.name').exists().withMessage('Pass name required'),
  body('passData.route').exists().withMessage('Pass route required'),
  body('passData.aadhar').exists().withMessage('Aadhar required'),
  body('passData.expiryDate').exists().withMessage('Expiry date required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      passData
    } = req.body;

    const userId = req.user._id;

    // Verify payment signature
    const generated_signature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    // Mark payment as successful
    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id, userId });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    payment.status = 'paid';
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.signature = razorpay_signature;

    // Create bus pass (logic moved here from user.js to handle paid passes)
    const cryptoJS = require('crypto-js');
    const QRCode = require('qrcode');

    const { name, route, aadhar, expiryDate } = passData;

    // Generate pass ID and hash
    const passId = uuidv4();
    const passDataString = `${passId}${name}${route}${aadhar}${expiryDate}${userId}`;
    const saltSecret = process.env.SALT_SECRET || 'blockchain-bus-pass-2025';
    const passHash = cryptoJS.SHA256(passDataString + saltSecret).toString();

    // Generate QR code data
    const qrData = JSON.stringify({
      passId,
      passHash,
      userId,
      timestamp: new Date().toISOString()
    });

    // Create QR code
    const qrDataUri = await QRCode.toDataURL(qrData);

    // Create pass in database
    const pass = new Pass({
      _id: passId,
      userId,
      name,
      route,
      aadharHash: cryptoJS.SHA256(aadhar).toString(),
      expiryDate: new Date(expiryDate),
      qrDataUri,
      passHash,
      mined: false,
      paymentId: payment._id
    });

    await pass.save();

    // Update payment with pass ID
    payment.passId = passId;
    await payment.save();

    // Update user with latest QR
    await User.findByIdAndUpdate(userId, { latestQrUri: qrDataUri });

    // Add transaction to mempool
    const blockchain = req.app.locals.blockchain;
    await blockchain.addTransaction({
      txId: uuidv4(),
      type: 'buspass',
      passId,
      passHash,
      to: userId.toString(),
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Payment verified and bus pass created successfully',
      pass: {
        id: passId,
        name: pass.name,
        route: pass.route,
        expiryDate: pass.expiryDate,
        qrDataUri: pass.qrDataUri,
        passHash: pass.passHash,
        mined: false,
        status: 'pending_mining'
      }
    });

  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message
    });
  }
});

// Verify QR code (conductor endpoint)
const verifyQR = async (req, res) => {
  try {
    const { passId, passHash, userId } = req.body;

    if (!passId || !passHash) {
      return res.status(400).json({
        success: false,
        message: 'Invalid QR code data'
      });
    }

    // Get pass from database
    const pass = await Pass.findById(passId);
    if (!pass) {
      return res.status(404).json({
        success: false,
        message: 'Bus pass not found'
      });
    }

    // Check if pass is mined (confirmed)
    if (!pass.mined) {
      return res.status(400).json({
        success: false,
        message: 'Bus pass not yet confirmed on blockchain'
      });
    }

    // Check expiry
    if (new Date() > new Date(pass.expiryDate)) {
      return res.status(400).json({
        success: false,
        message: 'Bus pass has expired'
      });
    }

    // Verify hash exists in blockchain
    const blockchain = req.app.locals.blockchain;
    const isValidOnChain = await blockchain.isPassValid(passHash);

    if (!isValidOnChain) {
      return res.status(400).json({
        success: false,
        message: 'Bus pass verification failed - not found on blockchain'
      });
    }

    res.json({
      success: true,
      message: 'Bus pass verified successfully!',
      pass: {
        id: pass._id,
        name: pass.name,
        route: pass.route,
        expiryDate: pass.expiryDate,
        verified: true
      }
    });

  } catch (error) {
    console.error('Verify QR error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify QR code',
      error: error.message
    });
  }
};

// Public QR verification endpoint (no auth needed)
router.post('/verify-qr', verifyQR);

// Verify pass endpoint (for existing passes)
router.post('/passes/verify', async (req, res) => {
  await verifyQR(req, res);
});

module.exports = router;
