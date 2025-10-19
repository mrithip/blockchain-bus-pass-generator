import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { userAPI } from '../api';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [miningLoading, setMiningLoading] = useState(false);
  const [miningMessage, setMiningMessage] = useState('');

  const handleRequestMiningPermission = async () => {
    try {
      setMiningLoading(true);
      await userAPI.requestMiningPermission();
      setMiningMessage('Mining permission request submitted successfully!');
      setTimeout(() => setMiningMessage(''), 3000);
    } catch (error) {
      setMiningMessage(error.response?.data?.message || 'Failed to request mining permission');
      setTimeout(() => setMiningMessage(''), 3000);
    } finally {
      setMiningLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <div className="mx-auto h-16 w-16 bg-indigo-600 rounded-full flex items-center justify-center mb-6">
              <span className="text-white text-2xl">🚇</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 text-center">Dashboard</h1>
            <p className="mt-4 text-lg text-gray-600 text-center max-w-2xl mx-auto">
              Welcome back, <span className="font-semibold text-indigo-600">{user?.name}</span>!
              Manage your blockchain bus passes and explore the decentralized network.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Token Balance Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Token Balance
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {user?.tokens} tokens
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <span className="font-medium text-indigo-600 hover:text-indigo-500 cursor-pointer">
                    1 token = 1 free bus pass
                  </span>
                </div>
              </div>
            </div>

            {/* Create Pass Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Create New Pass
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        Generate QR Code
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <button
                  onClick={() => navigate('/user/create-pass')}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Get started →
                </button>
              </div>
            </div>

            {/* My QR Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M12 15h4.01M12 21h4.01M12 12h4.01M12 15h4.01M12 21h4.01M12 12h4.01M12 15h4.01M12 21h4.01M12 12h4.01M12 15h4.01M12 21h4.01M12 12h4.01M12 15h4.01M12 21h4.01M12 12h4.01M12 15h4.01M12 21h4.01" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        My QR Code
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        Latest Valid Pass
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <button
                  onClick={() => navigate('/user/qr')}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  View QR →
                </button>
              </div>
            </div>

            {/* Pass History */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Pass History
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        Previous Passes
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <button
                  onClick={() => navigate('/user/history')}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  View history →
                </button>
              </div>
            </div>

            {/* Blockchain Explorer */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Blockchain Explorer
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        View Chain Data
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <button
                  onClick={() => navigate('/explorer')}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Explore →
                </button>
              </div>
            </div>

            {/* Request Mining Permission */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Mining Permission
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {user?.canMine ? 'Approved' : 'Request Access'}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                {user?.canMine ? (
                  <span className="text-sm font-medium text-green-600">
                    ✓ Mining enabled
                  </span>
                ) : (
                  <button
                    onClick={handleRequestMiningPermission}
                    disabled={miningLoading}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500 disabled:text-gray-400"
                  >
                    {miningLoading ? 'Requesting...' : 'Request permission →'}
                  </button>
                )}
                {miningMessage && (
                  <div className="mt-1 text-xs text-blue-600">
                    {miningMessage}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
