import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

const Button = forwardRef(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      disabled = false,
      loading = false,
      as: Component = 'button',
      ...props
    },
    ref
  ) => {
    const baseClasses = [
      // Base styles
      'inline-flex items-center justify-center',
      'font-medium rounded-md transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'active:scale-95',
    ];

    const variantClasses = {
      primary: [
        'bg-indigo-600 text-white shadow-sm',
        'hover:bg-indigo-700 focus:ring-indigo-500',
        'disabled:hover:bg-indigo-600',
      ],
      secondary: [
        'bg-white text-indigo-600 border border-indigo-600',
        'hover:bg-indigo-50 focus:ring-indigo-500',
        'disabled:hover:bg-white',
      ],
      ghost: [
        'bg-transparent text-gray-600 border border-transparent',
        'hover:bg-gray-100 hover:text-gray-700 focus:ring-gray-500',
        'disabled:hover:bg-transparent',
      ],
      danger: [
        'bg-red-600 text-white shadow-sm',
        'hover:bg-red-700 focus:ring-red-500',
        'disabled:hover:bg-red-600',
      ],
      success: [
        'bg-green-600 text-white shadow-sm',
        'hover:bg-green-700 focus:ring-green-500',
        'disabled:hover:bg-green-600',
      ],
    };

    const sizeClasses = {
      xs: 'px-2 py-1 text-xs',
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
      xl: 'px-8 py-4 text-lg',
    };

    const classes = clsx(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      className
    );

    const content = (
      <>
        {loading && (
          <svg
            className="mr-2 -ml-1 h-4 w-4 animate-spin text-current"
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
        )}
        {children}
      </>
    );

    // If it's a motion component, wrap in motion
    if (Component === 'button') {
      return (
        <motion.button
          ref={ref}
          className={classes}
          disabled={disabled || loading}
          whileTap={{ scale: disabled ? 1 : 0.95 }}
          {...props}
        >
          {content}
        </motion.button>
      );
    }

    // For other components (like Link), render normally
    return (
      <Component ref={ref} className={classes} {...props}>
        {content}
      </Component>
    );
  }
);

Button.displayName = 'Button';

export default Button;
