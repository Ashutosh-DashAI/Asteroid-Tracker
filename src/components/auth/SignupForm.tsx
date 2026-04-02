'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { signupSchema, type SignupInput } from '@/schemas/auth';

type SignupFormValues = SignupInput;

/**
 * Signup Form Component
 * Features:
 * - Advanced Zod validation with password strength requirements
 * - Real-time password strength indicator
 * - Smooth error animations
 * - Password visibility toggle
 * - Loading state management
 * - Glassmorphism design with premium aesthetics
 */
export const SignupForm: React.FC = () => {
  const navigate = useNavigate();
  const { signup, loading, error } = useAuthStore();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showErrorMessage, setShowErrorMessage] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    if (error) {
      setShowErrorMessage(true);
      const timer = setTimeout(() => setShowErrorMessage(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const onSubmit = async (data: SignupFormValues) => {
    try {
      await signup(data.email, data.password, data.name, data.username);
      navigate('/dashboard');
    } catch (err) {
      console.error('Signup failed:', err);
    }
  };

  const watchName = watch('name');
  const watchUsername = watch('username');
  const watchEmail = watch('email');
  const watchPassword = watch('password');

  // Calculate password strength
  const getPasswordStrength = (password: string | undefined) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(watchPassword);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-md"
    >
      <div className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl">
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-white/60">Join ASTRA and start chatting</p>
        </motion.div>

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
        <motion.form
          variants={itemVariants}
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
              Full Name
            </label>
            <input
              {...register('name')}
              type="text"
              placeholder="Your_name"
              className={`w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border transition-all duration-300 outline-none placeholder-white/40 text-white ${
                errors.name
                  ? 'border-red-500/50 focus:border-red-500'
                  : 'border-white/10 focus:border-white/30 focus:bg-white/10'
              }`}
            />
            {errors.name && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="text-red-400 text-sm mt-1 flex items-center gap-1"
              >
                <AlertCircle size={14} />
                {errors.name.message}
              </motion.p>
            )}
          </div>

          {/* Username Field */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-white mb-2">
              Username
            </label>
            <input
              {...register('username')}
              type="text"
              placeholder="john_doe"
              className={`w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border transition-all duration-300 outline-none placeholder-white/40 text-white ${
                errors.username
                  ? 'border-red-500/50 focus:border-red-500'
                  : 'border-white/10 focus:border-white/30 focus:bg-white/10'
              }`}
            />
            {errors.username && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="text-red-400 text-sm mt-1 flex items-center gap-1"
              >
                <AlertCircle size={14} />
                {errors.username.message}
              </motion.p>
            )}
          </div>

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

            {watchPassword && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-2 space-y-2"
              >
                {/* Password Strength Indicator */}
                <div className="flex gap-1">
                  {[0, 1, 2].map((index) => (
                    <div
                      key={index}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        index < passwordStrength
                          ? passwordStrength === 1
                            ? 'bg-red-500'
                            : passwordStrength === 2
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                          : 'bg-white/10'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-white/60">
                  {passwordStrength === 0 || passwordStrength === 1
                    ? 'Weak password'
                    : passwordStrength === 2
                    ? 'Good password'
                    : 'Strong password'}
                </p>
              </motion.div>
            )}

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
            disabled={loading || !watchName || !watchUsername || !watchEmail || !watchPassword}
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
                Creating account...
              </span>
            ) : (
              <span className="text-white font-semibold">Create Account</span>
            )}
          </motion.button>
        </motion.form>

        {/* Footer Link */}
        <motion.p variants={itemVariants} className="text-center text-white/60 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
            Sign in
          </Link>
        </motion.p>
      </div>
    </motion.div>
  );
};

export default SignupForm;
