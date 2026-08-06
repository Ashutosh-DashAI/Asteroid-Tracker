'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { loginSchema, type LoginInput } from '@/schemas/auth';
import type { z } from 'zod';

type LoginFormValues = LoginInput;

/**
 * Login Form Component
 * Features:
 * - Zod validation with detailed error messages
 * - Smooth error animations
 * - Password visibility toggle
 * - Loading state management
 * - Glassmorphism design
 */
export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { login, loading, error, clearAuth } = useAuthStore();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showErrorMessage, setShowErrorMessage] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    if (error) {
      setShowErrorMessage(true);
      const timer = setTimeout(() => setShowErrorMessage(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const onSubmit = async (data: LoginFormValues) => {
    try {
      console.log('[LoginForm] Submitting login form for:', data.email);
      await login(data.email, data.password);
      console.log('[LoginForm] Login successful, tokens should be saved, navigating to dashboard');
      // Small delay to ensure state updates are processed
      setTimeout(() => {
        navigate('/dashboard');
      }, 100);
    } catch (err) {
      // Error is handled by the store
      console.error('[LoginForm] Login failed:', err);
    }
  };

  const watchEmail = watch('email');
  const watchPassword = watch('password');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <div className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-white/60">Sign in to ASTRA</p>
        </div>

        {/* Error Message with Animation */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{
            opacity: showErrorMessage && error ? 1 : 0,
            height: showErrorMessage && error ? 'auto' : 0,
          }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden mb-6"
        >
          {showErrorMessage && error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}
        </motion.div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
              Email Address
            </label>
            <input
              {...register('email')}
              type="email"
              placeholder="you@example.com"
              className={`w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border transition-all duration-300 outline-none placeholder-white/40 text-white ${
                errors.email
                  ? 'border-red-500/50 focus:border-red-500'
                  : 'border-white/10 focus:border-white/30 focus:bg-white/10'
              }`}
            />
            {errors.email && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="text-red-400 text-sm mt-1 flex items-center gap-1"
              >
                <AlertCircle size={14} />
                {errors.email.message}
              </motion.p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
              Password
            </label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={`w-full px-4 py-3 pr-12 rounded-xl backdrop-blur-xl bg-white/5 border transition-all duration-300 outline-none placeholder-white/40 text-white ${
                  errors.password
                    ? 'border-red-500/50 focus:border-red-500'
                    : 'border-white/10 focus:border-white/30 focus:bg-white/10'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/70 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="text-red-400 text-sm mt-1 flex items-center gap-1"
              >
                <AlertCircle size={14} />
                {errors.password.message}
              </motion.p>
            )}
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading || !watchEmail || !watchPassword}
            className="w-full mt-6 px-6 py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.5)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                'linear-gradient(135deg, rgba(99, 102, 241, 0.5) 0%, rgba(139, 92, 246, 0.5) 100%)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                'linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%)';
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                />
                Signing in...
              </span>
            ) : (
              <span className="text-white font-semibold">Sign In</span>
            )}
          </motion.button>
        </form>

        {/* Footer Link */}
        <p className="text-center text-white/60 text-sm mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default LoginForm;
