export const formatCurrency = (amount, options = {}) => {
  const {
    currency = 'ZAR',
    locale = 'en-ZA',
    minimumFractionDigits = 0,
    maximumFractionDigits = 0,
    compact = false,
  } = options;

  // Validate amount
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'R0';
  }

  // Convert to number if string
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  try {
    // For compact format (e.g., R1.2M, R850K)
    if (compact) {
      return formatCompactCurrency(numAmount);
    }

    // Use Intl.NumberFormat with fallback
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(numAmount);
  } catch (error) {
    // Fallback for invalid currency codes or browser issues
    console.warn('Currency formatting failed, using fallback:', error);
    return formatCurrencyFallback(numAmount, currency);
  }
};

/**
 * Compact currency formatter (R1.2M, R850K, etc.)
 */
export const formatCompactCurrency = amount => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'R0';
  }

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (numAmount >= 1000000) {
    return `R${(numAmount / 1000000).toFixed(1)}M`;
  } else if (numAmount >= 1000) {
    return `R${(numAmount / 1000).toFixed(0)}K`;
  } else {
    return `R${numAmount.toFixed(0)}`;
  }
};

/**
 * Fallback currency formatter when Intl fails
 */
const formatCurrencyFallback = (amount, currency = 'ZAR') => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'R0';
  }

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  const prefix = currency === 'ZAR' ? 'R' : '$';

  try {
    return `${prefix}${numAmount.toLocaleString('en-ZA', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  } catch (error) {
    // Ultimate fallback
    return `${prefix}${Math.round(numAmount)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  }
};

/**
 * Format numbers with proper locale support
 */
export const formatNumber = (num, options = {}) => {
  const {
    locale = 'en-ZA',
    minimumFractionDigits = 0,
    maximumFractionDigits = 0,
    compact = false,
  } = options;

  // Validate input
  if (num === null || num === undefined || isNaN(num)) {
    return '0';
  }

  const numValue = typeof num === 'string' ? parseFloat(num) : num;

  try {
    // For compact format (1.2M, 850K)
    if (compact) {
      return formatCompactNumber(numValue);
    }

    return new Intl.NumberFormat(locale, {
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(numValue);
  } catch (error) {
    console.warn('Number formatting failed, using fallback:', error);
    return numValue.toFixed(maximumFractionDigits);
  }
};

/**
 * Compact number formatter (1.2M, 850K, etc.)
 */
export const formatCompactNumber = num => {
  if (num === null || num === undefined || isNaN(num)) {
    return '0';
  }

  const numValue = typeof num === 'string' ? parseFloat(num) : num;

  if (numValue >= 1000000) {
    return `${(numValue / 1000000).toFixed(1)}M`;
  } else if (numValue >= 1000) {
    return `${(numValue / 1000).toFixed(0)}K`;
  } else {
    return numValue.toString();
  }
};

/**
 * Format percentage values
 */
export const formatPercentage = (value, options = {}) => {
  const { decimals = 1, showSign = false, locale = 'en-ZA' } = options;

  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }

  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  try {
    const formatted = new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(numValue / 100);

    if (showSign && numValue > 0) {
      return `+${formatted}`;
    }

    return formatted;
  } catch (error) {
    console.warn('Percentage formatting failed, using fallback:', error);
    const sign = showSign && numValue > 0 ? '+' : '';
    return `${sign}${numValue.toFixed(decimals)}%`;
  }
};

/**
 * Format relative time (e.g., "2 hours ago", "3 days ago")
 */
export const formatRelativeTime = (date, locale = 'en-ZA') => {
  if (!date) return '';

  const now = new Date();
  const targetDate = new Date(date);
  const diffInSeconds = Math.floor((now - targetDate) / 1000);

  // Less than a minute
  if (diffInSeconds < 60) {
    return 'Just now';
  }

  // Less than an hour
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  }

  // Less than a day
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  }

  // Less than a week
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }

  // Less than a month
  if (diffInSeconds < 2592000) {
    const weeks = Math.floor(diffInSeconds / 604800);
    return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
  }

  // Use Intl.RelativeTimeFormat if available, otherwise fallback
  try {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    const diffInDays = Math.floor(diffInSeconds / 86400);

    if (diffInDays < 30) {
      return rtf.format(-diffInDays, 'day');
    } else if (diffInDays < 365) {
      const diffInMonths = Math.floor(diffInDays / 30);
      return rtf.format(-diffInMonths, 'month');
    } else {
      const diffInYears = Math.floor(diffInDays / 365);
      return rtf.format(-diffInYears, 'year');
    }
  } catch (error) {
    // Fallback for browsers without Intl.RelativeTimeFormat
    return targetDate.toLocaleDateString(locale);
  }
};

/**
 * Format date for display
 */
export const formatDate = (date, options = {}) => {
  const {
    locale = 'en-ZA',
    style = 'medium', // 'short', 'medium', 'long', 'full'
    includeTime = false,
  } = options;

  if (!date) return '';

  const targetDate = new Date(date);

  try {
    const dateOptions = {
      year: 'numeric',
      month:
        style === 'short' ? 'numeric' : style === 'medium' ? 'short' : 'long',
      day: 'numeric',
    };

    if (includeTime) {
      dateOptions.hour = '2-digit';
      dateOptions.minute = '2-digit';
    }

    return targetDate.toLocaleDateString(locale, dateOptions);
  } catch (error) {
    console.warn('Date formatting failed, using fallback:', error);
    return targetDate.toDateString();
  }
};

/**
 * Format salary range for South African market
 */
export const formatSalaryRange = (min, max, options = {}) => {
  const { compact = true, currency = 'ZAR' } = options;

  if (!min && !max) return 'Salary not disclosed';
  if (!max) return `From ${formatCurrency(min, { compact, currency })}`;
  if (!min) return `Up to ${formatCurrency(max, { compact, currency })}`;

  return `${formatCurrency(min, { compact, currency })} - ${formatCurrency(max, { compact, currency })}`;
};

/**
 * Format file size
 */
export const formatFileSize = bytes => {
  if (bytes === 0) return '0 Bytes';
  if (!bytes) return '';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text, maxLength = 100, suffix = '...') => {
  if (!text || text.length <= maxLength) return text || '';
  return text.slice(0, maxLength) + suffix;
};

/**
 * Format phone number for South African format
 */
export const formatPhoneNumber = phone => {
  if (!phone) return '';

  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');

  // South African format: +27 XX XXX XXXX
  if (digits.startsWith('27') && digits.length === 11) {
    return `+27 ${digits.slice(2, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }

  // Local format: 0XX XXX XXXX
  if (digits.startsWith('0') && digits.length === 10) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }

  return phone; // Return original if format doesn't match
};

// Export all formatters
export default {
  formatCurrency,
  formatCompactCurrency,
  formatNumber,
  formatCompactNumber,
  formatPercentage,
  formatRelativeTime,
  formatDate,
  formatSalaryRange,
  formatFileSize,
  truncateText,
  formatPhoneNumber,
};