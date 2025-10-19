import React, { useState, useEffect } from 'react';
import { adminAPI } from '../api';
import { useAuth } from '../AuthContext';

const MempoolView = () => {
  const { refreshUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mining, setMining] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMempool();
  }, []);

  const fetchMempool = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getMempool();
      setTransactions(response.data.transactions || []);
    } catch (error) {
      console.error('Fetch mempool error:', error);
      setError('Failed to load mempool transactions');
    } finally {
      setLoading(false);
    }
  };

const handleMineBlock = async () => {
  if (transactions.length === 0) {
    alert('No transactions to mine');
    return;
  }

  try {
    setMining(true);
    alert('Mining started! This may take a few seconds...');

    const response = await adminAPI.mineBlock();

    // Refresh user data to get updated token balance
    await refreshUserData();

    alert(`🎉 Block #${response.data.block.index} mined successfully!\n\nYou earned ${response.data.miningReward} tokens!\n\n${response.data.block.transactions} transactions confirmed.`);

    // Refresh mempool
    fetchMempool();
  } catch (error) {
    console.error('Mine block error:', error);
    const errorMessage = error.response?.data?.message || error.message;
    alert(`❌ Mining failed: ${errorMessage}`);
  } finally {
    setMining(false);
  }
};

  const refreshMempool = () => {
    fetchMempool();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading pending transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mempool</h1>
            <p className="mt-2 text-sm text-gray-600">
              Pending transactions waiting to be mined into blocks
            </p>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={refreshMempool}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              🔄 Refresh
            </button>

            <button
              onClick={handleMineBlock}
              disabled={transactions.length === 0 || mining}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mining ? (
                <>
                  <span className="animate-spin mr-2">⛏️</span>
                  Mining...
                </>
              ) : (
                <>
                  ⛏️ Mine Block ({transactions.length} tx)
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Mempool Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-sm font-semibold text-white">💰</span>
              </div>
            </div>
            <div className="ml-4">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Pending Transactions
              </dt>
              <dd className="text-2xl font-semibold text-gray-900">
                {transactions.length}
              </dd>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-sm font-semibold text-white">🚇</span>
              </div>
            </div>
            <div className="ml-4">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Bus Passes
              </dt>
              <dd className="text-2xl font-semibold text-gray-900">
                {transactions.filter(tx => tx.type === 'buspass').length}
              </dd>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-yellow-500 flex items-center justify-center">
                <span className="text-sm font-semibold text-white">⏰</span>
              </div>
            </div>
            <div className="ml-4">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Reward Potential
              </dt>
              <dd className="text-2xl font-semibold text-gray-900">
                {transactions.length > 0 ? '2 tokens' : '0 tokens'}
              </dd>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Pending Transactions
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            These transactions will be included in the next mined block
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pass ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pass Hash
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recipient
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((tx, index) => (
                <tr key={tx.txId || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      tx.type === 'buspass'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {tx.type === 'buspass' ? '🚇 Bus Pass' : '💸 Transfer'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    {tx.txId?.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    {tx.passId ? `${tx.passId.substring(0, 8)}...` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-900 max-w-xs truncate">
                    {tx.passHash?.substring(0, 16)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    {tx.to?.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(tx.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {transactions.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No pending transactions</h3>
            <p className="mt-2 text-gray-600">
              The mempool is empty. New transactions will appear here when users create bus passes.
            </p>
            <div className="mt-6">
              <button
                onClick={refreshMempool}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Check for New Transactions
              </button>
            </div>
          </div>
        )}

        {/* Mining Explanation */}
        {transactions.length > 0 && (
          <div className="px-4 py-5 sm:px-6 bg-gray-50 border-t border-gray-200">
            <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Mining Process</h4>
              <div className="text-sm text-blue-700">
                <p className="mb-2">
                  Mining a block requires Proof-of-Work - finding a nonce that makes the block hash start with "0".
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
                  <div className="text-center">
                    <div className="text-lg">⛏️</div>
                    <div className="font-medium">Mine Block</div>
                    <div className="text-xs">Calculate hash with Proof-of-Work</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg">✅</div>
                    <div className="font-medium">Confirm Transactions</div>
                    <div className="text-xs">Add to blockchain permanently</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg">🎁</div>
                    <div className="font-medium">Earn Reward</div>
                    <div className="text-xs">Receive 2 tokens for mining</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MempoolView;
