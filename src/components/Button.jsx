import React from 'react';

/**
 * Reusable Button component with variants and sizes
 * @param {Object} props
 * @param {string} props.variant - 'primary' | 'secondary' | 'danger' | 'ghost'
 * @param {string} props.size - 'sm' | 'md' | 'lg'
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {Function} props.onClick - Click handler
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.children - Button content
 */
const Button = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  className = '',
  children,
  type = 'button',
  ...rest
}) => {
  const baseClasses = 'font-semibold rounded-lg transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900';

  const variantClasses = {
    primary: 'bg-indigo-500 hover:bg-indigo-600 text-white focus:ring-indigo-500 active:scale-[0.98] hover:scale-[1.02] shadow-lg',
    secondary: 'bg-pink-500 hover:bg-pink-600 text-white focus:ring-pink-500 active:scale-[0.98] hover:scale-[1.02] shadow-lg',
    danger: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500 active:scale-[0.98] hover:scale-[1.02]',
    ghost: 'bg-slate-700 hover:bg-slate-600 text-slate-200 focus:ring-slate-500 active:scale-[0.98]',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const disabledClasses = disabled
    ? 'opacity-50 cursor-not-allowed hover:scale-100 active:scale-100'
    : '';

  const allClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`;

  return (
    <button
      type={type}
      className={allClasses}
      onClick={onClick}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
