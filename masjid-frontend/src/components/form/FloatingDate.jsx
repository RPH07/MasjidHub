import React from 'react';

const FloatingDateInput = ({ label, name, value, onChange, required, icon }) => {
  // Generate unique ID untuk input
  const inputId = `floating-date-${name}`;
  
  return (
    <div className="relative">
      <input
        id={inputId}
        type="date"
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="peer w-full border rounded px-3 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 "
      />
      <label
        htmlFor={inputId}
        className={`absolute left-10 ${value ? '-top-2.5 text-sm bg-gray-50' : 'top-2.5 text-base bg-gray-50'} px-1 text-gray-500 transition-all peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600 peer-focus:bg-gray-50`}
      >
        {label}
      </label>
      <span className="absolute left-3 top-2.5 text-gray-500">
        {icon}
      </span>
    </div>
  );
};

export default FloatingDateInput;