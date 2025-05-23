import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

const KegiatanPage = () => {
  const [kegiatan, setKegiatan] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [formData, setFormData] = useState({
    nama_kegiatan: '',
    tanggal: '',
    lokasi: '',
    deskripsi: ''
  });
  const [foto, setFoto] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchKegiatan();
  }, []);

  const fetchKegiatan = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/kegiatan');
      setKegiatan(res.data);
      setOriginalData(res.data);
    } catch (err) {
      console.error('Gagal mengambil data kegiatan:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFoto(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append('nama_kegiatan', formData.nama_kegiatan);
    formDataToSend.append('tanggal', formData.tanggal);
    formDataToSend.append('lokasi', formData.lokasi);
    formDataToSend.append('deskripsi', formData.deskripsi);
    if (foto) formDataToSend.append('foto', foto);

    try {
      await axios.post('http://localhost:5000/api/kegiatan', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData({ nama_kegiatan: '', tanggal: '', lokasi: '', deskripsi: '' });
      setFoto(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = null; // Reset file input
      }
      fetchKegiatan();
    } catch (err) {
      console.error('Gagal menambahkan kegiatan:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/kegiatan/${id}`);
      fetchKegiatan();
    } catch (err) {
      console.error('Gagal menghapus kegiatan:', err);
    }
  };

const handleSort = (order) => {
  const sorted = [...originalData].sort((a, b) => {
    // Convert string dates to Date objects for proper comparison
    const dateA = new Date(a.tanggal + 'T00:00:00'); // Add time component
    const dateB = new Date(b.tanggal + 'T00:00:00');
    
    // Return comparison based on order
    return order === 'asc' 
      ? dateA.getTime() - dateB.getTime()
      : dateB.getTime() - dateA.getTime();
  });
  setKegiatan(sorted);
};

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Kelola Kegiatan Masjid</h1>

      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        <input
          type="text"
          name="nama_kegiatan"
          value={formData.nama_kegiatan}
          onChange={handleChange}
          placeholder="Nama Kegiatan"
          required
          className="border px-3 py-2 rounded"
        />
        <input
          type="date"
          name="tanggal"
          value={formData.tanggal}
          onChange={handleChange}
          required
          className="border px-3 py-2 rounded"
        />
        <input
          type="text"
          name="lokasi"
          value={formData.lokasi}
          onChange={handleChange}
          placeholder="Lokasi"
          required
          className="border px-3 py-2 rounded"
        />
        <input
          type="file"
          name="foto"
          onChange={handleFileChange}
          accept="image/*"
          className="md:col-span-2"
          ref={fileInputRef}
        />
        <textarea
          name="deskripsi"
          value={formData.deskripsi}
          onChange={handleChange}
          placeholder="Deskripsi kegiatan"
          required
          className="md:col-span-2 border px-3 py-2 rounded resize-none"
        />
        <button
          type="submit"
          className="md:col-span-2 bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Tambah Kegiatan
        </button>
      </form>

      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Daftar Kegiatan</h2>
          <select
            onChange={(e) => handleSort(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="desc">Terlama</option>
            <option value="asc">Terbaru</option>
          </select>
        </div>

        <ul className="space-y-3">
          {kegiatan.map((item) => (
            <li key={item.id} className="border p-4 rounded space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold">{item.nama_kegiatan}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(item.tanggal).toLocaleDateString('id-ID')} - {item.lokasi}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">{item.deskripsi}</p>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-red-600 hover:underline"
                >
                  Hapus
                </button>
              </div>
              {item.foto && (
                <img
                  src={`http://localhost:5000/uploads/${item.foto}`}
                  alt="Foto kegiatan"
                  className="w-32 h-auto rounded"
                />
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default KegiatanPage;
