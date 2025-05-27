import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { FloatingInput, FloatingTextarea, FloatingDate } from '../../components/form';

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
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const getSortLabel = (order) => {
    return order === 'desc' ? 'Terbaru' : 'Terlama';
  };
  const [isLoading, setIsLoading] = useState(false);

  const fetchKegiatan = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/kegiatan');
      const data = res.data;
      setOriginalData(data);
      const sorted = sortData(data, 'desc');
      setKegiatan(sorted);
    } catch (err) {
      console.error('Gagal mengambil data kegiatan:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKegiatan();
  }, [fetchKegiatan]);

  const sortData = (data, order = 'desc') =>{
    return [...data].sort((a, b) => {
      const dateA = new Date(a.tanggal);
      const dateB = new Date(b.tanggal);
      if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
        return 0;
      }
      return order === 'asc'
        ? dateB.getTime() - dateA.getTime()
        : dateA.getTime() - dateB.getTime();
    });
  }

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

const [sortOrder, setSortOrder] = useState('desc');
const handleSort = useCallback((order) => {
  setSortOrder(order);
  const sorted = sortData(originalData, order);
  setKegiatan(sorted);
}, [originalData]);

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Kelola Kegiatan Masjid</h1>

      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        {/* Nama Kegiatan */}
        <div className="col-span-2 md:col-span-1">
          <FloatingInput
            label="Nama Kegiatan"
            type="text"
            name="nama_kegiatan"
            value={formData.nama_kegiatan}
            onChange={handleChange}
            required
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
          />
        </div>

        {/* Tanggal Kegiatan */}
        <div className="col-span-2 md:col-span-1">
          <FloatingDate
            label="Tanggal Kegiatan"
            name="tanggal"
            value={formData.tanggal}
            onChange={handleChange}
            required
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
        </div>

        {/* Lokasi */}
        <div className="col-span-2 md:col-span-1">
          <FloatingInput
            label="Lokasi"
            type="text"
            name="lokasi"
            value={formData.lokasi}
            onChange={handleChange}
            required
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          />
        </div>

        {/* Upload Foto */}
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-3">
            <div className="flex justify-center items-center bg-gray-50 border border-gray-300 rounded-md px-2 py-3.5">
              <svg className="w-5 h-5 text-gray-500 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {/* <label htmlFor="foto-input" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Upload Foto
              </label> */}
            </div>
            
            <div className="flex-1">
              <input
                id="foto-input"
                type="file"
                name="foto"
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
              />
              
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className={`w-full py-4 px-3 border rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  foto 
                    ? 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100' 
                    : 'border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {foto ? `✓ ${foto.name} (${(foto.size / 1024).toFixed(2)} KB)` : 'Pilih Foto'}
              </button>
            </div>
          </div>
        </div>

        {/* Deskripsi */}
        <div className="col-span-2">
          <FloatingTextarea
            label="Deskripsi Kegiatan"
            name="deskripsi"
            value={formData.deskripsi}
            onChange={handleChange}
            placeholder=" "
            required
            className="peer w-full border rounded px-3 pt-6 pb-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-none"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            }
          />
        </div>

        {/* Submit Button  */}
        <button
          type="submit"
          className="col-span-2 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Tambah Kegiatan
        </button>
      </form>

      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Daftar Kegiatan</h2>
          
          <div className="relative">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center gap-2 px-3 py-1 border rounded hover:bg-gray-50 focus:outline-none"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
              <span className="text-sm">{getSortLabel(sortOrder)}</span>
              <svg 
                className={`w-4 h-4 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Dropdown Menu */}
            {showSortDropdown && (
              <div className="absolute right-0 mt-1 w-48 bg-white border rounded-md shadow-lg z-10">
                <div className="py-1">
                  <button
                    onClick={() => {
                      handleSort('desc');
                      setShowSortDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2 ${
                      sortOrder === 'desc' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                    </svg>
                    Terbaru
                    {sortOrder === 'desc' && (
                      <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      handleSort('asc');
                      setShowSortDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2 ${
                      sortOrder === 'asc' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" transform="rotate(180 12 12)" />
                    </svg>
                    Terlama
                    {sortOrder === 'asc' && (
                      <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        {showSortDropdown && (
          <div
            className="fixed inset-0 z-0"
            onClick={() => setShowSortDropdown(false)}
          ></div>
        )}
        {isLoading ? (<div>Loading...</div>) : (
          <ul className="space-y-3 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
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
        )}

      </div>
    </div>
  );
};

export default KegiatanPage;
