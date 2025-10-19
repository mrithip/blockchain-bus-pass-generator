import React, { useState, useEffect } from 'react';
import { userAPI } from '../api';

const PassHistory = () => {
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPassHistory();
  }, []);

  const fetchPassHistory = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getPassHistory();
      setPasses(response.data.passes || []);
    } catch (error) {
      console.error('Fetch pass history error:', error);
      setError('Failed to load pass history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (pass) => {
    if (!pass.mined) return 'bg-yellow-100 text-yellow-800';
    if (new Date() > new Date(pass.expiryDate)) return 'bg-red-100 text-red-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (pass) => {
    if (!pass.mined) return 'Pending Mining';
    if (new Date() > new Date(pass.expiryDate)) return 'Expired';
    return 'Active';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading your pass history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Pass History</h1>
          <p className="mt-2 text-sm text-gray-600">
            View all your blockchain-verified bus passes
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Your Bus Passes
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              All passes issued to you with their blockchain verification status
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pass ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issue Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expiry Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Blockchain
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {passes.map((pass) => (
                  <tr key={pass.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      {pass.id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {pass.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {pass.route}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(pass.purchaseDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(pass.expiryDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(pass)}`}>
                        {getStatusText(pass)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {pass.mined ? `Block #${pass.blockIndex}` : 'Not mined'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {pass.qrDataUri && (
                        <button
                          onClick={() => {
                            // Create a temporary anchor element to download the QR
                            const link = document.createElement('a');
                            link.href = pass.qrDataUri;
                            link.download = `bus-pass-${pass.id.substring(0, 8)}.png`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Download QR
                        </button>
                      )}
                      <button
                        onClick={() => {
                          // Show QR in modal or new window
                          const newWindow = window.open();
                          newWindow.document.write(`
                            <html>
                              <head><title>Bus Pass QR Code</title></head>
                              <body style="display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0;">
                                <div style="text-align: center;">
                                  <h1>Bus Pass QR Code</h1>
                                  <img src="${pass.qrDataUri}" alt="QR Code" style="max-width: 400px; width: 100%;" />
                                  <p>Pass ID: ${pass.id}</p>
                                  <p>Name: ${pass.name}</p>
                                  <p>Route: ${pass.route}</p>
                                  <p>Valid until: ${new Date(pass.expiryDate).toLocaleDateString()}</p>
                                </div>
                              </body>
                            </html>
                          `);
                        }}
                        className="text-green-600 hover:text-green-900"
                      >
                        View QR
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {passes.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No passes found</h3>
              <p className="mt-2 text-gray-600">You haven't created any bus passes yet.</p>
              <div className="mt-6">
                <a
                  href="/user/create-pass"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Create Your First Pass
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PassHistory;
