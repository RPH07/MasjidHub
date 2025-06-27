import React, { useState } from 'react'
import { useDonasi } from '../../hooks/useDonasi'
import { KATEGORI_BARANG } from '../../utils/constants'
import { validateProgramForm } from '../../utils/helpers'

const TambahDonasi = () => {
    const { createProgramDonasi, loading } = useDonasi()
    
    const [formData, setFormData] = useState({
        nama_barang: '',
        deskripsi: '',
        target_dana: '',
        kategori_barang: '',
        deadline: '',
        foto_barang: null
    })

    const [errors, setErrors] = useState({})
    const [preview, setPreview] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))

        // Clear error ketika user mulai input
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            // Validasi file
            if (file.size > 2 * 1024 * 1024) { // 2MB
                setErrors(prev => ({
                    ...prev,
                    foto_barang: 'Ukuran file maksimal 2MB'
                }))
                return
            }

            if (!file.type.startsWith('image/')) {
                setErrors(prev => ({
                    ...prev,
                    foto_barang: 'File harus berupa gambar'
                }))
                return
            }

            setFormData(prev => ({
                ...prev,
                foto_barang: file
            }))

            // Create preview
            const reader = new FileReader()
            reader.onload = (e) => setPreview(e.target.result)
            reader.readAsDataURL(file)

            // Clear error
            if (errors.foto_barang) {
                setErrors(prev => ({
                    ...prev,
                    foto_barang: ''
                }))
            }
        }
    }

    const handleRemoveImage = () => {
        setFormData(prev => ({
            ...prev,
            foto_barang: null
        }))
        setPreview(null)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)

        // Validasi form
        const validation = validateProgramForm(formData)
        if (!validation.isValid) {
            setErrors(validation.errors)
            setIsSubmitting(false)
            return
        }

        // Validasi tambahan
        const newErrors = {}
        
        if (parseInt(formData.target_dana) < 100000) {
            newErrors.target_dana = 'Target dana minimal Rp 100.000'
        }

        if (formData.deadline) {
            const selectedDate = new Date(formData.deadline)
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            
            if (selectedDate < today) {
                newErrors.deadline = 'Deadline tidak boleh di masa lalu'
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            setIsSubmitting(false)
            return
        }

        try {
            const result = await createProgramDonasi(formData, formData.foto_barang)
            
            if (result.success) {
                alert('Program donasi berhasil ditambahkan!')
                // Reset form
                setFormData({
                    nama_barang: '',
                    deskripsi: '',
                    target_dana: '',
                    kategori_barang: '',
                    deadline: '',
                    foto_barang: null
                })
                setPreview(null)
                setErrors({})
            } else {
                alert(result.message)
            }
        } catch (error) {
            console.error('Error creating program:', error)
            alert('Terjadi kesalahan saat menambahkan program donasi')
        } finally {
            setIsSubmitting(false)
        }
    }

    const formatRupiah = (value) => {
        if (!value) return ''
        return new Intl.NumberFormat('id-ID').format(value)
    }

    const handleTargetDanaChange = (e) => {
        const value = e.target.value.replace(/\D/g, '') // Remove non-digits
        setFormData(prev => ({
            ...prev,
            target_dana: value
        }))

        if (errors.target_dana) {
            setErrors(prev => ({
                ...prev,
                target_dana: ''
            }))
        }
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Tambah Program Donasi Baru
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Kolom Kiri */}
                        <div className="space-y-6">
                            {/* Nama Barang */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nama Barang/Kebutuhan *
                                </label>
                                <input
                                    type="text"
                                    name="nama_barang"
                                    value={formData.nama_barang}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                                        errors.nama_barang ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Contoh: AC Split 1 PK untuk Ruang Sholat"
                                />
                                {errors.nama_barang && (
                                    <p className="text-red-500 text-sm mt-1">{errors.nama_barang}</p>
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
                                    <option value="">Pilih kategori</option>
                                    <option value={KATEGORI_BARANG.ELEKTRONIK}>Elektronik</option>
                                    <option value={KATEGORI_BARANG.FURNITURE}>Furniture</option>
                                    <option value={KATEGORI_BARANG.PERLENGKAPAN_IBADAH}>Perlengkapan Ibadah</option>
                                    <option value={KATEGORI_BARANG.RENOVASI}>Renovasi</option>
                                    <option value={KATEGORI_BARANG.LAINNYA}>Lainnya</option>
                                </select>
                                {errors.kategori_barang && (
                                    <p className="text-red-500 text-sm mt-1">{errors.kategori_barang}</p>
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
                                        onChange={handleTargetDanaChange}
                                        className={`w-full pl-8 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                                            errors.target_dana ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="1.000.000"
                                    />
                                </div>
                                {errors.target_dana && (
                                    <p className="text-red-500 text-sm mt-1">{errors.target_dana}</p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">Minimal Rp 100.000</p>
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
                                    min={new Date().toISOString().split('T')[0]}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                                        errors.deadline ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.deadline && (
                                    <p className="text-red-500 text-sm mt-1">{errors.deadline}</p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">Kosongkan jika tidak ada batas waktu</p>
                            </div>
                        </div>

                        {/* Kolom Kanan */}
                        <div className="space-y-6">
                            {/* Deskripsi */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Deskripsi Program *
                                </label>
                                <textarea
                                    name="deskripsi"
                                    value={formData.deskripsi}
                                    onChange={handleInputChange}
                                    rows="6"
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                                        errors.deskripsi ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Jelaskan kebutuhan dan manfaat barang ini untuk masjid..."
                                />
                                {errors.deskripsi && (
                                    <p className="text-red-500 text-sm mt-1">{errors.deskripsi}</p>
                                )}
                            </div>

                            {/* Upload Foto */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Foto Barang/Referensi
                                </label>
                                
                                {!preview ? (
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                        <div className="mb-4">
                                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        <label className="cursor-pointer">
                                            <span className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                                                Pilih Foto
                                            </span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                        </label>
                                        <p className="text-xs text-gray-500 mt-2">PNG, JPG hingga 2MB</p>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <img
                                            src={preview}
                                            alt="Preview"
                                            className="w-full h-48 object-cover rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                                
                                {errors.foto_barang && (
                                    <p className="text-red-500 text-sm mt-1">{errors.foto_barang}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={() => {
                                if (window.confirm('Apakah Anda yakin ingin membatalkan? Data yang sudah diisi akan hilang.')) {
                                    setFormData({
                                        nama_barang: '',
                                        deskripsi: '',
                                        target_dana: '',
                                        kategori_barang: '',
                                        deadline: '',
                                        foto_barang: null
                                    })
                                    setPreview(null)
                                    setErrors({})
                                }
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Batal
                        </button>
                        
                        <button
                            type="submit"
                            disabled={isSubmitting || loading}
                            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Menyimpan...' : 'Simpan Program'}
                        </button>
                    </div>
                </form>

                {/* Info Box */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">Informasi</h3>
                            <div className="mt-2 text-sm text-blue-700">
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Program akan disimpan sebagai draft dan perlu diaktifkan secara manual</li>
                                    <li>Pastikan deskripsi jelas dan menarik untuk mendorong donasi</li>
                                    <li>Foto yang baik akan meningkatkan kepercayaan calon donatur</li>
                                    <li>Target dana sebaiknya realistis dan sesuai harga pasar</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TambahDonasi