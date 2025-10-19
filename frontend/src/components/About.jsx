import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-20">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">About Blockchain Bus Pass</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Revolutionizing public transportation through decentralized blockchain technology, 
              ensuring security, transparency, and efficiency for millions of daily commuters.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-16">
        {/* Mission Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-lg text-gray-700 mb-6">
              To transform urban mobility by leveraging blockchain technology to create a secure, 
              transparent, and efficient public transportation system that serves everyone.
            </p>
            <p className="text-lg text-gray-700">
              We believe in making daily commutes hassle-free while ensuring every transaction 
              is permanently recorded and verifiable on an immutable blockchain.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
            <div className="h-12 w-12 bg-gray-900 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Innovation in Transit</h3>
            <p className="text-gray-700">
              Combining cutting-edge blockchain technology with everyday public transportation 
              to create a seamless experience for commuters and operators alike.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Why Choose Our System?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 text-center hover:shadow-xl transition-shadow duration-300">
              <div className="h-16 w-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Military-Grade Security</h3>
              <p className="text-gray-700">
                Every transaction is cryptographically secured and permanently recorded on an 
                immutable blockchain, preventing fraud and ensuring data integrity.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 text-center hover:shadow-xl transition-shadow duration-300">
              <div className="h-16 w-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Instant Verification</h3>
              <p className="text-gray-700">
                QR codes are instantly verifiable against the blockchain, eliminating delays 
                and ensuring smooth boarding experiences for all passengers.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 text-center hover:shadow-xl transition-shadow duration-300">
              <div className="h-16 w-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Decentralized Mining</h3>
              <p className="text-gray-900">
                Users can participate in blockchain mining, earn tokens, and contribute to 
                network security while supporting the transportation ecosystem.
              </p>
            </div>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="bg-gray-900 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold text-center mb-12">Technology Stack</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="h-20 w-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-gray-900">⛓️</span>
              </div>
              <h4 className="font-semibold text-lg mb-2">Blockchain</h4>
              <p className="text-gray-300 text-sm">Immutable ledger technology</p>
            </div>
            <div>
              <div className="h-20 w-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-gray-900">🔐</span>
              </div>
              <h4 className="font-semibold text-lg mb-2">SHA256</h4>
              <p className="text-gray-300 text-sm">Cryptographic hashing</p>
            </div>
            <div>
              <div className="h-20 w-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-gray-900">⚡</span>
              </div>
              <h4 className="font-semibold text-lg mb-2">React</h4>
              <p className="text-gray-300 text-sm">Modern frontend framework</p>
            </div>
            <div>
              <div className="h-20 w-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-gray-900">🗄️</span>
              </div>
              <h4 className="font-semibold text-lg mb-2">MongoDB</h4>
              <p className="text-gray-300 text-sm">Database management</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to Get Started?</h2>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
            Join thousands of commuters who have already experienced the future of public transportation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/dashboard"
              className="inline-flex items-center px-8 py-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Go to Dashboard
            </Link>
            <Link
              to="/explorer"
              className="inline-flex items-center px-8 py-4 bg-white text-gray-900 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 transform hover:scale-105"
            >
              Explore Blockchain
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;