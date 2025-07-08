import React, { useState, useEffect } from 'react';
import { formatRupiah } from '../../utils';

const EditDonasi = ({ program, onSave, onCancel, isSubmitting }) => {
    const [formData, setFormData] = useState({
        nama_barang: '',
        deskripsi: '',
        target_dana: '',
        kategori_barang: '',
        deadline: '',
        foto_barang: null
    });
    const [preview, setPreview] = useState(null);
    const [errors, setErrors] = useState({});

    // Load data program ke form
    useEffect(() => {
        if (program) {
            setFormData({
                nama_barang: program.nama_barang || '',
                deskripsi: program.deskripsi || '',
                target_dana: program.target_dana?.toString() || '',
                kategori_barang: program.kategori_barang || '',
                deadline: program.deadline || '',
                foto_barang: null // File baru opsional
            });
        }
    }, [program]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear error saat user mulai mengetik
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, foto_barang: file }));
            
            // Preview image
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validasi
        const newErrors = {};
        
        if (!formData.nama_barang.trim()) {
            newErrors.nama_barang = 'Nama barang harus diisi';
        }
        
        if (!formData.deskripsi.trim()) {
            newErrors.deskripsi = 'Deskripsi harus diisi';
        }
        
        const targetDana = parseInt(formData.target_dana) || 0;
        if (targetDana <= 0) {
            newErrors.target_dana = 'Target dana harus lebih dari 0';
        }
        
        if (!formData.kategori_barang) {
            newErrors.kategori_barang = 'Kategori barang harus dipilih';
        }
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        
        // Submit data
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Edit Program Donasi</h2>
                        <button
                            onClick={onCancel}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Nama Barang */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nama Barang *
                            </label>
                            <input
                                type="text"
                                name="nama_barang"
                                value={formData.nama_barang}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                                    errors.nama_barang ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Contoh: Sound System Masjid"
                            />
                            {errors.nama_barang && (
                                <p className="text-red-500 text-sm mt-1">{errors.nama_barang}</p>
                            )}
                        </div>

                        {/* Deskripsi */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Deskripsi *
                            </label>
                            <textarea
                                name="deskripsi"
                                value={formData.deskripsi}
                                onChange={handleInputChange}
                                rows={3}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                                    errors.deskripsi ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Jelaskan kebutuhan dan manfaat barang ini untuk masjid..."
                            />
                            {errors.deskripsi && (
                                <p className="text-red-500 text-sm mt-1">{errors.deskripsi}</p>
                            )}
                        </div>

                        {/* Target Dana */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Target Dana *
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-500">Rp</span>
                                <input
                                    type="text"
                                    name="target_dana"
                                    value={formatRupiah(formData.target_dana)}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/[^\d]/g, '');
                                        setFormData(prev => ({ ...prev, target_dana: value }));
                                    }}
                                    className={`w-full pl-8 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                                        errors.target_dana ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="1.000.000"
                                />
                            </div>
                            {errors.target_dana && (
                                <p className="text-red-500 text-sm mt-1">{errors.target_dana}</p>
                            )}
                        </div>

                        {/* Kategori */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Kategori Barang *
                            </label>
                            <select
                                name="kategori_barang"
                                value={formData.kategori_barang}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                                    errors.kategori_barang ? 'border-red-500' : 'border-gray-300'
                                }`}
                            >
                                <option value="">Pilih kategori...</option>
                                <option value="elektronik">Elektronik</option>
                                <option value="furniture">Furniture</option>
                                <option value="konstruksi">Konstruksi</option>
                                <option value="lainnya">Lainnya</option>
                            </select>
                            {errors.kategori_barang && (
                                <p className="text-red-500 text-sm mt-1">{errors.kategori_barang}</p>
                            )}
                        </div>

                        {/* Deadline */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Deadline (Opsional)
                            </label>
                            <input
                                type="date"
                                name="deadline"
                                value={formData.deadline}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>

                        {/* Foto */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Foto Barang Baru (Opsional)
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                            {preview && (
                                <div className="mt-2">
                                    <img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded-md" />
                                </div>
                            )}
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditDonasi;