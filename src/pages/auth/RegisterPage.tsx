import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Wrench, AlertCircle, User, Briefcase, ArrowRight, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import QronosCard from '../../components/ui/QronosCard';
import QronosGuidelines from '../../components/ui/QronosGuidelines';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number').optional().or(z.literal('')),
  password: z
    .string()
    .min(8, 'Minimum 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  confirmPassword: z.string(),
  role: z.enum(['CUSTOMER', 'WORKER']),
  termsAccepted: z.boolean().refine(val => val === true, { message: 'You must accept the terms' }),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: registerUser, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');

  const defaultRole = (searchParams.get('role') || 'CUSTOMER') as 'CUSTOMER' | 'WORKER';

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: defaultRole, termsAccepted: false as unknown as true },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormData) => {
    setServerError('');
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone || undefined,
        role: data.role,
      });
      navigate(data.role === 'WORKER' ? '/worker' : '/customer');
    } catch (e) {
      setServerError(e instanceof Error ? e.message : 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col justify-center items-center p-4 sm:p-8 overflow-hidden selection:bg-primary-500 selection:text-white">
      <QronosGuidelines />

      {/* Ambient background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary-500/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10 py-6">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2.5 no-underline mb-3">
            <div className="size-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center glow-orange-sm">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-white">
              Kaam<span className="text-primary-500">Wala</span>
            </span>
          </Link>
          <h1 className="font-display text-2xl font-bold text-white tracking-tight">Create Account</h1>
          <p className="text-xs text-white/50 mt-1">
            {selectedRole === 'WORKER'
              ? 'Join 500+ verified service pros in Mysuru and get daily job dispatches.'
              : 'Join thousands of Mysuru families booking verified home repairs.'}
          </p>
        </div>

        <QronosCard withTopRim withReticles className="p-6 sm:p-8">
          {/* Role Toggle Selector */}
          <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-white/[0.04] border border-white/[0.08] rounded-xl">
            {(['CUSTOMER', 'WORKER'] as const).map(role => (
              <button
                key={role}
                type="button"
                onClick={() => setValue('role', role)}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedRole === role
                    ? 'bg-white text-black shadow-lg font-bold'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                {role === 'CUSTOMER' ? <User className="w-3.5 h-3.5" /> : <Briefcase className="w-3.5 h-3.5" />}
                {role === 'CUSTOMER' ? 'Customer' : 'Service Pro'}
              </button>
            ))}
          </div>

          {serverError && (
            <div className="alert-error mb-5 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div>
              <label className="form-label">Full Name</label>
              <input
                type="text"
                placeholder="Priya Sharma"
                className={errors.name ? 'form-input-error' : 'form-input'}
                {...register('name')}
              />
              {errors.name && <p className="form-error"><AlertCircle className="w-3 h-3" />{errors.name.message}</p>}
            </div>

            <div>
              <label className="form-label">Email Address</label>
              <input
                type="email"
                placeholder="name@example.com"
                autoComplete="email"
                className={errors.email ? 'form-input-error' : 'form-input'}
                {...register('email')}
              />
              {errors.email && <p className="form-error"><AlertCircle className="w-3 h-3" />{errors.email.message}</p>}
            </div>

            <div>
              <label className="form-label">
                Mobile Number <span className="text-white/30 font-normal lowercase">(optional)</span>
              </label>
              <input
                type="tel"
                placeholder="9876543210"
                className={errors.phone ? 'form-input-error' : 'form-input'}
                {...register('phone')}
              />
              {errors.phone && <p className="form-error"><AlertCircle className="w-3 h-3" />{errors.phone.message}</p>}
            </div>

            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 chars, 1 uppercase, 1 number"
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
              {errors.password && <p className="form-error"><AlertCircle className="w-3 h-3" />{errors.password.message}</p>}
            </div>

            <div>
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                placeholder="Repeat password"
                className={errors.confirmPassword ? 'form-input-error' : 'form-input'}
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && <p className="form-error"><AlertCircle className="w-3 h-3" />{errors.confirmPassword.message}</p>}
            </div>

            <div className="flex items-start gap-2.5 pt-1">
              <input
                type="checkbox"
                id="terms"
                className="mt-0.5 size-4 accent-primary-500 cursor-pointer rounded"
                {...register('termsAccepted')}
              />
              <label htmlFor="terms" className="text-[11px] text-white/50 cursor-pointer leading-tight">
                I agree to the platform Terms of Service and Privacy Policy. Transparent booking fee is disclosed before all payment runs.
              </label>
            </div>
            {errors.termsAccepted && <p className="form-error"><AlertCircle className="w-3 h-3" />{errors.termsAccepted.message}</p>}

            <button
              type="submit"
              id="register-submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-lg shadow-primary-500/20 mt-3 cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account…
                </span>
              ) : (
                <>Register as {selectedRole === 'WORKER' ? 'Worker Pro' : 'Customer'} <ArrowRight className="w-3.5 h-3.5" /></>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/[0.08] text-center text-xs text-white/50">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 font-semibold hover:text-primary-300 no-underline">
              Sign in
            </Link>
          </div>
        </QronosCard>
      </div>
    </div>
  );
}
