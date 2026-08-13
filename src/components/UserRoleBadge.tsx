import React from 'react';
import { ShieldCheck, ShieldAlert, Crown, Feather } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface UserRoleBadgeProps {
  role?: string | null;
  userId?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const UserRoleBadge: React.FC<UserRoleBadgeProps> = ({ 
  role: directRole, 
  userId, 
  size = 'sm',
  className = '' 
}) => {
  const { users } = useApp();

  // Find user's current live role from state if userId provided
  const matchedUser = userId ? users.find((u) => u.id === userId) : null;
  const effectiveRole = directRole || matchedUser?.role || (matchedUser?.email?.toLowerCase().includes('admin') || matchedUser?.email?.toLowerCase().includes('wattyboon') ? 'admin' : 'user');

  if (!effectiveRole || effectiveRole === 'user') {
    return null;
  }

  if (effectiveRole === 'admin') {
    return (
      <span 
        className={`inline-flex items-center gap-1 bg-gradient-to-r from-red-600 via-rose-600 to-purple-600 text-white font-extrabold rounded-full shadow-sm border border-rose-300/40 uppercase tracking-wider ${
          size === 'sm' ? 'px-2 py-0.5 text-[9px]' : size === 'md' ? 'px-2.5 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
        } ${className}`}
        title="Yönetici (Admin)"
      >
        <Crown className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'} />
        <span>Yönetici</span>
      </span>
    );
  }

  if (effectiveRole === 'moderator') {
    return (
      <span 
        className={`inline-flex items-center gap-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-extrabold rounded-full shadow-sm border border-cyan-300/40 uppercase tracking-wider ${
          size === 'sm' ? 'px-2 py-0.5 text-[9px]' : size === 'md' ? 'px-2.5 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
        } ${className}`}
        title="Moderatör"
      >
        <ShieldCheck className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'} />
        <span>Moderatör</span>
      </span>
    );
  }

  if (effectiveRole === 'author') {
    return (
      <span 
        className={`inline-flex items-center gap-1 bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-bold rounded-full border border-purple-200 dark:border-purple-800 ${
          size === 'sm' ? 'px-2 py-0.5 text-[9px]' : size === 'md' ? 'px-2.5 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
        } ${className}`}
        title="Wattyboon Yazarı"
      >
        <Feather className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'} />
        <span>Yazar</span>
      </span>
    );
  }

  return null;
};
