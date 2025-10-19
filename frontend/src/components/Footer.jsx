import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="flex-shrink-0">
              <span className="text-xl font-bold text-gray-900">🚇 Blockchain Bus Pass</span>
            </div>
            <p className="ml-3 text-sm text-gray-500">
              Revolutionizing public transportation with blockchain technology
            </p>
          </div>

          <div className="flex items-center space-x-6">
            <div className="text-sm text-gray-500">
              © 2025 BlockBus. All rights reserved.
            </div>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                🔒 Secure
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                ⛏️ Blockchain
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                🚇 Public Transit
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 border-t border-gray-200 pt-4 text-center">
          <p className="text-xs text-gray-400">
            Powered by{' '}
            <span className="font-medium text-indigo-600">Proof-of-Work Consensus</span>
            {' • '}
            <span className="font-medium text-green-600">SHA256 Hashing</span>
            {' • '}
            <span className="font-medium text-blue-600">MongoDB Atlas</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
