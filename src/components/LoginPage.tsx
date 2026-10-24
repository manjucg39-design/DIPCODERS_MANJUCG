import React, { useState } from 'react';
import {
  Lock,
  Phone,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  User,
  Briefcase,
  Shield,
} from 'lucide-react';
import { apiClient, setCurrentUserId } from '../services/apiClient';
import { UserRole } from '../types';

interface LoginPageProps {
  onLoginSuccess: (role: UserRole, user: any) => void;
  onNavigateToRegister: () => void;
  onBackToHome: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onNavigateToRegister,
  onBackToHome,
}) => {
  const [identifier, setIdentifier] = useState('9845012345'); // Default: Customer Kavitha S.
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!identifier.trim()) {
      setErrorMessage('Please enter your mobile number or email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.loginUser({
        loginIdentifier: identifier.trim(),
        password,
      });

      setCurrentUserId(response.user.id);
      onLoginSuccess(response.user.role, response.user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (phone: string, role: UserRole) => {
    setIdentifier(phone);
    setPassword('password123');
    setLoading(true);
    setErrorMessage('');
    try {
      const response = await apiClient.loginUser({
        loginIdentifier: phone,
        password: 'password123',
      });
      setCurrentUserId(response.user.id);
      onLoginSuccess(role, response.user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto space-y-6">
        
        {/* Back Link & Brand Header */}
        <div className="text-center space-y-2">
          <button
            type="button"
            onClick={onBackToHome}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1 cursor-pointer"
          >
            ← Back to LocalFix Home
          </button>
          <div className="flex items-center justify-center gap-2">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-sm">
              LF
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">LocalFix Login</h1>
          </div>
          <p className="text-xs text-slate-500">
            Access your Customer or Worker Dashboard in Mysuru
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
          
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mobile Number or Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. 9845012345 or user@example.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Password
                </label>
                <span className="text-[11px] text-slate-400">Default demo: password123</span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-9 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <span>Logging in...</span>
              ) : (
                <>
                  <span>Sign In to LocalFix</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins for Hackathon Evaluators */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
              Quick 1-Click Demo Evaluation Accounts
            </div>
            <div className="grid grid-cols-1 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('9845012345', 'customer')}
                className="w-full py-1.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-lg font-semibold flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  <span>Customer: Kavitha S. (Gokulam)</span>
                </div>
                <span className="text-[10px] text-blue-600 font-mono">Customer Dashboard →</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('9845111222', 'worker')}
                className="w-full py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-lg font-semibold flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Worker: Basavaraju M. (Plumber)</span>
                </div>
                <span className="text-[10px] text-emerald-600 font-mono">Worker Dashboard →</span>
              </button>
            </div>
          </div>

          {/* Register Redirect */}
          <div className="text-center pt-2">
            <span className="text-xs text-slate-500">Don't have an account yet? </span>
            <button
              type="button"
              onClick={onNavigateToRegister}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer"
            >
              Create Customer or Worker Account
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
