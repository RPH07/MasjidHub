import React, { useState } from 'react';
import FloatingInput from '../components/FloatingInput';

const ZakatForm = () => {
  const [formData, setFormData] = useState({
    nama: '',
    nominal: '',
    jenisZakat: '',
    bukti: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'bukti') {
      setFormData({ ...formData, bukti: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append('nama', formData.nama);
    data.append('nominal', formData.nominal);
    data.append('jenisZakat', formData.jenisZakat);
    data.append('bukti', formData.bukti);

    try {
      const response = await fetch('http://localhost:5000/api/zakat', {
        method: 'POST',
        body: data,
      });

      const result = await response.json();
      alert(result.message);
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat mengirim data.');
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded shadow mt-10">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-700">Form Pembayaran Zakat</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <FloatingInput
            label= "Nama Lengkap"
            type="text"
            name="nama"
            className="w-full border px-3 py-2 rounded"
            value={formData.nama}
            onChange={handleChange}
            required
          />
        </div>
        <div>
        <FloatingInput
            label="Nominal Zakat (Rp)"
            type="currency"
            name="nominal"
            value={formData.nominal}
            onChange={(e) =>
                setFormData({ ...formData, nominal: e.target.value })
            }
            required
        />

        </div>
        {/* Form Opsi */}
        <div className="relative w-full">
        <select
            name="jenisZakat"
            id="jenisZakat"
            value={formData.jenisZakat}
            onChange={handleChange}
           className="peer w-full border rounded px-3 pt-4 pb-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
        >
            <option value="" disabled >-- Pilih Jenis Zakat --</option>
            <option value="fitrah">Zakat Fitrah</option>
            <option value="maal">Zakat Maal</option>
            <option value="profesi">Zakat Profesi</option>
        </select>
        <label
            htmlFor="jenisZakat"
            className="absolute left-3 -top-2.5 bg-white px-1 text-gray-500 text-sm transition-all  
            peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base 
            peer-placeholder-shown:text-gray-400 peer-placeholder-shown:bg-transparent
            peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-teal-600 peer-focus:bg-white"
        >
            Jenis Zakat
        </label>
        </div>

        <div>
          <label className="block mb-1 font-semibold">Upload Bukti Transfer</label>
          <input
            type="file"
            name="bukti"
            accept="image/*"
            onChange={handleChange}
            required
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 rounded"
        >
          Kirim Zakat
        </button>
      </form>
    </div>
  );
};

export default ZakatForm;
