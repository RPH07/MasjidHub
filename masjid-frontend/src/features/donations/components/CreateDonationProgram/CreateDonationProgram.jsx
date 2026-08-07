import React, { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import { useDonations } from '../../hooks'
import api from '@/config/api'
import { Button } from "@/components/ui/button";
import { FloatingDate, FloatingInput } from '@/components/form';
import { formatRupiah } from '@/utils/formatters'

const CreateDonationProgram = () => {
    const { createProgramDonasi, loading } = useDonations()
    
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
    const [kasInfo, setKasInfo] = useState(null)

    useEffect(() => {
        fetchKasInfo()
    }, [])

    const fetchKasInfo = async () => {
        try {
            const response = await api.get('/kas/summary')
            if (response.data.success) {
                setKasInfo(response.data.data)
            }
        } catch (error) {
            console.error('Error fetching kas info:', error)
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }
    }

    const handleTargetDanaChange = (e) => {
        const value = e.target.value.replace(/[^\d]/g, '')
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

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setFormData(prev => ({
                ...prev,
                foto_barang: file
            }))
            setPreview(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)

        // Validasi
        const newErrors = {}
        
        if (!formData.nama_barang.trim()) {
            newErrors.nama_barang = 'Nama barang harus diisi'
        }

        if (!formData.deskripsi.trim()) {
            newErrors.deskripsi = 'Deskripsi harus diisi'
        }

        const targetDana = parseInt(formData.target_dana) || 0
        if (targetDana <= 0) {
            newErrors.target_dana = 'Target dana harus lebih dari 0'
        }

        if (!formData.kategori_barang) {
            newErrors.kategori_barang = 'Kategori barang harus dipilih'
        }

        if (!formData.deadline) {
            newErrors.deadline = 'Deadline wajib diisi'
        } else {
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
            const kasTotal = Number(kasInfo?.totalSaldo || 0)
            const danaAwalKas = Math.min(kasTotal, targetDana)
            const result = await createProgramDonasi({
                ...formData,
                dana_awal_kas: danaAwalKas
            }, formData.foto_barang)

            if (result.success) {
            const sisaKebutuhan = Math.max(0, targetDana - danaAwalKas)

            Swal.fire({
                title: 'Program berhasil ditambahkan',
                html: `
                    <div style="text-align:left">
                        <p><strong>Dana dari kas:</strong> ${formatRupiah(danaAwalKas)}</p>
                        <p><strong>Target dana:</strong> ${formatRupiah(targetDana)}</p>
                        <p><strong>Sisa kebutuhan:</strong> ${formatRupiah(sisaKebutuhan)}</p>
                        <p style="margin-top:8px">Program disimpan sebagai draft dan bisa diaktifkan dari daftar program.</p>
                    </div>
                `,
                icon: 'success',
                confirmButtonColor: '#16a34a'
            })
                
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
                fetchKasInfo()
            } else {
                Swal.fire('Gagal', result.message, 'error')
            }
        } catch (error) {
            console.error('Error creating program:', error)
            Swal.fire('Gagal', 'Terjadi kesalahan saat menambahkan program donasi', 'error')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white shadow rounded-lg p-6">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Tambah Program Donasi</h2>
                    <p className="text-gray-600 mt-1">Buat program pengadaan barang untuk masjid</p>
                </div>

                {/* Info Kas Tersedia */}
                {kasInfo && (
                    <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-blue-800 mb-2">💰 Informasi Kas Masjid</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                                <span className="text-blue-600">Total Kas Tersedia:</span>
                                <div className="font-semibold text-blue-900">
                                    {formatRupiah(kasInfo.totalSaldo || 0)}
                                </div>
                            </div>
                            <div>
                                <span className="text-blue-600">Pemasukan Bulan Ini:</span>
                                <div className="font-semibold text-green-700">
                                    {formatRupiah(kasInfo.totalPemasukan || 0)}
                                </div>
                            </div>
                            <div>
                                <span className="text-blue-600">Pengeluaran Bulan Ini:</span>
                                <div className="font-semibold text-red-700">
                                    {formatRupiah(kasInfo.totalPengeluaran || 0)}
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-blue-700 mt-2">
                            💡 Dana awal program akan dimulai dari kas yang tersedia (maksimal sesuai target).
                        </p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Nama Barang */}
                    <div>
                        <FloatingInput
                            label="Nama Barang"
                            name="nama_barang"
                            value={formData.nama_barang}
                            onChange={handleInputChange}
                            inputClassName={errors.nama_barang ? 'border-red-500 focus:ring-green-500' : 'border-gray-300 focus:ring-green-500'}
                            labelFocusClass="peer-focus:text-green-600"
                            required
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
                            rows={4}
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
                        <FloatingInput
                            label="Target Dana"
                            name="target_dana"
                            value={formatRupiah(formData.target_dana)}
                            onChange={handleTargetDanaChange}
                            icon={<span className="text-sm">Rp</span>}
                            inputClassName={errors.target_dana ? 'border-red-500 focus:ring-green-500' : 'border-gray-300 focus:ring-green-500'}
                            labelFocusClass="peer-focus:text-green-600"
                            required
                        />
                        {errors.target_dana && (
                            <p className="text-red-500 text-sm mt-1">{errors.target_dana}</p>
                        )}
                        
                        {/* Estimasi Kebutuhan Donasi */}
                        {formData.target_dana && kasInfo && (
                            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">📊 Estimasi Kebutuhan:</h4>
                                <div className="text-sm space-y-1">
                                    {(() => {
                                        const target = parseInt(formData.target_dana) || 0
                                        const kasTotal = kasInfo.totalSaldo || 0
                                        const danaAwal = Math.min(kasTotal, target)
                                        const sisaKebutuhan = Math.max(0, target - danaAwal)
                                        
                                        return (
                                            <>
                                                <div className="flex justify-between">
                                                    <span>Target Dana:</span>
                                                    <span className="font-medium">{formatRupiah(target)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Dana dari Kas:</span>
                                                    <span className="font-medium text-green-600">{formatRupiah(danaAwal)}</span>
                                                </div>
                                                <div className="flex justify-between border-t pt-1">
                                                    <span className="font-medium">Perlu Donasi:</span>
                                                    <span className="font-bold text-blue-600">{formatRupiah(sisaKebutuhan)}</span>
                                                </div>
                                            </>
                                        )
                                    })()}
                                </div>
                            </div>
                        )}
                        
                        <p className="text-xs text-gray-500 mt-1">
                            Masukkan target dana sesuai kebutuhan barang yang akan dibeli
                        </p>
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
                            <option value="peralatan">Peralatan</option>
                            <option value="renovasi">Renovasi</option>
                            <option value="pembangunan">Pembangunan</option>
                            <option value="lainnya">Lainnya</option>
                        </select>
                        {errors.kategori_barang && (
                            <p className="text-red-500 text-sm mt-1">{errors.kategori_barang}</p>
                        )}
                    </div>

                    {/* Deadline */}
                    <div>
                        <FloatingDate
                            label="Deadline"
                            name="deadline"
                            value={formData.deadline}
                            onChange={handleInputChange}
                            required
                        />
                        {errors.deadline && (
                            <p className="text-red-500 text-sm mt-1">{errors.deadline}</p>
                        )}
                    </div>

                    {/* Foto */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Foto Barang (Opsional)
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

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={isSubmitting || loading}
                            variant="success"
                            className="px-6"
                        >
                            {isSubmitting ? 'Menyimpan...' : 'Simpan Program'}
                        </Button>
                    </div>
                </form>

                {/* Info Box */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-blue-800">ℹ️ Informasi</h3>
                    <div className="mt-2 text-sm text-blue-700">
                        <ul className="list-disc list-inside space-y-1">
                            <li>Program akan dimulai dengan dana awal dari kas masjid yang tersedia</li>
                            <li>Dana terkumpul = Dana awal kas + Donasi dari jamaah</li>
                            <li>Program akan disimpan sebagai draft dan perlu diaktifkan secara manual</li>
                            <li>Pastikan deskripsi jelas dan menarik untuk mendorong donasi</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CreateDonationProgram
