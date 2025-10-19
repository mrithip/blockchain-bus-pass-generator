const crypto = require('crypto-js');
const { v4: uuidv4 } = require('uuid');
const Block = require('../models/Block');
const Mempool = require('../models/Mempool');
const User = require('../models/User');

class Blockchain {
  constructor() {
    this.difficulty = 1; // Hash must start with this many zeros
    this.reward = 2; // Tokens per block
  }

  // Create genesis block (first block)
  async createGenesisBlock() {
    try {
      const existingBlock = await Block.findOne({ index: 0 });
      if (existingBlock) return existingBlock;

      const genesisBlock = new Block({
        index: 0,
        timestamp: new Date('2025-01-01T00:00:00Z'),
        transactions: [{
          txId: uuidv4(),
          type: 'genesis',
          passId: null,
          passHash: crypto.SHA256('GENESIS_BLOCK_' + process.env.SALT_SECRET).toString(),
          to: 'SYSTEM',
          from: null,
          amount: 0
        }],
        previousHash: '0',
        hash: this.calculateHash(0, '2025-01-01T00:00:00Z', [], '0', 0),
        nonce: 0,
        miner: 'SYSTEM',
        reward: 0
      });

      await genesisBlock.save();
      return genesisBlock;
    } catch (error) {
      console.error('Error creating genesis block:', error);
      throw error;
    }
  }

  // Calculate hash for block
  calculateHash(index, timestamp, transactions, previousHash, nonce) {
    const data = index + timestamp + JSON.stringify(transactions) + previousHash + nonce;
    return crypto.SHA256(data).toString();
  }

  // Get latest block
  async getLatestBlock() {
    return await Block.findOne().sort({ index: -1 });
  }

  // Add transaction to mempool
  async addTransaction(tx) {
    try {
      const mempoolTx = new Mempool(tx);
      await mempoolTx.save();
      return mempoolTx;
    } catch (error) {
      console.error('Error adding transaction to mempool:', error);
      throw error;
    }
  }

  // Mine pending transactions
  async minePendingTransactions(minerAddress) {
    try {
      // Get pending transactions from mempool
      const pendingTransactions = await Mempool.find().sort({ timestamp: 1 }).limit(10);
      if (pendingTransactions.length === 0) {
        throw new Error('No transactions to mine');
      }

      // Get latest block
      const latestBlock = await this.getLatestBlock();
      const newBlockIndex = latestBlock.index + 1;

      // Mine new block
      const minedBlock = await this.mineBlock(newBlockIndex, pendingTransactions, latestBlock.hash, minerAddress);

      // Save the mined block
      const block = new Block(minedBlock);
      await block.save();

      // Remove mined transactions from mempool
      for (const tx of pendingTransactions) {
        await Mempool.findByIdAndDelete(tx._id);
      }

      // Reward the miner
      await User.findByIdAndUpdate(minerAddress, { $inc: { tokens: this.reward } });

      return block;
    } catch (error) {
      console.error('Error mining block:', error);
      throw error;
    }
  }

  // Mine a block (Proof of Work)
  async mineBlock(index, transactions, previousHash, minerAddress) {
    let nonce = 0;
    const timestamp = new Date().toISOString();

    while (true) {
      const hash = this.calculateHash(index, timestamp, transactions, previousHash, nonce);

      if (hash.startsWith('0'.repeat(this.difficulty))) {
        return {
          index,
          timestamp,
          transactions,
          previousHash,
          hash,
          nonce,
          miner: minerAddress,
          reward: this.reward
        };
      }

      nonce++;
    }
  }

  // Check if blockchain is valid
  async isChainValid() {
    try {
      const blocks = await Block.find().sort({ index: 1 });

      for (let i = 1; i < blocks.length; i++) {
        const currentBlock = blocks[i];
        const previousBlock = blocks[i - 1];

        // Check if hash is correct
        const calculatedHash = this.calculateHash(
          currentBlock.index,
          currentBlock.timestamp,
          currentBlock.transactions,
          currentBlock.previousHash,
          currentBlock.nonce
        );

        if (currentBlock.hash !== calculatedHash) {
          return false;
        }

        // Check if previous hash matches
        if (currentBlock.previousHash !== previousBlock.hash) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error validating chain:', error);
      return false;
    }
  }

  // Check if a pass hash exists in blockchain
  async isPassValid(passHash) {
    try {
      const block = await Block.findOne({
        'transactions.passHash': passHash
      });

      return !!block;
    } catch (error) {
      console.error('Error checking pass validity:', error);
      return false;
    }
  }

  // Get block by index
  async getBlockByIndex(index) {
    return await Block.findOne({ index });
  }

  // Get all blocks
  async getAllBlocks() {
    return await Block.find().sort({ index: -1 });
  }

  // Get mempool transactions
  async getMempool() {
    return await Mempool.find().sort({ timestamp: -1 });
  }
}

module.exports = Blockchain;
