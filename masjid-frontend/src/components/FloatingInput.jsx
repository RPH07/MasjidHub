import React from 'react';

const FloatingInput = ({ label, type, name, value, onChange, required, icon }) => {
  // Fungsi format angka pakai koma
  const formatNumber = (val) => {
    return val
      .replace(/\D/g, '') // hapus semua karakter non-angka
      .replace(/\B(?=(\d{3})+(?!\d))/g, ','); // tambahkan koma
  };

  // Handler custom jika type === 'currency'
  const handleChange = (e) => {
    let inputValue = e.target.value;

    if (type === 'currency') {
      const raw = inputValue.replace(/,/g, ''); // hapus koma lama
      const formatted = formatNumber(raw);
      onChange({ target: { name, value: formatted } });
    } else {
      onChange(e);
    }
  };

  return (
<div className="relative">
      <input
        type={type}
        name={name}
        value={value}
        onChange={handleChange}
        placeholder=" "
        required={required}
        className="peer w-full border rounded px-3 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-teal-500"
      />
      <label
        className="absolute left-10 -top-2.5 bg-white px-1 text-gray-500 text-sm transition-all
          peer-placeholder-shown:top-2.5 peer-placeholder-shown:left-10 peer-placeholder-shown:text-base
          peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-sm
          peer-focus:text-teal-600 peer-focus:bg-white"
      >
        {label}
      </label>
      <span className="absolute left-3 top-2.5 text-gray-500">
        {icon}
      </span>
    </div>
  );
};

export default FloatingInput;
