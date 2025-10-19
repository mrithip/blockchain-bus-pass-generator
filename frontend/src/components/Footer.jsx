import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-8xl mx-auto px-6 sm:px-8 lg:px-10 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-2xl font-bold">Blockchain Bus Pass</span>
            </div>
            <p className="text-gray-300 text-lg mb-6 max-w-md">
              Revolutionizing public transportation with secure, transparent, and efficient blockchain technology. 
              Making daily commutes smarter and more reliable.
            </p>
            <div className="flex space-x-4">
              <div className="bg-gray-800 px-4 py-2 rounded-lg">
                <span className="text-sm font-semibold text-green-400">🔒 Secure</span>
              </div>
              <div className="bg-gray-800 px-4 py-2 rounded-lg">
                <span className="text-sm font-semibold text-blue-400">⛓️ Blockchain</span>
              </div>
              <div className="bg-gray-800 px-4 py-2 rounded-lg">
                <span className="text-sm font-semibold text-purple-400">🚍 Public Transit</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors duration-200 text-base">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/explorer" className="text-gray-300 hover:text-white transition-colors duration-200 text-base">
                  Blockchain Explorer
                </Link>
              </li>
              <li>
                <Link to="/user/create-pass" className="text-gray-300 hover:text-white transition-colors duration-200 text-base">
                  Create Pass
                </Link>
              </li>
              <li>
                <Link to="/user/history" className="text-gray-300 hover:text-white transition-colors duration-200 text-base">
                  Pass History
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & About */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Support</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white transition-colors duration-200 text-base">
                  About Us
                </Link>
              </li>
              <li>
                <a href="/help" className="text-gray-300 hover:text-white transition-colors duration-200 text-base">
                  Help Center
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-300 hover:text-white transition-colors duration-200 text-base">
                  Contact Support
                </a>
              </li>
              <li>
                <a href="/privacypolicy" className="text-gray-300 hover:text-white transition-colors duration-200 text-base">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2025 Blockchain Bus Pass System. All rights reserved.
            </div>
            
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="text-sm text-gray-500">
              © 2025 Blockchain Bus Pass. All rights reserved.
            </div>
              <div className="flex space-x-3">
                <span className="text-xs bg-gray-800 px-3 py-1 rounded-full text-gray-300">Proof-of-Work</span>
                <span className="text-xs bg-gray-800 px-3 py-1 rounded-full text-gray-300">SHA256</span>
                <span className="text-xs bg-gray-800 px-3 py-1 rounded-full text-gray-300">MongoDB</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
