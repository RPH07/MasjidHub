import React, { useState, useEffect, useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import ErrorBoundary from '../../components/ErrorBoundary/ErrorBoundary';
import { 
  KegiatanForm, 
  KegiatanList, 
  KategoriManager 
} from '.././../components/kegiatan-components/components';
import { useKegiatan, useKategori } from '.././../components/kegiatan-components/hooks';
import { initialFormData } from '.././../components/kegiatan-components/utils';

const KegiatanPage = () => {
  // States
  const [formData, setFormData] = useState(initialFormData);
  const [foto, setFoto] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const fileInputRef = useRef(null);

  // Custom hooks
  const {
    kegiatan,
    isLoading: kegiatanLoading,
    sortOrder,
    fetchKegiatan,
    handleSort,
    createKegiatan,
    updateKegiatan,
    deleteKegiatan
  } = useKegiatan();

  const {
    kategoriList,
    showKategoriManager,
    newKategori,
    isLoading: kategoriLoading,
    fetchKategori,
    handleKategoriChange,
    createKategori,
    toggleKategoriManager,
    setShowKategoriManager
  } = useKategori();

  // Effects
  useEffect(() => {
    fetchKegiatan();
    fetchKategori();
  }, [fetchKegiatan, fetchKategori]);

  // Form handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Ukuran file maksimal 5MB!');
        return;
      }
      setFoto(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();
    formDataToSend.append('nama_kegiatan', formData.nama_kegiatan);
    formDataToSend.append('tanggal', formData.tanggal);
    formDataToSend.append('lokasi', formData.lokasi);
    formDataToSend.append('deskripsi', formData.deskripsi);
    formDataToSend.append('kategori', formData.kategori || 'pengajian');
    if (foto) formDataToSend.append('foto', foto);

    let success = false;
    if (isEditing) {
      success = await updateKegiatan(editingId, formDataToSend);
      if (success) {
        setEditingId(null);
        setIsEditing(false);
      }
    } else {
      success = await createKegiatan(formDataToSend);
    }
    
    if (success) {
      setFormData(initialFormData);
      setFoto(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setIsEditing(true);
    setFormData({
      nama_kegiatan: item.nama_kegiatan,
      tanggal: item.tanggal,
      lokasi: item.lokasi,
      deskripsi: item.deskripsi,
      kategori: item.kategori || ''
    });
    setFoto(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    toast.success('Mode edit aktif!', {
      icon: '✏️',
      duration: 2000
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setIsEditing(false);
    setFormData(initialFormData);
    setFoto(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
    
    toast('Edit dibatalkan', {
      icon: 'ℹ️',
      duration: 2000
    });
  };

  const handleKategoriSubmit = async () => {
    const success = await createKategori();
    return success;
  };

  return (
    <div className="p-4 space-y-6">
      {/* Toast Container */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
            fontSize: '14px'
          },
          success: {
            style: {
              background: '#10b981',
              color: '#fff'
            }
          },
          error: {
            style: {
              background: '#ef4444',
              color: '#fff'
            }
          }
        }}
      />
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Kelola Kegiatan Masjid</h1>
        
        <div className="flex items-center gap-3">
          <button
            onClick={toggleKategoriManager}
            disabled={kategoriLoading} 
            className={`px-4 py-2 text-white rounded flex items-center gap-2 transition-colors ${
              kategoriLoading 
                ? 'bg-purple-400 cursor-not-allowed' 
                : 'bg-purple-500 hover:bg-purple-600'
            }`}
          >
            {kategoriLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            )}
            {kategoriLoading ? 'Loading...' : 'Kelola Kategori'}
          </button>
          
          {isEditing && (
            <div className="flex items-center gap-2 bg-orange-100 text-orange-800 px-3 py-1 rounded-full">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span className="text-sm font-medium">Mode Edit</span>
            </div>
          )}
        </div>
      </div>

      {/* Kategori Manager Modal */}
      <KategoriManager
        showModal={showKategoriManager}
        onClose={() => setShowKategoriManager(false)}
        newKategori={newKategori}
        onKategoriChange={handleKategoriChange}
        onSubmit={handleKategoriSubmit}
      />

      {/* Form Section */}
      <ErrorBoundary>
        <KegiatanForm
          formData={formData}
          onChange={handleChange}
          onSubmit={handleSubmit}
          kategoriList={kategoriList}
          foto={foto}
          onFileChange={handleFileChange}
          isEditing={isEditing}
          onCancelEdit={handleCancelEdit}
          fileInputRef={fileInputRef}
          onCreateKategori={createKategori} // ✅ Pass function dari useKategori hook
        />
      </ErrorBoundary>

      {/* List Section */}
      <KegiatanList
        kegiatan={kegiatan}
        kategoriList={kategoriList}
        isLoading={kegiatanLoading}
        sortOrder={sortOrder}
        onSort={handleSort}
        onEdit={handleEdit}
        onDelete={deleteKegiatan}
      />
    </div>
  );
};

export default KegiatanPage;