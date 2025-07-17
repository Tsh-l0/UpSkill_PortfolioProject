import { forwardRef } from 'react';
import { clsx } from 'clsx';

const Input = forwardRef(
  (
    {
      label,
      error,
      helper,
      className,
      containerClassName,
      type = 'text',
      required = false,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const inputClasses = clsx(
      // Base styles
      'block w-full rounded-md border transition-colors duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'placeholder:text-gray-400',

      // Size and spacing
      'px-3 py-2 text-sm',

      // State-based styles
      error
        ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
        : 'border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500',

      // Background
      'bg-white',

      className
    );

    const labelClasses = clsx(
      'block text-sm font-medium text-gray-700 mb-1',
      disabled && 'opacity-50'
    );

    return (
      <div className={clsx('space-y-1', containerClassName)}>
        {label && (
          <label className={labelClasses}>
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}

        <input
          ref={ref}
          type={type}
          disabled={disabled}
          className={inputClasses}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error
              ? `${props.id}-error`
              : helper
                ? `${props.id}-helper`
                : undefined
          }
          {...props}
        />

        {error && (
          <p
            id={`${props.id}-error`}
            className="flex items-center text-sm text-red-600"
          >
            <svg
              className="mr-1 h-4 w-4 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}

        {helper && !error && (
          <p id={`${props.id}-helper`} className="text-sm text-gray-500">
            {helper}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
