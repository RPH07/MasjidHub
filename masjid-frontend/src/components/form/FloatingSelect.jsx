import React from 'react';

const FloatingSelect = ({ label, name, value, onChange, required, icon, children, options }) => {
  // Generate unique ID untuk select berdasarkan nama field
  const selectId = `floating-select-${name}`;
  
  return (
    <div className="relative">
      <select
        id={selectId}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="peer w-full border rounded px-3 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {/*OPTION KOSONG untuk floating effect */}
        <option value="" disabled hidden></option>
        {options ? (
          options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))
        ) : (
          children
        )}
      </select>
      <label
        htmlFor={selectId}
        className={`absolute left-10 px-1 transition-all pointer-events-none
          ${value 
            ? '-top-2.5 text-sm text-blue-600' 
            : 'top-2.5 text-base text-gray-500 bg-transparent'
          }
          peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600 peer-focus:bg-white`}
      >
        {label}
      </label>
      <span className="absolute left-3 top-3 text-gray-500">
        {icon}
      </span>
    </div>
  );
};

export default FloatingSelect;