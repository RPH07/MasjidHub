import React from 'react';

const FloatingInput = ({ label, type, name, value, onChange }) => {
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
    <div className="relative w-full">
      <input
        type="text" // tetap pakai text biar koma bisa tampil
        name={name}
        id={name}
        placeholder=" "
        value={value}
        onChange={handleChange}
        className="peer w-full border rounded px-3 pt-3 pb-4 focus:outline-none focus:ring-2 focus:ring-teal-500"
        required
      />
      <label
        htmlFor={name}
        className="absolute left-3 -top-2.5 bg-white px-1 text-gray-500 text-sm transition-all duration-300 ease-in-out 
                   peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base 
                   peer-placeholder-shown:text-gray-400 peer-placeholder-shown:bg-transparent
                   peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-teal-600 peer-focus:bg-white"
      >
        {label}
      </label>
    </div>
  );
};

export default FloatingInput;
