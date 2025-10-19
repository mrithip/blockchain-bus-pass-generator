import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Your privacy is important to us. Learn how Blockchain Bus Pass collects, 
              uses, and protects your personal information.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-10 py-16">
        <div className="bg-white rounded-2xl shadow-lg p-12 border border-gray-200">
          {/* Last Updated */}
          <div className="mb-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-blue-800 text-sm">
              <strong>Last Updated:</strong> December 1, 2025
            </p>
          </div>

          {/* Introduction */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 mb-4">
              Welcome to Blockchain Bus Pass ("we," "our," or "us"). We are committed to protecting 
              your personal information and your right to privacy. This Privacy Policy explains how 
              we collect, use, disclose, and safeguard your information when you use our blockchain-based 
              public transportation platform.
            </p>
            <p className="text-gray-700">
              By using our services, you agree to the collection and use of information in accordance 
              with this policy. If you have any questions or concerns about our policy or our practices 
              with regards to your personal information, please contact us at privacy@blockchainbuspass.com.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Personal Information</h3>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li><strong>Account Information:</strong> Name, email address, and user preferences</li>
              <li><strong>Identity Verification:</strong> Aadhar number (securely hashed and stored)</li>
              <li><strong>Contact Details:</strong> Phone number and communication preferences</li>
              <li><strong>Payment Information:</strong> Transaction history and token balances</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Blockchain Data</h3>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li><strong>Transaction Records:</strong> All bus pass transactions are recorded on the blockchain</li>
              <li><strong>Public Keys:</strong> Cryptographic keys for transaction verification</li>
              <li><strong>Mining Activity:</strong> Records of block mining participation</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Automatically Collected Information</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li><strong>Usage Data:</strong> Platform interaction patterns and feature usage</li>
              <li><strong>Device Information:</strong> IP address, browser type, and operating system</li>
              <li><strong>Location Data:</strong> General location for service optimization</li>
            </ul>
          </section>

          {/* How We Use Your Information */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-xl">
                <h4 className="font-semibold text-gray-900 mb-2">Service Provision</h4>
                <p className="text-gray-700 text-sm">
                  To create and manage your blockchain-verified bus passes, process transactions, 
                  and maintain your account.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-xl">
                <h4 className="font-semibold text-gray-900 mb-2">Security & Verification</h4>
                <p className="text-gray-700 text-sm">
                  To verify your identity, prevent fraud, and ensure the security of our 
                  blockchain network.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-xl">
                <h4 className="font-semibold text-gray-900 mb-2">Communication</h4>
                <p className="text-gray-700 text-sm">
                  To send important updates about your account, service changes, and 
                  security notifications.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-xl">
                <h4 className="font-semibold text-gray-900 mb-2">Improvement & Analytics</h4>
                <p className="text-gray-700 text-sm">
                  To analyze usage patterns and improve our services, user experience, 
                  and platform performance.
                </p>
              </div>
            </div>
          </section>

          {/* Blockchain & Data Storage */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Blockchain Technology & Data Storage</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">Important Notice</h3>
              <p className="text-yellow-700">
                Due to the nature of blockchain technology, once data is recorded on the blockchain, 
                it cannot be altered or deleted. This ensures transaction integrity but means that 
                certain records are permanent.
              </p>
            </div>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">On-Chain Data</h3>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>Transaction hashes and timestamps</li>
              <li>Block creation and mining records</li>
              <li>Public wallet addresses</li>
              <li>Token transfer records</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Off-Chain Data</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Personal identification information</li>
              <li>User account details</li>
              <li>Encrypted private keys</li>
              <li>Service usage analytics</li>
            </ul>
          </section>

          {/* Data Sharing & Disclosure */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Sharing & Disclosure</h2>
            <p className="text-gray-700 mb-4">
              We do not sell, trade, or otherwise transfer your personally identifiable information 
              to third parties without your consent, except in the following circumstances:
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="h-6 w-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Legal Requirements</h4>
                  <p className="text-gray-700 text-sm">
                    When required by law, court order, or governmental regulations
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="h-6 w-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Service Providers</h4>
                  <p className="text-gray-700 text-sm">
                    Trusted partners who assist in operating our platform (under strict confidentiality)
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Business Transfers</h4>
                  <p className="text-gray-700 text-sm">
                    In connection with mergers, acquisitions, or sale of company assets
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Your Rights */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Privacy Rights</h2>
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Access & Correction</h4>
                  <p className="text-gray-700 text-sm">
                    You can access and update your personal information through your account settings.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Data Portability</h4>
                  <p className="text-gray-700 text-sm">
                    Request a copy of your personal data in a machine-readable format.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Deletion Rights</h4>
                  <p className="text-gray-700 text-sm">
                    Request deletion of your personal data, subject to legal and blockchain constraints.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Opt-Out Options</h4>
                  <p className="text-gray-700 text-sm">
                    Control marketing communications and certain data processing activities.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Security Measures */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Security Measures</h2>
            <p className="text-gray-700 mb-4">
              We implement robust security measures to protect your information:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>End-to-end encryption for all sensitive data</li>
              <li>Regular security audits and penetration testing</li>
              <li>Multi-factor authentication options</li>
              <li>Secure blockchain protocols with cryptographic verification</li>
              <li>Regular employee security training</li>
              <li>Incident response and data breach protocols</li>
            </ul>
          </section>

          {/* Contact Information */}
          <section className="bg-gray-900 text-white rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
            <p className="mb-4">
              If you have any questions about this Privacy Policy or our data practices, 
              please contact our Data Protection Officer:
            </p>
            <div className="space-y-2">
              <p><strong>Email:</strong> privacy@blockchainbuspass.com</p>
              <p><strong>Phone:</strong> +1 (555) 123-4567</p>
              <p><strong>Address:</strong> 123 Tech Park Drive, Innovation City, IC 12345</p>
            </div>
          </section>

          {/* Back to Dashboard */}
          <div className="mt-8 text-center">
            <Link
              to="/dashboard"
              className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all duration-200"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;