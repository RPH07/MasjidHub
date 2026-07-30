import React from 'react';

const FloatingInput = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  required,
  icon,
  labelBgClass = 'bg-white',
  className = '',
  inputClassName = '',
  iconClassName = '',
  focusRingClass = 'focus:ring-blue-500',
  labelFocusClass = 'peer-focus:text-blue-600',
  rightElement,
  rightElementClassName = '',
  id,
  ...props
}) => {
  // Generate unique ID untuk input berdasarkan nama field
  const inputId = id || `floating-input-${name}`;
  const hasIcon = Boolean(icon);
  const inputPaddingClass = `${hasIcon ? 'pl-10' : 'pl-3'} ${rightElement ? 'pr-11' : 'pr-3'}`;
  const labelLeftClass = hasIcon
    ? 'left-10 peer-placeholder-shown:left-10'
    : 'left-3 peer-placeholder-shown:left-3';
  
  // Fungsi format angka pakai koma
  const formatNumber = (val) => {
    return val
      .replace(/\D/g, '')
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Handler custom jika type === 'currency'
  const handleChange = (e) => {
    let inputValue = e.target.value;

    if (type === 'currency') {
      const raw = inputValue.replace(/,/g, '');
      const formatted = formatNumber(raw);
      onChange({ target: { name, value: formatted } });
    } else {
      onChange(e);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        id={inputId}
        type={type === 'currency' ? 'text' : type}
        name={name}
        value={value}
        onChange={type === 'currency' ? handleChange : onChange}
        {...props}
        placeholder=" "
        required={required}
        className={`peer h-12 w-full rounded border ${inputPaddingClass} pt-4 pb-2 focus:outline-none focus:ring-2 ${focusRingClass} ${inputClassName}`}
      />
      <label
        htmlFor={inputId}
        className={`absolute ${labelLeftClass} -top-2.5 px-1 text-sm text-gray-500 transition-all ${labelBgClass}
          peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base
          peer-focus:-top-2.5 peer-focus:translate-y-0 peer-focus:text-sm ${labelFocusClass}`}
      >
        {label}
      </label>
      {icon && (
        <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 ${iconClassName}`}>
          {icon}
        </span>
      )}
      {rightElement && (
        <div className={`absolute right-3 top-1/2 -translate-y-1/2 ${rightElementClassName}`}>
          {rightElement}
        </div>
      )}
    </div>
  );
};

export default FloatingInput;
