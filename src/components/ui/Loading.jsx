import { motion } from 'framer-motion';
import { clsx } from 'clsx';

// Spinner Component
export const Spinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  return (
    <svg
      className={clsx(
        'animate-spin text-current',
        sizeClasses[size],
        className
      )}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

// Skeleton Component
export const Skeleton = ({ className = '', width, height }) => {
  return (
    <div
      className={clsx('animate-pulse rounded bg-gray-200', className)}
      style={{ width, height }}
    />
  );
};

// Card Skeleton
export const CardSkeleton = () => {
  return (
    <div className="space-y-4 rounded-lg border bg-white p-6 shadow">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-4/6" />
      </div>
      <div className="flex space-x-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>
    </div>
  );
};

// Full Page Loading
export const PageLoading = ({ message = 'Loading...' }) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="inline-block"
        >
          <Spinner size="xl" className="text-indigo-600" />
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 font-medium text-gray-600"
        >
          {message}
        </motion.p>
      </div>
    </div>
  );
};

// Section Loading
export const SectionLoading = ({ rows = 3, className = '' }) => {
  return (
    <div className={clsx('space-y-4', className)}>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      ))}
    </div>
  );
};

// Button Loading State
export const ButtonLoading = ({ size = 'md' }) => {
  return <Spinner size={size === 'lg' ? 'md' : 'sm'} />;
};

// Loading with overlay
export const LoadingOverlay = ({
  message = 'Loading...',
  isVisible = true,
}) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="mx-4 max-w-sm rounded-lg bg-white p-8 text-center"
      >
        <Spinner size="lg" className="mx-auto text-indigo-600" />
        <p className="mt-4 font-medium text-gray-600">{message}</p>
      </motion.div>
    </motion.div>
  );
};

// Main Loading component (default export)
const Loading = ({
  type = 'spinner',
  size = 'md',
  className = '',
  message,
  ...props
}) => {
  switch (type) {
    case 'skeleton':
      return <Skeleton className={className} {...props} />;
    case 'card':
      return <CardSkeleton />;
    case 'page':
      return <PageLoading message={message} />;
    case 'section':
      return <SectionLoading className={className} {...props} />;
    case 'overlay':
      return <LoadingOverlay message={message} {...props} />;
    default:
      return <Spinner size={size} className={className} />;
  }
};

export default Loading;
