// pages/Auth/Signup.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  MapPin,
  Briefcase,
  AlertCircle,
} from 'lucide-react';

import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import useAuth from '../../hooks/useAuth';

// Validation schema
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
  location: yup.string().required('Location is required'),
  currentRole: yup.string().required('Current role is required'),
  experienceLevel: yup
    .string()
    .oneOf(
      ['junior', 'mid', 'senior', 'lead'],
      'Please select a valid experience level'
    )
    .required('Experience level is required'),
});

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signup, isLoading, isAuthenticated, error } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(signupSchema),
    mode: 'onBlur',
    defaultValues: {
      location: 'Johannesburg, Gauteng', // Default to Johannesburg
      experienceLevel: 'mid',
    },
  });

  const watchedPassword = watch('password');

  const experienceLevels = [
    { value: 'junior', label: 'Junior (0-2 years)' },
    { value: 'mid', label: 'Mid-level (2-5 years)' },
    { value: 'senior', label: 'Senior (5-8 years)' },
    { value: 'lead', label: 'Lead/Principal (8+ years)' },
  ];

  // South African cities for location suggestions
  const saCities = [
    'Johannesburg, Gauteng',
    'Cape Town, Western Cape',
    'Durban, KwaZulu-Natal',
    'Pretoria, Gauteng',
    'Port Elizabeth, Eastern Cape',
    'Bloemfontein, Free State',
    'East London, Eastern Cape',
    'Pietermaritzburg, KwaZulu-Natal',
    'Kimberley, Northern Cape',
    'Polokwane, Limpopo',
  ];

  const onSubmit = async data => {
    // Enhance data with South African defaults
    const enhancedData = {
      ...data,
      country: 'South Africa',
      timezone: 'Africa/Johannesburg',
      currency: 'ZAR',
      profileCompletionScore: 30, // Basic signup completion
      onboardingCompleted: false,
      joinDate: new Date().toISOString(),
      isProfilePublic: true,
      allowMessages: true,
      allowEndorsements: true,
    };

    const result = await signup(enhancedData);

    if (!result.success) {
      console.error('Signup failed:', result.error);
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

  const passwordStrength = getPasswordStrength(watchedPassword);

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
        className="w-full max-w-lg space-y-8"
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
            Join the SA Tech Community
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Connect with thousands of developers advancing their careers 🇿🇦
          </p>
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
            {/* Full Name */}
            <div className="relative">
              <User className="absolute top-9 left-3 h-5 w-5 text-gray-400" />
              <Input
                {...register('fullName')}
                id="fullName"
                label="Full Name"
                placeholder="Enter your full name"
                error={errors.fullName?.message}
                className="pl-10"
                disabled={isLoading}
                required
              />
            </div>

            {/* Email */}
            <div className="relative">
              <Mail className="absolute top-9 left-3 h-5 w-5 text-gray-400" />
              <Input
                {...register('email')}
                id="email"
                type="email"
                label="Email Address"
                placeholder="your@email.com"
                error={errors.email?.message}
                className="pl-10"
                disabled={isLoading}
                required
              />
            </div>

            {/* Location & Current Role */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="relative">
                <MapPin className="absolute top-9 left-3 h-5 w-5 text-gray-400" />
                <Input
                  {...register('location')}
                  id="location"
                  label="Location"
                  placeholder="City, Province"
                  error={errors.location?.message}
                  className="pl-10"
                  disabled={isLoading}
                  list="sa-cities"
                  required
                />
                <datalist id="sa-cities">
                  {saCities.map(city => (
                    <option key={city} value={city} />
                  ))}
                </datalist>
              </div>

              <div className="relative">
                <Briefcase className="absolute top-9 left-3 h-5 w-5 text-gray-400" />
                <Input
                  {...register('currentRole')}
                  id="currentRole"
                  label="Current Role"
                  placeholder="e.g., Frontend Developer"
                  error={errors.currentRole?.message}
                  className="pl-10"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Experience Level */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Experience Level <span className="text-red-500">*</span>
              </label>
              <select
                {...register('experienceLevel')}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
                disabled={isLoading}
              >
                {experienceLevels.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
              {errors.experienceLevel && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.experienceLevel.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute top-9 left-3 h-5 w-5 text-gray-400" />
              <Input
                {...register('password')}
                id="password"
                type={showPassword ? 'text' : 'password'}
                label="Password"
                placeholder="Create a strong password"
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

            {/* Password Strength */}
            {watchedPassword && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
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

            {/* Confirm Password */}
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
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute top-9 right-3 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Terms */}
            <div className="flex items-start">
              <div className="flex h-5 items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  disabled={isLoading}
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="text-gray-700">
                  I agree to the{' '}
                  <Link
                    to="/terms"
                    className="text-indigo-600 hover:text-indigo-500"
                  >
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link
                    to="/privacy"
                    className="text-indigo-600 hover:text-indigo-500"
                  >
                    Privacy Policy
                  </Link>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              loading={isLoading}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-indigo-600 transition-colors hover:text-indigo-500"
              >
                Sign in
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

export default Signup;
