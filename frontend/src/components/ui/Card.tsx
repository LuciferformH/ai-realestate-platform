import React from 'react';
import { motion } from 'framer-motion';

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
  gradientBorder?: boolean;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-7',
};

const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => (
  <div className={`border-b border-white/10 pb-4 mb-4 ${className}`}>{children}</div>
);

const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => (
  <div className={className}>{children}</div>
);

const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => (
  <div className={`border-t border-white/10 pt-4 mt-4 ${className}`}>{children}</div>
);

const Card: React.FC<CardProps> & {
  Header: typeof CardHeader;
  Content: typeof CardContent;
  Footer: typeof CardFooter;
} = ({ children, className = '', gradientBorder = false, hover = true, padding = 'md' }) => {
  const borderClass = gradientBorder
    ? 'bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 p-[1px]'
    : '';

  return (
    <motion.div
      whileHover={hover ? { y: -2, scale: 1.005 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`relative ${borderClass} rounded-2xl`}
    >
      <div
        className={`
          bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl
          shadow-xl shadow-black/10
          ${paddingStyles[padding]}
          ${className}
        `}
      >
        {children}
      </div>
    </motion.div>
  );
};

Card.Header = CardHeader;
Card.Content = CardContent;
Card.Footer = CardFooter;

export { Card, CardHeader, CardContent, CardFooter };
