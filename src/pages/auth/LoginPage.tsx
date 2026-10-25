import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Wrench, AlertCircle, CheckCircle2, Shield, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import QronosCard from '../../components/ui/QronosCard';
import QronosGuidelines from '../../components/ui/QronosGuidelines';
import StarButton from '../../components/ui/StarButton';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');

  const redirect = searchParams.get('redirect') || '';

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError('');
    try {
      await login(data.email, data.password);
      navigate(redirect || '/');
    } catch (e) {
      setServerError(e instanceof Error ? e.message : 'Login failed. Please try again.');
    }
  };

  const DEV_ACCOUNTS = [
    { label: 'Customer', email: 'priya.sharma@example.com', pass: 'Customer@123' },
    { label: 'Worker', email: 'raju.plumber@example.com', pass: 'Worker@123' },
    { label: 'Admin', email: 'admin@kaamwala.example.com', pass: 'Admin@Secure123' },
  ];

  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col justify-center items-center p-4 sm:p-8 overflow-hidden selection:bg-primary-500 selection:text-white">
      <QronosGuidelines />

      {/* Ambient background light */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary-500/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Main Login Card with Qronos Architecture */}
      <div className="w-full max-w-md relative z-10">
        {/* Brand Top Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2.5 no-underline mb-3">
            <div className="size-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center glow-orange-sm">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-white">
              Kaam<span className="text-primary-500">Wala</span>
            </span>
          </Link>
          <h1 className="font-display text-2xl font-bold text-white tracking-tight">Access Portal</h1>
          <p className="text-xs text-white/50 mt-1">
            Sign in to coordinate bookings, track workers, or access admin telemetry.
          </p>
        </div>

        <QronosCard withTopRim withReticles className="p-6 sm:p-8">
          {/* Dev Quick Sign In helper */}
          <div className="mb-6 p-3 rounded-xl border border-white/[0.08] bg-white/[0.03] text-xs">
            <div className="flex items-center gap-1.5 text-white/50 font-mono text-[10px] uppercase mb-2">
              <span className="size-1.5 rounded-full bg-cyan-400" />
              Quick Demo Profiles
            </div>
            <div className="flex flex-wrap gap-2">
              {DEV_ACCOUNTS.map(acc => (
                <button
                  key={acc.label}
                  type="button"
                  className="px-2.5 py-1 rounded-lg border border-white/10 bg-white/[0.05] hover:bg-white/[0.1] text-[11px] font-mono text-white/80 hover:text-white transition-all cursor-pointer"
                  onClick={() => {
                    setServerError('');
                    login(acc.email, acc.pass).catch(() => {});
                  }}
                >
                  {acc.label} →
                </button>
              ))}
            </div>
          </div>

          {serverError && (
            <div className="alert-error mb-5 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div>
              <label htmlFor="email" className="form-label">Email Address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                className={errors.email ? 'form-input-error' : 'form-input'}
                {...register('email')}
              />
              {errors.email && (
                <p className="form-error"><AlertCircle className="w-3 h-3" />{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="form-label mb-0">Password</label>
                <Link to="/forgot-password" className="text-[11px] text-white/40 hover:text-white transition-colors no-underline">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`pr-10 ${errors.password ? 'form-input-error' : 'form-input'}`}
                  {...register('password')}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="form-error"><AlertCircle className="w-3 h-3" />{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              id="login-submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-lg shadow-primary-500/20 mt-2 cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating…
                </span>
              ) : (
                <>Sign In to Workspace <ArrowRight className="w-3.5 h-3.5" /></>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/[0.08] text-center text-xs text-white/50">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-400 font-semibold hover:text-primary-300 no-underline">
              Register now
            </Link>
          </div>
        </QronosCard>
      </div>
    </div>
  );
}
