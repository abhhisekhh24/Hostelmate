
import React from 'react';
import { UtensilsCrossed } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true }) => {
  const sizes = {
    sm: { icon: 16, text: 'text-lg' },
    md: { icon: 24, text: 'text-xl' },
    lg: { icon: 32, text: 'text-2xl' },
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <UtensilsCrossed 
          className="text-mess-600 dark:text-mess-400" 
          size={sizes[size].icon} 
        />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-mess-300 dark:bg-mess-700 rounded-full animate-pulse" />
      </div>
      {showText && (
        <span className={`font-bold ${sizes[size].text} bg-gradient-to-r from-mess-700 to-mess-500 dark:from-mess-400 dark:to-mess-600 bg-clip-text text-transparent`}>
          HostelChow
        </span>
      )}
    </div>
  );
};

export default Logo;
