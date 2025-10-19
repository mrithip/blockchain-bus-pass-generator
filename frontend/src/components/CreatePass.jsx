import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import { userAPI, paymentAPI } from '../api';
import { useAuth } from '../AuthContext';

const CreatePass = () => {
  const [formData, setFormData] = useState({
    name: '',
    route: '',
    aadhar: '',
    expiryDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [qrCode, setQrCode] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentOrder, setPaymentOrder] = useState(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    loadRazorpayScript().then(setRazorpayLoaded);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setShowPayment(false);

    try {
      const result = await userAPI.createPass(formData);

      if (result.data.success) {
        setSuccess('Bus pass created successfully!');
        updateUser({ ...user, tokens: user.tokens - 1 });

        if (result.data.pass.qrDataUri) {
          setQrCode(result.data.pass.qrDataUri);
        }

        setTimeout(() => {
          navigate('/user/qr');
        }, 2000);
      } else {
        if (result.data.requiresPayment) {
          setShowPayment(true);
          await createPaymentOrder();
        } else {
          setError('Failed to create bus pass');
        }
      }
    } catch (error) {
      console.error('Create pass error:', error);
      const statusCode = error.response?.status;
      const errorData = error.response?.data;

      if (statusCode === 402 && errorData?.requiresPayment) {
        setShowPayment(true);
        await createPaymentOrder();
      } else {
        setError(errorData?.message || error.response?.data?.message || 'Failed to create bus pass');
      }
    } finally {
      setLoading(false);
    }
  };

  const createPaymentOrder = async () => {
    try {
      const result = await paymentAPI.createOrder(100);
      setPaymentOrder(result.data.order);
    } catch (error) {
      console.error('Create payment order error:', error);
      setError('Failed to create payment order');
    }
  };

  const handleRazorpayPayment = () => {
    if (!paymentOrder) return;

    const options = {
      key: paymentOrder.key,
      amount: paymentOrder.amount,
      currency: paymentOrder.currency,
      order_id: paymentOrder.id,
      name: 'Blockchain Bus Pass',
      description: 'Purchase Bus Pass',
      handler: async function (response) {
        await verifyPayment(response);
      },
      prefill: {
        name: user.name,
        email: user.email,
      },
      theme: {
        color: '#111827',
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const verifyPayment = async (response) => {
    try {
      setLoading(true);

      const verifyResult = await paymentAPI.verifyPayment({
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        passData: formData,
      });

      if (verifyResult.data.success) {
        setSuccess('Payment successful! Bus pass created.');
        setShowPayment(false);

        if (verifyResult.data.pass.qrDataUri) {
          setQrCode(verifyResult.data.pass.qrDataUri);
        }

        setTimeout(() => {
          navigate('/user/qr');
        }, 2000);
      }
    } catch (error) {
      console.error('Verify payment error:', error);
      setError(error.response?.data?.message || 'Payment verification failed');
    } finally {
      setLoading(false);
    }
  };

  const calculateExpiryDate = () => {
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
    return nextMonth.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200">
          <div className="px-6 py-8">
            <div className="mb-8 text-center">
              <div className="mx-auto h-12 w-12 bg-gray-900 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Create Bus Pass</h1>
              <p className="mt-2 text-sm text-gray-600">
                Generate a blockchain-verified bus pass QR code
              </p>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                {success}
              </div>
            )}

            {showPayment && (
              <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm">
                      Insufficient tokens! You need 1 token to create a bus pass.
                      Pay ₹100 to proceed immediately.
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    onClick={handleRazorpayPayment}
                    disabled={loading || !paymentOrder}
                    className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : 'Pay ₹100 with Razorpay'}
                  </button>
                </div>
              </div>
            )}

            {qrCode && (
              <div className="mb-6 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Your Bus Pass QR Code</h3>
                <img src={qrCode} alt="Bus Pass QR Code" className="mx-auto border border-gray-300 rounded-lg" />
                <p className="mt-2 text-sm text-gray-600">
                  This QR code is valid until {new Date(formData.expiryDate).toLocaleDateString()}
                </p>
              </div>
            )}

            {!qrCode && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      className="mt-1 focus:ring-gray-500 focus:border-gray-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="route" className="block text-sm font-medium text-gray-700">
                      Route
                    </label>
                    <select
                      name="route"
                      id="route"
                      required
                      className="mt-1 focus:ring-gray-500 focus:border-gray-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
                      value={formData.route}
                      onChange={handleChange}
                    >
                      <option value="">Select route</option>
                      <option value="A-B">Route A to B</option>
                      <option value="B-C">Route B to C</option>
                      <option value="C-D">Route C to D</option>
                      <option value="D-A">Route D to A</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="aadhar" className="block text-sm font-medium text-gray-700">
                      Aadhar Number
                    </label>
                    <input
                      type="text"
                      name="aadhar"
                      id="aadhar"
                      required
                      pattern="[0-9]{12}"
                      maxLength="12"
                      className="mt-1 focus:ring-gray-500 focus:border-gray-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
                      placeholder="12-digit Aadhar number"
                      value={formData.aadhar}
                      onChange={handleChange}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Your Aadhar will be securely hashed
                    </p>
                  </div>

                  <div>
                    <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      name="expiryDate"
                      id="expiryDate"
                      required
                      min={calculateExpiryDate()}
                      className="mt-1 focus:ring-gray-500 focus:border-gray-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
                      value={formData.expiryDate}
                      onChange={handleChange}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Minimum 1 month validity
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm">
                        <span className="font-medium">Cost: </span>
                        {user?.tokens > 0 ? (
                          <span className="text-green-600">1 token</span>
                        ) : (
                          <span className="text-red-600">₹100 (payment required)</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        Your balance: {user?.tokens} tokens
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
                  >
                    {loading ? 'Creating Pass...' : 'Create Bus Pass'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePass;