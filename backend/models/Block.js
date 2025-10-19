const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  txId: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  passId: {
    type: String,
    default: null
  },
  passHash: {
    type: String,
    required: true
  },
  to: {
    type: String,
    required: true
  },
  from: {
    type: String,
    default: null
  },
  amount: {
    type: Number,
    default: 0
  }
});

const blockSchema = new mongoose.Schema({
  index: {
    type: Number,
    required: true,
    unique: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  transactions: [transactionSchema],
  previousHash: {
    type: String,
    required: true
  },
  hash: {
    type: String,
    required: true
  },
  nonce: {
    type: Number,
    required: true
  },
  miner: {
    type: String,
    required: true
  },
  reward: {
    type: Number,
    default: 2 // 2 tokens per block
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Block', blockSchema);
