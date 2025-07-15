// pages/Auth/Login.jsx
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import useAuth from '../../hooks/useAuth';

// Validation schema
const loginSchema = yup.object({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const location = useLocation();
  const { login, isLoading, isAuthenticated, error } = useAuth();

  // Get messages from navigation state
  const message = location.state?.message;
  const from = location.state?.from;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: yupResolver(loginSchema),
    mode: 'onBlur',
  });

  // Pre-fill email if provided from signup
  useEffect(() => {
    if (location.state?.email) {
      setValue('email', location.state.email);
    }
  }, [location.state?.email, setValue]);

  // Show success message from signup
  useEffect(() => {
    if (message) {
      toast.success(message);
    }
  }, [message]);

  const onSubmit = async data => {
    const result = await login(data);

    if (!result.success) {
      // Error handling is done in the auth store via toast
      console.error('Login failed:', result.error);
    }
  };

  // Don't render if already authenticated (will be redirected)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <Link to="/">
            <img
              src="/images/Upskill-logo.png"
              alt="UpSkill"
              className="mx-auto h-12 w-auto"
            />
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Welcome back!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access your developer network
          </p>
          {from && (
            <p className="mt-1 text-xs text-indigo-600">
              Please log in to continue to {from.pathname}
            </p>
          )}
        </div>

        {/* Form */}
        <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-lg">
          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 flex items-center space-x-3 rounded-lg border border-red-200 bg-red-50 p-4"
            >
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div className="relative">
              <Mail className="absolute top-9 left-3 h-5 w-5 text-gray-400" />
              <Input
                {...register('email')}
                id="email"
                type="email"
                label="Email Address"
                placeholder="Enter your email"
                error={errors.email?.message}
                className="pl-10"
                disabled={isLoading}
                required
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute top-9 left-3 h-5 w-5 text-gray-400" />
              <Input
                {...register('password')}
                id="password"
                type={showPassword ? 'text' : 'password'}
                label="Password"
                placeholder="Enter your password"
                error={errors.password?.message}
                className="pr-10 pl-10"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-9 right-3 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Remember me
                </label>
              </div>

              <Link
                to="/forgot-password"
                className="text-sm text-indigo-600 transition-colors hover:text-indigo-500"
              >
                Forgot your password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              loading={isLoading}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Signup Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-medium text-indigo-600 transition-colors hover:text-indigo-500"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <Link
            to="/"
            className="text-sm text-gray-500 transition-colors hover:text-gray-700"
          >
            ← Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
