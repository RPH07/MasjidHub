import React, { useState } from 'react'
import { formatRupiah } from '../../utils'

const BidForm = ({
    lelang,
    onSubmit,
    loading = false
}) => {
    const [formData, setFormData] = useState({
        nama_bidder: '',
        kontak_bidder: '',
        jumlah_bid: ''
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

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Validasi basic
        const newErrors = {}
        if (!formData.nama_bidder.trim()) {
            newErrors.nama_bidder = 'Nama wajib diisi'
        }
        if (!formData.jumlah_bid || parseInt(formData.jumlah_bid) <= lelang.harga_tertinggi) {
            newErrors.jumlah_bid = `Bid harus lebih tinggi dari ${formatRupiah(lelang.harga_tertinggi)}`
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        const result = await onSubmit(formData)

        if (result.success) {
            // Reset form setelah berhasil
            setFormData({
                nama_bidder: '',
                kontak_bidder: '',
                jumlah_bid: ''
            })
            setErrors({})
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-800">
                    <div className="font-medium">{lelang.nama_barang}</div>
                    <div>Bid tertinggi: <span className="font-bold">{formatRupiah(lelang.harga_tertinggi)}</span></div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Lengkap *
                </label>
                <input
                    type="text"
                    name="nama_bidder"
                    value={formData.nama_bidder}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.nama_bidder ? 'border-red-500' : 'border-gray-300'
                        }`}
                    placeholder="Masukkan nama lengkap"
                />
                {errors.nama_bidder && (
                    <p className="text-red-500 text-sm mt-1">{errors.nama_bidder}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    No. HP/WhatsApp
                </label>
                <input
                    type="text"
                    name="kontak_bidder"
                    value={formData.kontak_bidder}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="08xxxxxxxxxx"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jumlah Bid *
                </label>
                <input
                    type="number"
                    name="jumlah_bid"
                    value={formData.jumlah_bid}
                    onChange={handleInputChange}
                    min={lelang.harga_tertinggi + 1000}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.jumlah_bid ? 'border-red-500' : 'border-gray-300'
                        }`}
                    placeholder={`Minimal ${formatRupiah(lelang.harga_tertinggi + 1000)}`}
                />
                {errors.jumlah_bid && (
                    <p className="text-red-500 text-sm mt-1">{errors.jumlah_bid}</p>
                )}
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? 'Submitting...' : 'Submit Bid'}
            </button>
        </form>
    )
}

export default BidForm