import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Shield,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Components
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

// API Services
import { auth } from '../../services/api';

// Validation schemas
const emailSchema = yup.object({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
});

const resetSchema = yup.object({
  token: yup.string().required('Reset token is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    )
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

const ForgotPassword = () => {
  const [step, setStep] = useState('request'); // 'request', 'sent', 'reset', 'success'
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Check if we have a reset token in URL (from email link)
  const tokenFromUrl = searchParams.get('token');
  const emailFromUrl = searchParams.get('email');

  // If token is in URL, go directly to reset step
  useState(() => {
    if (tokenFromUrl && emailFromUrl) {
      setStep('reset');
      setEmail(emailFromUrl);
      resetForm.setValue('token', tokenFromUrl);
    }
  }, []);

  // Request form
  const requestForm = useForm({
    resolver: yupResolver(emailSchema),
  });

  // Reset form
  const resetForm = useForm({
    resolver: yupResolver(resetSchema),
    defaultValues: {
      token: tokenFromUrl || '',
    },
  });

  const handleRequestReset = async data => {
    setIsLoading(true);
    setError('');

    try {
      // Call real backend API
      const response = await auth.forgotPassword({
        email: data.email,
      });

      if (response.success) {
        setEmail(data.email);
        setStep('sent');
        toast.success('Password reset email sent successfully!');
      } else {
        throw new Error(response.message || 'Failed to send reset email');
      }
    } catch (error) {
      console.error('Password reset request error:', error);

      if (error.message?.includes('User not found')) {
        setError('No account found with this email address.');
      } else if (error.message?.includes('Too many requests')) {
        setError(
          'Too many reset requests. Please wait 15 minutes before trying again.'
        );
      } else {
        setError(
          error.message || 'Failed to send reset email. Please try again.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async data => {
    setIsLoading(true);
    setError('');

    try {
      // Call real backend API
      const response = await auth.resetPassword({
        token: data.token,
        password: data.password,
        email: email || emailFromUrl,
      });

      if (response.success) {
        setStep('success');
        toast.success('Password reset successful!');
      } else {
        throw new Error(response.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Password reset error:', error);

      if (error.message?.includes('Invalid token')) {
        setError(
          'Invalid or expired reset token. Please request a new reset link.'
        );
      } else if (error.message?.includes('Token expired')) {
        setError('Reset token has expired. Please request a new reset link.');
      } else if (error.message?.includes('Password too weak')) {
        setError('Password does not meet security requirements.');
      } else {
        setError(
          error.message || 'Failed to reset password. Please try again.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resendEmail = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Call the request reset API again
      const response = await auth.forgotPassword({ email });

      if (response.success) {
        toast.success('Reset email sent again!');
      } else {
        throw new Error(response.message || 'Failed to resend email');
      }
    } catch (error) {
      console.error('Resend email error:', error);
      setError(error.message || 'Failed to resend email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
          <p className="mt-2 text-sm text-gray-600">
            South Africa&apos;s Premier Developer Network
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Request Reset */}
          {step === 'request' && (
            <motion.div
              key="request"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="rounded-lg border border-gray-200 bg-white p-8 shadow-lg"
            >
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
                  <Shield className="h-6 w-6 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Forgot your password?
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  No worries! Enter your email address and we&apos;ll send you a
                  secure reset link.
                </p>
              </div>

              <form
                onSubmit={requestForm.handleSubmit(handleRequestReset)}
                className="space-y-4"
              >
                <div className="relative">
                  <Mail className="absolute top-9 left-3 h-5 w-5 text-gray-400" />
                  <Input
                    {...requestForm.register('email')}
                    id="email"
                    type="email"
                    label="Email Address"
                    placeholder="Enter your email address"
                    error={requestForm.formState.errors.email?.message}
                    className="pl-10"
                    required
                  />
                </div>

                {error && (
                  <div className="flex items-center space-x-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  loading={isLoading}
                  className="w-full"
                  size="lg"
                >
                  Send Reset Link
                </Button>

                <div className="text-center">
                  <Link
                    to="/login"
                    className="flex items-center justify-center text-sm text-indigo-600 transition-colors hover:text-indigo-500"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Sign In
                  </Link>
                </div>
              </form>
            </motion.div>
          )}

          {/* Step 2: Email Sent */}
          {step === 'sent' && (
            <motion.div
              key="sent"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="rounded-lg border border-gray-200 bg-white p-8 shadow-lg"
            >
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <Mail className="h-8 w-8 text-green-600" />
                </div>

                <h2 className="text-2xl font-bold text-gray-900">
                  Check your email
                </h2>

                <div className="space-y-2">
                  <p className="text-gray-600">
                    We&apos;ve sent a password reset link to
                  </p>
                  <p className="font-medium text-gray-900">{email}</p>
                </div>

                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Didn&apos;t receive the email?</strong> Check your
                    spam/junk folder first. The email should arrive within 5
                    minutes.
                  </p>
                </div>

                {error && (
                  <div className="flex items-center space-x-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-3">
                  <Button
                    onClick={resendEmail}
                    variant="secondary"
                    loading={isLoading}
                    className="w-full"
                  >
                    Resend Email
                  </Button>

                  <div className="text-center">
                    <Link
                      to="/login"
                      className="flex items-center justify-center text-sm text-indigo-600 transition-colors hover:text-indigo-500"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Sign In
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Reset Password */}
          {step === 'reset' && (
            <motion.div
              key="reset"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="rounded-lg border border-gray-200 bg-white p-8 shadow-lg"
            >
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Reset your password
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  Enter your new secure password below to complete the reset
                  process.
                </p>
              </div>

              <form
                onSubmit={resetForm.handleSubmit(handlePasswordReset)}
                className="space-y-4"
              >
                {!tokenFromUrl && (
                  <Input
                    {...resetForm.register('token')}
                    id="token"
                    label="Reset Token"
                    placeholder="Enter the token from your email"
                    error={resetForm.formState.errors.token?.message}
                    helper="Copy the 6-digit code from the reset email"
                    required
                  />
                )}

                <Input
                  {...resetForm.register('password')}
                  id="password"
                  type="password"
                  label="New Password"
                  placeholder="Enter your new password"
                  error={resetForm.formState.errors.password?.message}
                  helper="Minimum 8 characters with uppercase, lowercase, number, and special character"
                  required
                />

                <Input
                  {...resetForm.register('confirmPassword')}
                  id="confirmPassword"
                  type="password"
                  label="Confirm New Password"
                  placeholder="Confirm your new password"
                  error={resetForm.formState.errors.confirmPassword?.message}
                  required
                />

                {error && (
                  <div className="flex items-center space-x-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  loading={isLoading}
                  className="w-full"
                  size="lg"
                >
                  Reset Password
                </Button>

                <div className="text-center">
                  <Link
                    to="/login"
                    className="flex items-center justify-center text-sm text-indigo-600 transition-colors hover:text-indigo-500"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Sign In
                  </Link>
                </div>
              </form>
            </motion.div>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="rounded-lg border border-gray-200 bg-white p-8 shadow-lg"
            >
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>

                <h2 className="text-2xl font-bold text-gray-900">
                  Password reset successful! 🎉
                </h2>

                <p className="text-gray-600">
                  Your password has been successfully reset. You can now sign in
                  with your new password and continue building your network in
                  the SA tech community.
                </p>

                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                  <p className="text-sm text-green-800">
                    <strong>Security tip:</strong> Make sure to keep your
                    password secure and consider using a password manager for
                    better security.
                  </p>
                </div>

                <div className="space-y-3 pt-4">
                  <Button as={Link} to="/login" className="w-full" size="lg">
                    Sign In Now
                  </Button>

                  <div className="text-center">
                    <Link
                      to="/"
                      className="text-sm text-gray-500 transition-colors hover:text-gray-700"
                    >
                      Back to Home
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
