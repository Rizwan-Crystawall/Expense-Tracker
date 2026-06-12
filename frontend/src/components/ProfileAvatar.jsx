import { getInitials, getAvatarGradient, getProfileImageUrl } from '../utils/avatar';

const SIZES = {
  sm: 'w-10 h-10 text-sm',
  md: 'w-12 h-12 text-base',
  lg: 'w-16 h-16 text-xl',
};

export default function ProfileAvatar({ username, size = 'md', className = '', useImage = true }) {
  const sizeClass = SIZES[size] || SIZES.md;

  if (useImage && username) {
    return (
      <div
        className={`${sizeClass} rounded-full bg-surface-container-high flex items-center justify-center border border-primary/20 overflow-hidden flex-shrink-0 ${className}`}
        title={username}
      >
        <img
          src={getProfileImageUrl(username)}
          alt={username}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 border border-white/15 shadow-lg ${className}`}
      style={{ background: getAvatarGradient(username) }}
      title={username}
    >
      {getInitials(username)}
    </div>
  );
}
