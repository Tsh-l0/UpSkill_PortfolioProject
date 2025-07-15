import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';

// Validation schemas
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

const signupSchema = yup.object({
  fullName: yup
    .string()
    .min(2, 'Name must be at least 2 characters')
    .required('Full name is required'),
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

const AuthForm = ({ mode: initialMode = 'login', onSuccess }) => {
  const [mode, setMode] = useState(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const isLogin = mode === 'login';
  const schema = isLogin ? loginSchema : signupSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onBlur',
  });

  const watchedPassword = watch('password');

  const toggleMode = () => {
    setMode(isLogin ? 'signup' : 'login');
    reset(); // Clear form when switching modes
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const onSubmit = async data => {
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (isLogin) {
        // Handle login
        console.log('Login data:', data);
        navigate('/profile');
      } else {
        // Handle signup
        console.log('Signup data:', data);
        navigate('/onboarding');
      }

      onSuccess?.();
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = password => {
    if (!password) return { strength: 0, label: '' };

    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;

    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = [
      'bg-red-500',
      'bg-orange-500',
      'bg-yellow-500',
      'bg-blue-500',
      'bg-green-500',
    ];

    return {
      strength,
      label: labels[strength - 1] || '',
      color: colors[strength - 1] || 'bg-gray-300',
    };
  };

  const passwordStrength = !isLogin
    ? getPasswordStrength(watchedPassword)
    : null;

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
          <motion.h2
            key={mode}
            initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-6 text-3xl font-bold text-gray-900"
          >
            {isLogin ? 'Welcome back!' : 'Create your account'}
          </motion.h2>
          <p className="mt-2 text-sm text-gray-600">
            {isLogin
              ? 'Sign in to access your developer network'
              : 'Join thousands of developers advancing their careers'}
          </p>
        </div>

        {/* Form */}
        <motion.form
          layout
          onSubmit={handleSubmit(onSubmit)}
          className="mt-8 space-y-6 rounded-lg border border-gray-200 bg-white p-8 shadow-lg"
        >
          <div className="space-y-4">
            {/* Full Name - Signup only */}
            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="relative">
                    <User className="absolute top-9 left-3 h-5 w-5 text-gray-400" />
                    <Input
                      {...register('fullName')}
                      id="fullName"
                      label="Full Name"
                      placeholder="Enter your full name"
                      error={errors.fullName?.message}
                      className="pl-10"
                      required
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-9 right-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Password Strength - Signup only */}
            <AnimatePresence>
              {!isLogin && watchedPassword && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Password strength:</span>
                    <span
                      className={`font-medium ${
                        passwordStrength.strength >= 4
                          ? 'text-green-600'
                          : passwordStrength.strength >= 3
                            ? 'text-blue-600'
                            : passwordStrength.strength >= 2
                              ? 'text-yellow-600'
                              : 'text-red-600'
                      }`}
                    >
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(passwordStrength.strength / 5) * 100}%`,
                      }}
                      className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Confirm Password - Signup only */}
            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="relative">
                    <Lock className="absolute top-9 left-3 h-5 w-5 text-gray-400" />
                    <Input
                      {...register('confirmPassword')}
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      label="Confirm Password"
                      placeholder="Confirm your password"
                      error={errors.confirmPassword?.message}
                      className="pr-10 pl-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute top-9 right-3 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Forgot Password - Login only */}
          {isLogin && (
            <div className="flex items-center justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-indigo-600 transition-colors hover:text-indigo-500"
              >
                Forgot your password?
              </Link>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            loading={isLoading}
            className="w-full"
            size="lg"
          >
            {isLogin ? 'Sign In' : 'Create Account'}
          </Button>

          {/* Mode Toggle */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={toggleMode}
                className="font-medium text-indigo-600 transition-colors hover:text-indigo-500"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </motion.form>

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

export default AuthForm;
