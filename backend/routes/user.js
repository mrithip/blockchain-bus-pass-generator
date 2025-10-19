const express = require('express');
const crypto = require('crypto-js');
const QRCode = require('qrcode');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

const { authenticateToken, requireMiningPermission } = require('../middleware/auth');
const User = require('../models/User');
const Pass = require('../models/Pass');

const router = express.Router();

// Create bus pass
router.post('/passes/create', authenticateToken, [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('route').trim().isLength({ min: 2 }).withMessage('Route is required'),
  body('aadhar').isLength({ min: 12, max: 12 }).withMessage('Aadhar must be 12 digits'),
  body('expiryDate').isISO8601().withMessage('Valid expiry date required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { name, route, aadhar, expiryDate } = req.body;
    const userId = req.user._id;

    // Check token balance or prepare payment
    const user = await User.findById(userId);
    const hasTokens = user.tokens > 0;

    if (!hasTokens) {
      return res.status(402).json({
        success: false,
        message: 'Insufficient tokens. Please make a payment.',
        requiresPayment: true,
        error: 'PAYMENT_REQUIRED'
      });
    }

    // Generate pass ID and hash
    const passId = uuidv4();
    const passData = `${passId}${name}${route}${aadhar}${expiryDate}${userId}`;
    const saltSecret = process.env.SALT_SECRET || 'blockchain-bus-pass-2025';
    const passHash = crypto.SHA256(passData + saltSecret).toString();

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
      aadharHash: crypto.SHA256(aadhar).toString(),
      expiryDate: new Date(expiryDate),
      qrDataUri,
      passHash,
      mined: false
    });

    await pass.save();

    // Deduct token
    await User.findByIdAndUpdate(userId, {
      $inc: { tokens: -1 },
      latestQrUri: qrDataUri
    });

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
      message: 'Bus pass created successfully',
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
    console.error('Create pass error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create bus pass',
      error: error.message
    });
  }
});

// Get latest QR code
router.get('/passes/latest', authenticateToken, async (req, res) => {
  try {
    const pass = await Pass.findOne({
      userId: req.user._id,
      mined: true
    }).sort({ createdAt: -1 });

    if (!pass) {
      // If no mined pass, get the latest pass (even if not mined)
      const latestPass = await Pass.findOne({ userId: req.user._id })
        .sort({ createdAt: -1 });

      if (!latestPass) {
        return res.json({
          success: true,
          pass: null,
          message: 'No bus pass found'
        });
      }

      // Return latest pass even if not mined yet
      const isExpired = new Date() > new Date(latestPass.expiryDate);
      return res.json({
        success: true,
        pass: {
          id: latestPass._id,
          name: latestPass.name,
          route: latestPass.route,
          expiryDate: latestPass.expiryDate,
          qrDataUri: latestPass.qrDataUri,
          mined: latestPass.mined,
          expired: isExpired,
          status: isExpired ? 'expired' : latestPass.mined ? 'valid' : 'pending_mining',
          purchaseDate: latestPass.purchaseDate,
          createdAt: latestPass.createdAt,
          blockIndex: latestPass.blockIndex
        }
      });
    }

    // Check if pass is expired
    const isExpired = new Date() > new Date(pass.expiryDate);

    res.json({
      success: true,
      pass: {
        id: pass._id,
        name: pass.name,
        route: pass.route,
        expiryDate: pass.expiryDate,
        qrDataUri: pass.qrDataUri,
        mined: pass.mined,
        expired: isExpired,
        status: isExpired ? 'expired' : 'valid',
        purchaseDate: pass.purchaseDate,
        createdAt: pass.createdAt,
        blockIndex: pass.blockIndex
      }
    });

  } catch (error) {
    console.error('Get latest pass error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get latest pass',
      error: error.message
    });
  }
});

// Get pass history
router.get('/passes/history', authenticateToken, async (req, res) => {
  try {
    const passes = await Pass.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    const passHistory = passes.map(pass => ({
      id: pass._id,
      name: pass.name,
      route: pass.route,
      purchaseDate: pass.purchaseDate,
      expiryDate: pass.expiryDate,
      mined: pass.mined,
      blockIndex: pass.blockIndex,
      qrDataUri: pass.qrDataUri,
      expired: new Date() > new Date(pass.expiryDate)
    }));

    res.json({
      success: true,
      passes: passHistory
    });

  } catch (error) {
    console.error('Get pass history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pass history',
      error: error.message
    });
  }
});

// Request mining permission
router.post('/permissions/request', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    // Check if user already has an active mining request
    const hasActiveRequest = user.miningRequests.some(req => req.status === 'pending');

    if (hasActiveRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending mining permission request'
      });
    }

    // Check if user is already approved to mine
    if (user.canMine) {
      return res.status(400).json({
        success: false,
        message: 'You already have mining permission'
      });
    }

    // Add new mining request
    user.miningRequests.push({
      requestedAt: new Date(),
      status: 'pending'
    });

    await user.save();

    // TODO: Send notifications to all admins
    // This would typically trigger email notifications, WebSocket events, etc.

    res.json({
      success: true,
      message: 'Mining permission request submitted successfully'
    });

  } catch (error) {
    console.error('Request mining permission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to request mining permission',
      error: error.message
    });
  }
});

// Check mining permission status
router.get('/permissions/status', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    const latestRequest = user.miningRequests.length > 0 ?
      user.miningRequests[user.miningRequests.length - 1] : null;

    res.json({
      success: true,
      canMine: user.canMine,
      latestRequest: latestRequest
    });

  } catch (error) {
    console.error('Get mining permission status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get mining permission status',
      error: error.message
    });
  }
});

module.exports = router;
