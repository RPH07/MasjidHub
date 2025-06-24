import React, { useState, useEffect } from 'react'
import { useLelang } from '../../hooks'
import { KONDISI_BARANG, DURASI_LELANG } from '../../utils'

const LelangTambah = ({ editData = null, onSuccess, onCancel }) => {
    const {
        createBarangLelang,
        updateBarangLelang,
        loading
    } = useLelang()

    const [formData, setFormData] = useState({
        nama_barang: '',
        deskripsi: '',
        harga_awal: '',
        kondisi_barang: 'bekas_baik',
        durasi_lelang_jam: '24'
    })

    const [selectedFile, setSelectedFile] = useState(null)
    const [previewImage, setPreviewImage] = useState(null)
    const [errors, setErrors] = useState({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    const isEditMode = Boolean(editData)

    // Load data untuk edit mode
    useEffect(() => {
        if (editData) {
            setFormData({
                nama_barang: editData.nama_barang || '',
                deskripsi: editData.deskripsi || '',
                harga_awal: editData.harga_awal?.toString() || '',
                kondisi_barang: editData.kondisi_barang || 'bekas_baik',
                durasi_lelang_jam: editData.durasi_lelang_jam?.toString() || '24'
            })

            // Set preview image dari existing foto
            if (editData.foto_barang) {
                setPreviewImage(`http://localhost:5000/uploads/${editData.foto_barang}`)
            }
        } else {
            // Reset form untuk mode tambah
            setFormData({
                nama_barang: '',
                deskripsi: '',
                harga_awal: '',
                kondisi_barang: 'bekas_baik',
                durasi_lelang_jam: '24'
            })
            setSelectedFile(null)
            setPreviewImage(null)
        }
        setErrors({})
    }, [editData])

    // Handle input change
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

    // Handle file change
    const handleFileChange = (e) => {
        const file = e.target.files[0]

        if (file) {
            // Validasi file
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
            const maxSize = 5 * 1024 * 1024 // 5MB

            if (!validTypes.includes(file.type)) {
                setErrors(prev => ({
                    ...prev,
                    foto: 'File harus berupa gambar (JPG, PNG, WebP)'
                }))
                return
            }

            if (file.size > maxSize) {
                setErrors(prev => ({
                    ...prev,
                    foto: 'Ukuran file maksimal 5MB'
                }))
                return
            }

            setSelectedFile(file)
            setErrors(prev => ({ ...prev, foto: '' }))

            // Create preview
            const reader = new FileReader()
            reader.onload = (e) => {
                setPreviewImage(e.target.result)
            }
            reader.readAsDataURL(file)
        }
    }

    // Remove image
    const handleRemoveImage = () => {
        setSelectedFile(null)
        setPreviewImage(null)
        // Reset file input
        const fileInput = document.getElementById('foto-input')
        if (fileInput) fileInput.value = ''
    }

    // Validate form
    const validateForm = () => {
        const newErrors = {}

        if (!formData.nama_barang.trim()) {
            newErrors.nama_barang = 'Nama barang wajib diisi'
        }

        if (!formData.harga_awal || parseInt(formData.harga_awal) <= 0) {
            newErrors.harga_awal = 'Harga awal harus lebih dari 0'
        }

        if (parseInt(formData.harga_awal) < 1000) {
            newErrors.harga_awal = 'Harga awal minimal Rp 1.000'
        }

        if (!isEditMode && !selectedFile) {
            newErrors.foto = 'Foto barang wajib diupload'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Handle submit
    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        setIsSubmitting(true)

        try {
            let result

            if (isEditMode) {
                result = await updateBarangLelang(editData.id, formData, selectedFile)
            } else {
                result = await createBarangLelang(formData, selectedFile)
            }

            if (result.success) {
                alert(result.message)

                if (!isEditMode) {
                    // Reset form setelah berhasil tambah
                    setFormData({
                        nama_barang: '',
                        deskripsi: '',
                        harga_awal: '',
                        kondisi_barang: 'bekas_baik',
                        durasi_lelang_jam: '24'
                    })
                    setSelectedFile(null)
                    setPreviewImage(null)

                    // Reset file input
                    const fileInput = document.getElementById('foto-input')
                    if (fileInput) fileInput.value = ''
                }

                // Callback untuk parent component
                onSuccess?.()
            } else {
                alert(result.message)
            }
        } catch (error) {
            console.error('Error submitting form:', error)
            alert('Terjadi kesalahan tidak terduga')
        } finally {
            setIsSubmitting(false)
        }
    }

    // Format rupiah untuk display
    const formatRupiahDisplay = (value) => {
        if (!value) return ''
        const number = parseInt(value.replace(/\D/g, ''))
        return new Intl.NumberFormat('id-ID').format(number)
    }

    // Handle rupiah input
    const handleRupiahChange = (e) => {
        const value = e.target.value.replace(/\D/g, '') // Remove non-digits
        setFormData(prev => ({
            ...prev,
            harga_awal: value
        }))

        if (errors.harga_awal) {
            setErrors(prev => ({ ...prev, harga_awal: '' }))
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                        {isEditMode ? 'Edit Barang Lelang' : 'Tambah Barang Lelang'}
                    </h2>
                    <p className="text-gray-600 text-sm">
                        {isEditMode
                            ? 'Perbarui informasi barang lelang (hanya bisa edit jika status masih draft)'
                            : 'Isi form di bawah untuk menambahkan barang baru ke dalam daftar lelang'
                        }
                    </p>
                </div>

                {isEditMode && onCancel && (
                    <button
                        onClick={onCancel}
                        className="text-gray-600 hover:text-gray-800 px-3 py-1 rounded border border-gray-300 text-sm"
                    >
                        Batal Edit
                    </button>
                )}
            </div>

            {/* Form */}
            <div className="bg-white shadow rounded-lg p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Foto Barang */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Foto Barang {!isEditMode && <span className="text-red-500">*</span>}
                        </label>

                        <div className="flex items-start space-x-4">
                            {/* Preview Image */}
                            <div className="flex-shrink-0">
                                {previewImage ? (
                                    <div className="relative">
                                        <img
                                            src={previewImage}
                                            alt="Preview"
                                            className="h-32 w-32 rounded-lg object-cover border-2 border-gray-200"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ) : (
                                    <div className="h-32 w-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="text-gray-400 text-2xl mb-1">📷</div>
                                            <div className="text-xs text-gray-500">No Image</div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* File Input */}
                            <div className="flex-1">
                                <input
                                    id="foto-input"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Format: JPG, PNG, WebP. Maksimal 5MB.
                                    {isEditMode && ' Kosongkan jika tidak ingin mengubah foto.'}
                                </p>
                                {errors.foto && (
                                    <p className="text-red-500 text-sm mt-1">{errors.foto}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Nama Barang */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nama Barang <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="nama_barang"
                            value={formData.nama_barang}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.nama_barang ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Contoh: Kursi Kayu Jati Antik"
                        />
                        {errors.nama_barang && (
                            <p className="text-red-500 text-sm mt-1">{errors.nama_barang}</p>
                        )}
                    </div>

                    {/* Deskripsi */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Deskripsi Barang
                        </label>
                        <textarea
                            name="deskripsi"
                            value={formData.deskripsi}
                            onChange={handleInputChange}
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Jelaskan kondisi, ukuran, atau detail lainnya..."
                        />
                        <p className="text-xs text-gray-500 mt-1">Opsional. Akan membantu jamaah memahami barang yang dilelang.</p>
                    </div>

                    {/* Row: Harga Awal & Kondisi */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Harga Awal */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Harga Awal <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-500 text-sm">Rp</span>
                                <input
                                    type="text"
                                    name="harga_awal"
                                    value={formatRupiahDisplay(formData.harga_awal)}
                                    onChange={handleRupiahChange}
                                    className={`w-full pl-8 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.harga_awal ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="50.000"
                                />
                            </div>
                            {errors.harga_awal && (
                                <p className="text-red-500 text-sm mt-1">{errors.harga_awal}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">Harga minimum untuk memulai lelang</p>
                        </div>

                        {/* Kondisi Barang */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Kondisi Barang
                            </label>
                            <select
                                name="kondisi_barang"
                                value={formData.kondisi_barang}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {Object.entries(KONDISI_BARANG).map(([key, value]) => (
                                    <option key={key} value={value}>
                                        {value.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Durasi Lelang */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Durasi Lelang
                        </label>
                        <select
                            name="durasi_lelang_jam"
                            value={formData.durasi_lelang_jam}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {DURASI_LELANG.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                            Lelang akan berjalan selama durasi yang dipilih. Auto-extend 2 menit jika ada bid dalam 2 menit terakhir.
                        </p>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-3 pt-6 border-t">
                        {isEditMode && onCancel && (
                            <button
                                type="button"
                                onClick={onCancel}
                                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Batal
                            </button>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting || loading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            {isSubmitting || loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    {isEditMode ? 'Menyimpan...' : 'Menambahkan...'}
                                </>
                            ) : (
                                isEditMode ? 'Simpan Perubahan' : 'Tambah Barang Lelang'
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">💡 Tips Lelang Sukses</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Upload foto yang jelas dan menarik untuk menarik minat jamaah</li>
                    <li>• Tulis deskripsi detail tentang kondisi dan spesifikasi barang</li>
                    <li>• Tentukan harga awal yang wajar, tidak terlalu tinggi atau rendah</li>
                    <li>• Pilih durasi yang sesuai - 24 jam untuk barang biasa, 48-72 jam untuk barang berharga</li>
                </ul>
            </div>
        </div>
    )
}

export default LelangTambah