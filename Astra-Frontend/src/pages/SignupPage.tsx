import React from 'react';
import { motion } from 'framer-motion';
import SignupForm from '@/components/auth/SignupForm';

/**
 * Signup Page Component
 * Displays signup form with animated background
 */
const SignupPage: React.FC = () => {
  const bgVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 1 },
    },
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { delay: 0.2, duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900/20 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <motion.div
        variants={bgVariants}
        initial="hidden"
        animate="visible"
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <div className="absolute w-96 h-96 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl -bottom-32 -left-32" />
        <div className="absolute w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl -top-32 -right-32" />
      </motion.div>

      {/* Signup Form Container */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md"
      >
        <SignupForm />
      </motion.div>
    </div>
  );
};

export default SignupPage;
