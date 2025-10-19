import React, { useState, useEffect } from 'react';
import { adminAPI } from '../api';
import { useAuth } from '../AuthContext';

const BlockchainExplorer = () => {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBlock, setSelectedBlock] = useState(null);
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchBlocks();
  }, []);

  const fetchBlocks = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getBlocks();
      setBlocks(response.data.blocks || []);
    } catch (error) {
      console.error('Fetch blocks error:', error);
      setError('Failed to load blockchain data');
    } finally {
      setLoading(false);
    }
  };

  const handleMineBlock = async () => {
    try {
      const response = await adminAPI.mineBlock();
      alert(`Block #${response.data.block.index} mined successfully! You earned ${response.data.block.reward} tokens.`);
      fetchBlocks();
    } catch (error) {
      console.error('Mine block error:', error);
      alert('Failed to mine block: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleValidateChain = async () => {
    try {
      const response = await adminAPI.validateChain();
      if (response.data.valid) {
        alert('Blockchain integrity verified!');
      } else {
        alert('Blockchain integrity compromised!');
      }
    } catch (error) {
      console.error('Validate chain error:', error);
      alert('Failed to validate chain');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading blockchain data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Blockchain Explorer</h1>
              <p className="mt-2 text-sm text-gray-600">View all blocks, transactions, and blockchain data</p>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleValidateChain}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Validate Chain
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Blocks List */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Blocks ({blocks.length})</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Blockchain blocks in reverse chronological order</p>
              </div>

              <ul className="divide-y divide-gray-200">
                {blocks.map((block) => (
                  <li key={block.index} className="px-4 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-900 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-white">{block.index}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">Block #{block.index}</div>
                          <div className="text-sm text-gray-500">{new Date(block.timestamp).toLocaleString()}</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {block.transactionCount} tx
                        </span>
                        <button
                          onClick={() => setSelectedBlock(selectedBlock?.index === block.index ? null : block)}
                          className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                        >
                          {selectedBlock?.index === block.index ? 'Hide' : 'Show'} Details
                        </button>
                      </div>
                    </div>

                    {/* Block Details */}
                    {selectedBlock?.index === block.index && (
                      <div className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Block Info</h4>
                            <dl className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <dt className="text-gray-500">Block Height:</dt>
                                <dd className="text-gray-900">{block.index}</dd>
                              </div>
                              <div className="flex justify-between text-sm">
                                <dt className="text-gray-500">Timestamp:</dt>
                                <dd className="text-gray-900">{new Date(block.timestamp).toLocaleString()}</dd>
                              </div>
                              <div className="flex justify-between text-sm">
                                <dt className="text-gray-500">Transactions:</dt>
                                <dd className="text-gray-900">{block.transactionCount}</dd>
                              </div>
                              <div className="flex justify-between text-sm">
                                <dt className="text-gray-500">Miner:</dt>
                                <dd className="text-gray-900 font-mono text-xs">{block.miner}</dd>
                              </div>
                              <div className="flex justify-between text-sm">
                                <dt className="text-gray-500">Reward:</dt>
                                <dd className="text-gray-900">{block.reward} tokens</dd>
                              </div>
                            </dl>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Hash Details</h4>
                            <div className="space-y-2">
                              <div>
                                <div className="text-xs text-gray-500">Block Hash</div>
                                <div className="text-xs font-mono bg-white p-2 rounded border border-gray-300 break-all">
                                  {block.hash}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500">Previous Hash</div>
                                <div className="text-xs font-mono bg-white p-2 rounded border border-gray-300 break-all">
                                  {block.previousHash}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Transactions */}
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Transactions</h4>
                          <div className="bg-white rounded border border-gray-300 overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Pass ID</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hash</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">To</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {block.transactions?.map((tx, idx) => (
                                  <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 text-sm text-gray-900">{tx.type}</td>
                                    <td className="px-4 py-2 text-sm font-mono text-gray-900">
                                      {tx.passId?.substring(0, 8)}...
                                    </td>
                                    <td className="px-4 py-2 text-sm font-mono text-gray-900">
                                      {tx.passHash?.substring(0, 16)}...
                                    </td>
                                    <td className="px-4 py-2 text-sm font-mono text-gray-900">
                                      {tx.to?.substring(0, 8)}...
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>

              {blocks.length === 0 && (
                <div className="text-center py-12">
                  <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No blocks found</h3>
                  <p className="mt-2 text-gray-600">Genesis block should be created automatically.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-6">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Blockchain Stats</h3>
              </div>

              <div className="px-4 py-5 sm:px-6">
                <dl className="grid grid-cols-1 gap-5">
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Total Blocks</dt>
                    <dd className="text-sm text-gray-900">{blocks.length}</dd>
                  </div>

                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Total Transactions</dt>
                    <dd className="text-sm text-gray-900">
                      {blocks.reduce((total, block) => total + (block.transactionCount || 0), 0)}
                    </dd>
                  </div>

                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Latest Block</dt>
                    <dd className="text-sm text-gray-900">
                      #{blocks[0]?.index || 'N/A'}
                    </dd>
                  </div>

                  {blocks[0] && (
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">Latest Time</dt>
                      <dd className="text-sm text-gray-900">
                        {new Date(blocks[0].timestamp).toLocaleDateString()}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">How Mining Works</h4>
              <ul className="text-xs text-gray-700 space-y-1">
                <li>• Each block requires Proof-of-Work</li>
                <li>• Hash must start with "0"</li>
                <li>• Miners earn 2 tokens per block</li>
                <li>• Transactions are permanently stored</li>
                <li>• Pass hashes verify authenticity</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockchainExplorer;
