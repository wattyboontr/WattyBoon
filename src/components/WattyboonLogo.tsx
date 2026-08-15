import React from 'react';

interface WattyboonLogoProps {
  className?: string;
}

export const WattyboonLogo: React.FC<WattyboonLogoProps> = ({ className = 'text-2xl' }) => {
  return (
    <span className={`font-logo font-bold tracking-wide bg-gradient-to-r from-purple-700 via-fuchsia-600 to-indigo-600 dark:from-purple-300 dark:via-fuchsia-300 dark:to-indigo-300 bg-clip-text text-transparent drop-shadow-sm select-none ${className}`}>
      WattyBoon
    </span>
  );
};
