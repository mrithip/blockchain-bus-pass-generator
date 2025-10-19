const mongoose = require('mongoose');

const mempoolSchema = new mongoose.Schema({
  txId: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    required: true,
    enum: ['buspass', 'token_transfer']
  },
  passId: {
    type: String,
    default: null
  },
  passHash: {
    type: String,
    required: true
  },
  from: {
    type: String,
    default: null // For token transfers
  },
  to: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    default: 0 // For token transfers
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Mempool', mempoolSchema);
