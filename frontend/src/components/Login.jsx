import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { FiMail, FiLock } from 'react-icons/fi';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 relative bg-white rounded-3xl shadow-2xl p-10 border border-gray-300">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto h-16 w-16 bg-gray-900 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white text-2xl">🚇</span>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">Welcome Back!</h2>
          <p className="text-sm text-gray-700">
            Sign in to access your <span className="font-semibold text-gray-900">Blockchain Bus Pass</span> system
          </p>
        </div>

        {/* Form */}
        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Email */}
            <div className="relative">
              <FiMail className="absolute left-3 top-3 text-gray-500" size={20} />
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="Email address"
                className="pl-10 pr-3 py-3 w-full rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 placeholder-gray-400 transition-all"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <FiLock className="absolute left-3 top-3 text-gray-500" size={20} />
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="pl-10 pr-3 py-3 w-full rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 placeholder-gray-400 transition-all"
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-700 transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-700 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          {/* Extra Links */}
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <Link to="/forgot-password" className="hover:text-gray-900 transition-colors">
              {/* Forgot password? */}
            </Link>
            <Link to="/register" className="hover:text-gray-900 transition-colors">
              Create Account
            </Link>
          </div>

          {/* Social login placeholder */}
          {/* <div className="mt-6 text-center text-gray-500 text-sm">
            Or sign in with
          </div>
          <div className="flex justify-center gap-4 mt-2">
            <button className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all shadow">
              <span className="text-gray-900 font-bold">G</span>
            </button>
            <button className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all shadow">
              <span className="text-gray-900 font-bold">f</span>
            </button>
          </div> */}
        </form>
      </div>
    </div>
  );
};

export default Login;
