import React from 'react';

const FloatingTextArea = ({ label, name, value, onChange, required, icon, rows = 4 }) => {
  // Generate unique ID untuk textarea berdasarkan nama field
  const textareaId = `floating-textarea-${name}`;
  
  return (
    <div className="relative">
      <textarea
        id={textareaId}
        name={name}
        value={value}
        onChange={onChange}
        placeholder=" "
        required={required}
        rows={rows}
        className="peer w-full border rounded px-3 pt-6 pb-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-none"
      />
      <label
        htmlFor={textareaId}
        className="absolute left-10 -top-2.5 bg-gray-50 px-1 text-gray-500 text-sm transition-all
          peer-placeholder-shown:top-3 peer-placeholder-shown:left-10 peer-placeholder-shown:text-base
          peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600 peer-focus:bg-gray-50"
      >
        {label}
      </label>
      <span className="absolute left-3 top-3.5 text-gray-500">
        {icon}
      </span>
    </div>
  );
};

export default FloatingTextArea;