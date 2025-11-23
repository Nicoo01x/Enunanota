import React from 'react';

/**
 * Reusable Input component with label and error message
 * @param {Object} props
 * @param {string} props.label - Input label
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.value - Input value
 * @param {Function} props.onChange - Change handler
 * @param {string} props.error - Error message to display
 * @param {string} props.type - Input type
 * @param {string} props.className - Additional CSS classes
 */
const Input = ({
  label,
  placeholder = '',
  value,
  onChange,
  error = '',
  type = 'text',
  className = '',
  ...rest
}) => {
  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-slate-200">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`px-4 py-2 bg-slate-700 border ${
          error ? 'border-red-500' : 'border-slate-600'
        } rounded-lg text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
        {...rest}
      />
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default Input;
