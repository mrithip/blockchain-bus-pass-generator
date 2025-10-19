import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Help = () => {
  const [activeCategory, setActiveCategory] = useState('getting-started');
  const [searchQuery, setSearchQuery] = useState('');

  const faqCategories = {
    'getting-started': {
      title: 'Getting Started',
      icon: '🚀',
      questions: [
        {
          question: 'How do I create my first bus pass?',
          answer: 'Navigate to the "Create Pass" section in your dashboard, fill in your personal details, select your route, and confirm the creation. Your blockchain-verified pass will be generated instantly.'
        },
        {
          question: 'What information do I need to create a pass?',
          answer: 'You\'ll need your full name, Aadhar number (for verification), preferred route, and the expiry date for your pass. All information is securely stored and hashed.'
        },
        {
          question: 'How much does a bus pass cost?',
          answer: 'Each bus pass costs 1 token. If you don\'t have enough tokens, you can purchase them for ₹100 through our secure payment gateway.'
        }
      ]
    },
    'qr-codes': {
      title: 'QR Codes & Validation',
      icon: '📱',
      questions: [
        {
          question: 'Why is my QR code not working?',
          answer: 'If your QR code isn\'t working, ensure that: 1) The pass has been mined into a blockchain block, 2) The pass hasn\'t expired, 3) You have a stable internet connection for verification.'
        },
        {
          question: 'How long does it take for a QR code to become active?',
          answer: 'QR codes become active once the transaction is mined into a block. This usually takes 1-5 minutes depending on network activity.'
        },
        {
          question: 'Can I use the same QR code multiple times?',
          answer: 'No, each QR code is valid for a single journey. After use, you\'ll need to create a new pass for your next journey.'
        },
        {
          question: 'What if my phone battery dies?',
          answer: 'We recommend saving a screenshot of your QR code or printing it as a backup. The conductor can scan the static QR code image.'
        }
      ]
    },
    'blockchain': {
      title: 'Blockchain & Mining',
      icon: '⛓️',
      questions: [
        {
          question: 'What is blockchain mining in this system?',
          answer: 'Mining is the process of adding new transactions to the blockchain. Miners solve cryptographic puzzles to create new blocks and earn tokens as rewards.'
        },
        {
          question: 'How do I become a miner?',
          answer: 'Request mining permission through your dashboard. Once approved by an administrator, you can participate in mining blocks and earn 2 tokens per block mined.'
        },
        {
          question: 'Why is mining important for the system?',
          answer: 'Mining secures the network, processes transactions, and maintains the decentralized nature of the system. It ensures all passes are permanently recorded and verified.'
        },
        {
          question: 'How much can I earn from mining?',
          answer: 'Each successfully mined block earns you 2 tokens. The earning potential depends on network activity and your mining participation.'
        }
      ]
    },
    'tokens': {
      title: 'Tokens & Payments',
      icon: '💰',
      questions: [
        {
          question: 'What are tokens used for?',
          answer: 'Tokens are the currency of our platform. You need 1 token to create a bus pass. You can earn tokens through mining or purchase them directly.'
        },
        {
          question: 'How do I purchase more tokens?',
          answer: 'When creating a pass without sufficient tokens, you\'ll be prompted to purchase tokens through our secure Razorpay integration at ₹100 per token.'
        },
        {
          question: 'Can I transfer tokens to other users?',
          answer: 'Currently, token transfers between users are not enabled. Tokens are primarily for creating bus passes within your own account.'
        },
        {
          question: 'Do tokens expire?',
          answer: 'No, tokens do not expire. They remain in your account until used for creating bus passes.'
        }
      ]
    },
    'technical': {
      title: 'Technical Issues',
      icon: '🔧',
      questions: [
        {
          question: 'The app is loading slowly. What should I do?',
          answer: 'Try refreshing the page, clearing your browser cache, or switching to a better internet connection. The blockchain verification process can sometimes take a few moments.'
        },
        {
          question: 'I forgot my password. How can I reset it?',
          answer: 'Use the "Forgot Password" feature on the login page. You\'ll receive an email with instructions to reset your password securely.'
        },
        {
          question: 'Why can\'t I see my transaction in the blockchain?',
          answer: 'Transactions appear in the blockchain explorer once they are mined into a block. If it\'s taking longer than expected, check the mempool for pending transactions.'
        },
        {
          question: 'The QR code scanner isn\'t working for conductors',
          answer: 'Ensure the conductor\'s device has a working camera, good lighting, and a stable internet connection. The QR code should be clearly visible on the screen.'
        }
      ]
    },
    'account': {
      title: 'Account Management',
      icon: '👤',
      questions: [
        {
          question: 'How do I update my personal information?',
          answer: 'Currently, personal information updates require administrative assistance. Please contact support if you need to change your registered details.'
        },
        {
          question: 'Can I have multiple accounts?',
          answer: 'No, each user should maintain only one account. Multiple accounts may lead to suspension as it violates our terms of service.'
        },
        {
          question: 'How do I delete my account?',
          answer: 'Account deletion can be requested by contacting our support team. Note that blockchain transactions cannot be deleted due to the immutable nature of the technology.'
        },
        {
          question: 'Is my Aadhar information secure?',
          answer: 'Yes, your Aadhar number is securely hashed and stored. We never store the actual number in plain text and use industry-standard encryption.'
        }
      ]
    }
  };

  const allQuestions = Object.values(faqCategories).flatMap(category => 
    category.questions.map(q => ({ ...q, category: category.title }))
  );

  const filteredQuestions = searchQuery 
    ? allQuestions.filter(q => 
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqCategories[activeCategory].questions;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Help Center</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Find answers to common questions and learn how to make the most of Blockchain Bus Pass
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for help articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 shadow-2xl"
                />
                <svg 
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Categories */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                {Object.entries(faqCategories).map(([key, category]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setActiveCategory(key);
                      setSearchQuery('');
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center space-x-3 ${
                      activeCategory === key 
                        ? 'bg-gray-900 text-white shadow-lg transform scale-105' 
                        : 'text-gray-700 hover:bg-gray-100 hover:scale-102'
                    }`}
                  >
                    <span className="text-xl">{category.icon}</span>
                    <span className="font-medium">{category.title}</span>
                  </button>
                ))}
              </div>

              {/* Quick Support Card */}
              <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">Need More Help?</h4>
                <p className="text-blue-700 text-sm mb-3">
                  Can't find what you're looking for? Our support team is here to help.
                </p>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          </div>

          {/* FAQ Content */}
          <div className="lg:col-span-3">
            {searchQuery ? (
              /* Search Results */
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Search Results for "{searchQuery}"
                  </h2>
                  <span className="text-gray-600">
                    {filteredQuestions.length} result{filteredQuestions.length !== 1 ? 's' : ''} found
                  </span>
                </div>

                {filteredQuestions.length > 0 ? (
                  <div className="space-y-4">
                    {filteredQuestions.map((item, index) => (
                      <div key={index} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {item.category}
                            </span>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {item.question}
                            </h3>
                            <p className="text-gray-700 leading-relaxed">
                              {item.answer}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                    <p className="text-gray-600 mb-6">
                      Try different keywords or browse the categories for help.
                    </p>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors duration-200"
                    >
                      Clear Search
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Category Questions */
              <div>
                <div className="flex items-center space-x-4 mb-8">
                  <div className="h-12 w-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">{faqCategories[activeCategory].icon}</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {faqCategories[activeCategory].title}
                    </h2>
                    <p className="text-gray-600">
                      {filteredQuestions.length} question{filteredQuestions.length !== 1 ? 's' : ''} in this category
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {filteredQuestions.map((item, index) => (
                    <div key={index} className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-start">
                        <span className="flex-shrink-0 h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-1">
                          <span className="text-blue-600 text-sm font-bold">Q</span>
                        </span>
                        {item.question}
                      </h3>
                      <div className="flex items-start">
                        <span className="flex-shrink-0 h-6 w-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                          <span className="text-green-600 text-sm font-bold">A</span>
                        </span>
                        <p className="text-gray-700 leading-relaxed text-lg">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Still Need Help Section */}
            {!searchQuery && (
              <div className="mt-12 bg-gradient-to-r from-gray-900 to-blue-900 rounded-2xl p-8 text-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-2xl font-bold mb-4">Still need help?</h3>
                    <p className="text-gray-300 text-lg mb-6">
                      Our dedicated support team is available to assist you with any questions or issues you might have.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Link
                        to="/contact"
                        className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 transform hover:scale-105"
                      >
                        Contact Support
                      </Link>
                      <a
                        href="mailto:support@blockchainbuspass.com"
                        className="inline-flex items-center justify-center px-6 py-3 border border-white text-white rounded-xl font-semibold hover:bg-white hover:text-gray-900 transition-all duration-200"
                      >
                        Email Us
                      </a>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <div className="h-40 w-40 bg-blue-500 rounded-full flex items-center justify-center opacity-20">
                      <svg className="h-20 w-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;