const mongoose = require('mongoose');

const passSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  name: {
    type: String,
    required: true
  },
  route: {
    type: String,
    required: true
  },
  aadharHash: {
    type: String,
    required: true
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    required: true
  },
  qrDataUri: {
    type: String,
    required: true
  },
  passHash: {
    type: String,
    required: true
  },
  mined: {
    type: Boolean,
    default: false
  },
  blockIndex: {
    type: Number,
    default: null
  },
  paymentId: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Pass', passSchema);
