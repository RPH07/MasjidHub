import React, { useState } from 'react'
import { formatRupiah } from '../../utils'
import { METODE_PEMBAYARAN } from '../../utils/constants'

const DonasiForm = ({
    program,
    onSubmit,
    loading = false
}) => {
    const [formData, setFormData] = useState({
        nama_donatur: '',
        kontak_donatur: '',
        nominal_donasi: '',
        metode_pembayaran: '',
        bukti_transfer: null,
        catatan: ''
    })

    const [errors, setErrors] = useState({})

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
        setFormData(prev => ({
            ...prev,
            bukti_transfer: file
        }))

        if (errors.bukti_transfer) {
            setErrors(prev => ({
                ...prev,
                bukti_transfer: ''
            }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Validasi
        const newErrors = {}
        if (!formData.nama_donatur.trim()) {
            newErrors.nama_donatur = 'Nama donatur wajib diisi'
        }
        if (!formData.nominal_donasi || parseInt(formData.nominal_donasi) < 10000) {
            newErrors.nominal_donasi = 'Nominal donasi minimal Rp 10.000'
        }
        if (!formData.metode_pembayaran) {
            newErrors.metode_pembayaran = 'Metode pembayaran wajib dipilih'
        }
        if (formData.metode_pembayaran !== 'tunai' && !formData.bukti_transfer) {
            newErrors.bukti_transfer = 'Bukti transfer wajib diupload'
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        const result = await onSubmit(formData)

        if (result.success) {
            // Reset form setelah berhasil
            setFormData({
                nama_donatur: '',
                kontak_donatur: '',
                nominal_donasi: '',
                metode_pembayaran: '',
                bukti_transfer: null,
                catatan: ''
            })
            setErrors({})
        }
    }

    const progressPercentage = (program.dana_terkumpul / program.target_dana) * 100

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Info Program */}
            <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-800">
                    <div className="font-medium">{program.nama_barang}</div>
                    <div className="mt-2">
                        <div className="flex justify-between text-xs mb-1">
                            <span>Dana Terkumpul: {formatRupiah(program.dana_terkumpul)}</span>
                            <span>Target: {formatRupiah(program.target_dana)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                            ></div>
                        </div>
                        <div className="text-xs text-center mt-1">
                            {progressPercentage.toFixed(1)}% tercapai
                        </div>
                    </div>
                </div>
            </div>

            {/* Nama Donatur */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Lengkap *
                </label>
                <input
                    type="text"
                    name="nama_donatur"
                    value={formData.nama_donatur}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        errors.nama_donatur ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Masukkan nama lengkap"
                />
                {errors.nama_donatur && (
                    <p className="text-red-500 text-sm mt-1">{errors.nama_donatur}</p>
                )}
            </div>

            {/* Kontak */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    No. HP/WhatsApp
                </label>
                <input
                    type="text"
                    name="kontak_donatur"
                    value={formData.kontak_donatur}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="08xxxxxxxxxx"
                />
            </div>

            {/* Nominal Donasi */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nominal Donasi *
                </label>
                <input
                    type="number"
                    name="nominal_donasi"
                    value={formData.nominal_donasi}
                    onChange={handleInputChange}
                    min="10000"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        errors.nominal_donasi ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Minimal Rp 10.000"
                />
                {errors.nominal_donasi && (
                    <p className="text-red-500 text-sm mt-1">{errors.nominal_donasi}</p>
                )}
            </div>

            {/* Metode Pembayaran */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Metode Pembayaran *
                </label>
                <select
                    name="metode_pembayaran"
                    value={formData.metode_pembayaran}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        errors.metode_pembayaran ? 'border-red-500' : 'border-gray-300'
                    }`}
                >
                    <option value="">Pilih metode pembayaran</option>
                    {METODE_PEMBAYARAN.map(metode => (
                        <option key={metode.value} value={metode.value}>
                            {metode.label}
                        </option>
                    ))}
                </select>
                {errors.metode_pembayaran && (
                    <p className="text-red-500 text-sm mt-1">{errors.metode_pembayaran}</p>
                )}
            </div>

            {/* Bukti Transfer */}
            {formData.metode_pembayaran && formData.metode_pembayaran !== 'tunai' && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bukti Transfer *
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                            errors.bukti_transfer ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {errors.bukti_transfer && (
                        <p className="text-red-500 text-sm mt-1">{errors.bukti_transfer}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                        Upload screenshot bukti transfer (format: JPG, PNG, max 2MB)
                    </p>
                </div>
            )}

            {/* Catatan */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catatan (Opsional)
                </label>
                <textarea
                    name="catatan"
                    value={formData.catatan}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Pesan atau doa untuk program ini..."
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? 'Mengirim Donasi...' : 'Kirim Donasi'}
            </button>
        </form>
    )
}

export default DonasiForm