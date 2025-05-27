import React from 'react';

const FloatingInput = ({ label, type, name, value, onChange, required, icon }) => {
  // Generate unique ID untuk input berdasarkan nama field
  const inputId = `floating-input-${name}`;
  
  // Fungsi format angka pakai koma (jika ada)
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
    <div className="relative">
      <input
        id={inputId}
        type={type === 'currency' ? 'text' : type}
        name={name}
        value={value}
        onChange={type === 'currency' ? handleChange : onChange}
        placeholder=" "
        required={required}
        className="peer w-full border rounded px-3 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <label
        htmlFor={inputId}
        className="absolute left-10 -top-2.5 bg-gray-50 px-1 text-gray-500 text-sm transition-all
          peer-placeholder-shown:top-2.5 peer-placeholder-shown:left-10 peer-placeholder-shown:text-base
          peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600"
      >
        {label}
      </label>
      <span className="absolute left-3 top-3 text-gray-500">
        {icon}
      </span>
    </div>
  );
};

export default FloatingInput;
