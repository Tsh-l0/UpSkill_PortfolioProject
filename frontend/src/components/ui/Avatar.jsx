import { useState } from 'react';
import { User } from 'lucide-react';
import { clsx } from 'clsx';

const Avatar = ({
  src,
  alt,
  name,
  size = 'md',
  className = '',
  fallbackIcon = User,
  showInitials = true,
  online = false,
  ...props
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
  };

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
    '2xl': 'w-10 h-10',
  };

  const onlineIndicatorSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-3.5 h-3.5',
    '2xl': 'w-4 h-4',
  };

  // Generate initials from name
  const getInitials = name => {
    if (!name) return '';
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const initials = getInitials(name || alt);
  const FallbackIcon = fallbackIcon;

  const baseClasses = clsx(
    'relative inline-flex items-center justify-center rounded-full bg-gray-100 overflow-hidden',
    'font-medium text-gray-600 select-none',
    sizeClasses[size],
    className
  );

  return (
    <div className={baseClasses} {...props}>
      {/* Image */}
      {src && !imageError && (
        <img
          src={src}
          alt={alt || name}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
          onLoad={() => setImageError(false)}
        />
      )}

      {/* Fallback: Initials */}
      {(!src || imageError) && initials && showInitials && (
        <span className="font-semibold text-gray-700">{initials}</span>
      )}

      {/* Fallback: Icon */}
      {(!src || imageError) && (!initials || !showInitials) && (
        <FallbackIcon className={clsx('text-gray-400', iconSizes[size])} />
      )}

      {/* Online indicator */}
      {online && (
        <span
          className={clsx(
            'absolute right-0 bottom-0 block rounded-full bg-green-400 ring-2 ring-white',
            onlineIndicatorSizes[size]
          )}
        />
      )}
    </div>
  );
};

// Avatar Group Component
export const AvatarGroup = ({
  avatars = [],
  max = 3,
  size = 'md',
  className = '',
  showMore = true,
}) => {
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  const groupSpacing = {
    xs: '-space-x-1',
    sm: '-space-x-1.5',
    md: '-space-x-2',
    lg: '-space-x-2.5',
    xl: '-space-x-3',
    '2xl': '-space-x-4',
  };

  return (
    <div className={clsx('flex items-center', groupSpacing[size], className)}>
      {visibleAvatars.map((avatar, index) => (
        <Avatar
          key={avatar.id || index}
          src={avatar.src}
          alt={avatar.alt}
          name={avatar.name}
          size={size}
          className="ring-2 ring-white"
        />
      ))}

      {remainingCount > 0 && showMore && (
        <div
          className={clsx(
            'relative inline-flex items-center justify-center rounded-full',
            'bg-gray-200 font-medium text-gray-600 ring-2 ring-white',
            sizeClasses[size]
          )}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
};

export default Avatar;
