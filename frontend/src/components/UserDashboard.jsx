import React, { useState, useEffect } from 'react';
import { userAPI } from '../api';
import { useAuth } from '../AuthContext';

const UserDashboard = () => {
  const [currentPass, setCurrentPass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [miningRequest, setMiningRequest] = useState(null);
  const [miningLoading, setMiningLoading] = useState(false);
  const [miningMessage, setMiningMessage] = useState('');

  const { user, updateUser } = useAuth();

  useEffect(() => {
    fetchCurrentPass();
    fetchMiningStatus();
  }, []);

  const fetchMiningStatus = async () => {
    try {
      const response = await userAPI.getMiningPermissionStatus();
      setMiningRequest(response.data.latestRequest);
    } catch (error) {
      console.error('Fetch mining status error:', error);
    }
  };

  const handleRequestMiningPermission = async () => {
    try {
      await userAPI.requestMiningPermission();
      setMiningMessage('Mining permission request submitted successfully!');
      setTimeout(() => setMiningMessage(''), 3000);
      fetchMiningStatus();
    } catch (error) {
      setMiningMessage(error.response?.data?.message || 'Failed to request mining permission');
      setTimeout(() => setMiningMessage(''), 3000);
    }
  };

  const handleMineBlock = async () => {
    try {
      setMiningLoading(true);
      setMiningMessage('');

      const response = await userAPI.mineBlock();
      setMiningMessage('Block mined successfully! You earned 2 tokens.');
      updateUser({ ...user, tokens: user.tokens + 2 });
      setTimeout(() => setMiningMessage(''), 5000);
    } catch (error) {
      setMiningMessage(error.response?.data?.message || 'Failed to mine block');
      setTimeout(() => setMiningMessage(''), 5000);
    } finally {
      setMiningLoading(false);
    }
  };

  const fetchCurrentPass = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getLatestPass();
      setCurrentPass(response.data.pass);
    } catch (error) {
      console.error('Fetch current pass error:', error);
      setError('Failed to load current pass');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading your QR code...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200">
          <div className="px-6 py-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">My QR Code</h1>
              <p className="mt-2 text-sm text-gray-600">
                Your latest blockchain-verified bus pass
              </p>
            </div>

            {/* Mining Interface - shown only for approved miners */}
            {currentPass?.canMine && (
              <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Mining Dashboard
                </h3>
                <p className="text-sm text-gray-700 mb-3">
                  Mine blocks and earn tokens. Each block gives you 2 tokens.
                </p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white p-3 rounded border border-gray-300">
                    <div className="text-2xl font-bold text-gray-900">{user?.tokens || 0}</div>
                    <div className="text-sm text-gray-600">Your Tokens</div>
                  </div>
                  <div className="bg-white p-3 rounded border border-gray-300">
                    <div className="text-2xl font-bold text-gray-900">2</div>
                    <div className="text-sm text-gray-600">Reward per Block</div>
                  </div>
                </div>

                <button
                  onClick={handleMineBlock}
                  disabled={miningLoading}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
                >
                  {miningLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Mining Block...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Mine New Block
                    </>
                  )}
                </button>

                {miningMessage && (
                  <div className="mt-3 text-sm">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      miningMessage.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {miningMessage}
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentPass ? (
              <div className="space-y-6">
                {/* QR Code Display */}
                <div className="flex justify-center">
                  <div className="bg-white p-4 border-2 border-gray-300 rounded-lg shadow-sm">
                    <img
                      src={currentPass.qrDataUri}
                      alt="Bus Pass QR Code"
                      className="w-64 h-64 object-contain"
                    />
                  </div>
                </div>

                {/* Pass Details */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-300">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">
                    Pass Details
                  </h3>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Name</dt>
                      <dd className="mt-1 text-sm text-gray-900">{currentPass.name}</dd>
                    </div>

                    <div>
                      <dt className="text-sm font-medium text-gray-500">Route</dt>
                      <dd className="mt-1 text-sm text-gray-900">{currentPass.route}</dd>
                    </div>

                    <div>
                      <dt className="text-sm font-medium text-gray-500">Issue Date</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(currentPass.purchaseDate || currentPass.createdAt).toLocaleDateString()}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-sm font-medium text-gray-500">Expiry Date</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(currentPass.expiryDate).toLocaleDateString()}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-sm font-medium text-gray-500">Status</dt>
                      <dd className="mt-1 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          currentPass.mined && !currentPass.expired
                            ? 'bg-green-100 text-green-800'
                            : currentPass.expired
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {currentPass.expired ? 'Expired' : currentPass.mined ? 'Active' : 'Pending Mining'}
                        </span>
                      </dd>
                    </div>

                    <div>
                      <dt className="text-sm font-medium text-gray-500">Blockchain Status</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {currentPass.mined ? `Mined in Block #${currentPass.blockIndex}` : 'Not yet mined'}
                      </dd>
                    </div>
                  </div>
                </div>

                {/* Status Messages */}
                {currentPass.expired && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-center">
                    <p className="text-sm">This pass has expired. Please create a new pass.</p>
                  </div>
                )}

                {!currentPass.mined && !currentPass.expired && (
                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md text-center">
                    <p className="text-sm">
                      This QR code is temporarily invalid. Wait for admin to mine the transaction into the blockchain.
                    </p>
                  </div>
                )}

                {currentPass.mined && !currentPass.expired && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-center">
                    <p className="text-sm">This pass is valid and verified on the blockchain!</p>
                  </div>
                )}

                {/* Instructions */}
                <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">How to use:</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Show this QR code to the conductor at the bus stop</li>
                    <li>• The conductor will scan it to verify your pass</li>
                    <li>• Make sure the pass hasn't expired</li>
                    <li>• One pass = One journey</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M12 15h4.01M12 21h4.01M12 12h4.01M12 15h4.01M12 21h4.01M12 12h4.01M12 15h4.01M12 21h4.01M12 12h4.01M12 15h4.01M12 21h4.01M12 12h4.01M12 15h4.01M12 21h4.01M12 12h4.01M12 15h4.01M12 21h4.01M12 12h4.01M12 15h4.01M12 21h4.01" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No Active Pass</h3>
                <p className="mt-2 text-gray-600">You don't have any active bus pass QR codes.</p>
                <div className="mt-6">
                  <a
                    href="/user/create-pass"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Create Your First Pass
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;