const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const User = require('../models/User');
const Pass = require('../models/Pass');

const router = express.Router();

// Get mempool transactions - users with mining permission can also access
router.get('/mempool', authenticateToken, async (req, res) => {
  // Allow access if user is admin or has mining permission
  if (req.user.role !== 'admin' && !req.user.canMine) {
    return res.status(403).json({
      success: false,
      message: 'Mining permission required to access mempool'
    });
  }
  try {
    const blockchain = req.app.locals.blockchain;
    const mempool = await blockchain.getMempool();

    res.json({
      success: true,
      transactions: mempool
    });

  } catch (error) {
    console.error('Get mempool error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get mempool',
      error: error.message
    });
  }
});

// Mine a block with selected transactions - users with mining permission can also mine
router.post('/mine', authenticateToken, async (req, res) => {
  // Allow access if user is admin or has mining permission
  if (req.user.role !== 'admin' && !req.user.canMine) {
    return res.status(403).json({
      success: false,
      message: 'Mining permission required'
    });
  }

  try {
    const { selectedTxIds } = req.body || {}; // Optional: specific tx IDs to mine

    const blockchain = req.app.locals.blockchain;
    const minerId = req.user._id.toString();

    // Mine block
    const block = await blockchain.minePendingTransactions(minerId);

    // Update pass statuses
    if (block.transactions) {
      for (const tx of block.transactions) {
        if (tx.type === 'buspass') {
          await Pass.findByIdAndUpdate(tx.passId, {
            mined: true,
            blockIndex: block.index
          });
        }
      }
    }

    // Award mining reward (2 tokens) to the miner
    const miningReward = 2;
    await User.findByIdAndUpdate(minerId, { $inc: { tokens: miningReward } });

    res.json({
      success: true,
      message: 'Block mined successfully!',
      block: {
        index: block.index,
        hash: block.hash,
        transactions: block.transactions.length,
        miner: block.miner,
        reward: block.reward
      },
      miningReward: miningReward
    });

  } catch (error) {
    console.error('Mine block error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mine block',
      error: error.message
    });
  }
});

// Get blockchain - all authenticated users can access blockchain explorer
router.get('/blocks', authenticateToken, async (req, res) => {
  try {
    const blockchain = req.app.locals.blockchain;
    const blocks = await blockchain.getAllBlocks();

    const formattedBlocks = blocks.map(block => ({
      index: block.index,
      timestamp: block.timestamp,
      hash: block.hash,
      previousHash: block.previousHash,
      nonce: block.nonce,
      miner: block.miner,
      reward: block.reward,
      transactionCount: block.transactions.length,
      transactions: block.transactions
    }));

    res.json({
      success: true,
      blocks: formattedBlocks,
      totalBlocks: formattedBlocks.length
    });

  } catch (error) {
    console.error('Get blocks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get blockchain',
      error: error.message
    });
  }
});

// Approve mining permission
router.post('/permissions/approve/:userId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.canMine = true;
    await user.save();

    res.json({
      success: true,
      message: `Mining permission granted to ${user.name}`
    });

  } catch (error) {
    console.error('Approve mining permission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve mining permission',
      error: error.message
    });
  }
});

// Transfer tokens to user
router.post('/tokens/sell', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId, amount } = req.body;

    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid userId and positive amount required'
      });
    }

    const admin = await User.findById(req.user._id);
    if (admin.tokens < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient admin tokens'
      });
    }

    // Transfer tokens
    await User.findByIdAndUpdate(req.user._id, { $inc: { tokens: -amount } });
    await User.findByIdAndUpdate(userId, { $inc: { tokens: amount } });

    res.json({
      success: true,
      message: `${amount} tokens transferred successfully`
    });

  } catch (error) {
    console.error('Token transfer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to transfer tokens',
      error: error.message
    });
  }
});

// Get all users
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.find({}, '-passwordHash').sort({ createdAt: -1 });

    const userList = users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      tokens: user.tokens,
      canMine: user.canMine,
      miningRequests: user.miningRequests,
      createdAt: user.createdAt
    }));

    res.json({
      success: true,
      users: userList
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users',
      error: error.message
    });
  }
});

// Get pending mining requests from all users
router.get('/mining-requests', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.find({ 'miningRequests.status': 'pending' }, 'name email miningRequests');

    const requests = [];
    users.forEach(user => {
      user.miningRequests.forEach(request => {
        if (request.status === 'pending') {
          requests.push({
            userId: user._id,
            userName: user.name,
            userEmail: user.email,
            requestedAt: request.requestedAt,
            status: request.status
          });
        }
      });
    });

    res.json({
      success: true,
      requests: requests.sort((a, b) => b.requestedAt - a.requestedAt)
    });

  } catch (error) {
    console.error('Get mining requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get mining requests',
      error: error.message
    });
  }
});

// Approve mining permission for a user
router.put('/mining-requests/:userId/approve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const adminId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find the pending request
    const pendingRequest = user.miningRequests.find(req => req.status === 'pending');
    if (!pendingRequest) {
      return res.status(400).json({
        success: false,
        message: 'No pending mining request found for this user'
      });
    }

    // Approve the request
    pendingRequest.status = 'approved';
    pendingRequest.approvedBy = adminId.toString();
    pendingRequest.approvedAt = new Date();

    // Set user's mining permission
    user.canMine = true;

    await user.save();

    res.json({
      success: true,
      message: `Mining permission granted to ${user.name}`
    });

  } catch (error) {
    console.error('Approve mining request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve mining request',
      error: error.message
    });
  }
});

// Reject mining permission for a user
router.put('/mining-requests/:userId/reject', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find the pending request
    const pendingRequest = user.miningRequests.find(req => req.status === 'pending');
    if (!pendingRequest) {
      return res.status(400).json({
        success: false,
        message: 'No pending mining request found for this user'
      });
    }

    // Reject the request
    pendingRequest.status = 'rejected';

    await user.save();

    res.json({
      success: true,
      message: `Mining permission request rejected for ${user.name}`
    });

  } catch (error) {
    console.error('Reject mining request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject mining request',
      error: error.message
    });
  }
});

// Blockchain validation
router.get('/validate-chain', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const blockchain = req.app.locals.blockchain;
    const isValid = await blockchain.isChainValid();

    res.json({
      success: true,
      valid: isValid,
      message: isValid ? 'Blockchain is valid' : 'Blockchain integrity compromised!'
    });

  } catch (error) {
    console.error('Validate chain error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate chain',
      error: error.message
    });
  }
});

module.exports = router;
