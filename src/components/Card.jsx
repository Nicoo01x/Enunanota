import React from 'react';

/**
 * Reusable Card component for content containers
 * @param {Object} props
 * @param {string} props.title - Optional card title
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.children - Card content
 */
const Card = ({ title, className = '', children }) => {
  return (
    <div className={`bg-slate-800 rounded-xl shadow-lg p-4 md:p-6 ${className}`}>
      {title && (
        <h2 className="text-2xl font-semibold text-slate-50 mb-4">
          {title}
        </h2>
      )}
      {children}
    </div>
  );
};

export default Card;
