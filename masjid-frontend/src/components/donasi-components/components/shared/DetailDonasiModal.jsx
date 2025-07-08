import React, { useState, useMemo } from 'react'
import { formatRupiah } from '../../utils/formatters'
import { formatKodeUnik, generateKodeUnikDonasi } from '.'
import { useAuth } from '../../../../hooks/useAuth'

const DetailDonasiModal = ({ program, onSubmit, onClose, loading = false }) => {
    const { user } =useAuth();
    const [currentStep, setCurrentStep] = useState(1)
    const [formData, setFormData] = useState({
        nama_donatur: 'Hamba Allah',
        kontak_donatur: '',
        isAnonymous: true,
        metode_pembayaran: '',
        nominal_donasi: '',
        bukti_transfer: null,
        catatan: ''
    })

    const steps = [
        { id: 1, title: 'Identitas', icon: '👤' },
        { id: 2, title: 'Metode', icon: '💳' },
        { id: 3, title: 'Nominal', icon: '💰' },
        { id: 4, title: 'Konfirmasi', icon: '✅' }
    ]

    const metodePembayaran = {
        transfer_bank: {
            label: 'Transfer Bank',
            icon: '🏦',
            info: {
                bank: 'Bank BCA',
                norek: '1234567890',
                atas_nama: 'Masjid Al-Ikhlas'
            }
        },
        qris: {
            label: 'QRIS',
            icon: '📱',
            info: {
                description: 'Scan QR Code untuk pembayaran via QRIS'
            }
        }
    }

    const handleInputChange = (e) => {
        const { name, value, type, checked, files } = e.target
        
        if (type === 'file') {
            setFormData(prev => ({ ...prev, [name]: files[0] }))
        } else if (type === 'checkbox') {
            setFormData(prev => ({ 
                ...prev, 
                [name]: checked,
                nama_donatur: checked ? 'Hamba Allah' : ''
            }))
        } else {
            setFormData(prev => ({ ...prev, [name]: value }))
        }
    }

    const handleNext = () => {
        if (currentStep < 4) {
            setCurrentStep(prev => prev + 1)
        }
    }

    const handlePrev = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1)
        }
    }

    const kodeUnikFixed = useMemo(() => generateKodeUnikDonasi(), [])

    const handleSubmit = async () => {
        try {
            const submitData = new FormData()
            submitData.append('nama_donatur', formData.nama_donatur)
            submitData.append('kontak_donatur', formData.kontak_donatur)
            submitData.append('nominal_donasi', formData.nominal_donasi)
            submitData.append('metode_pembayaran', formData.metode_pembayaran)
            submitData.append('catatan', formData.catatan)
            submitData.append('kode_unik_frontend', kodeUnikFixed)
            submitData.append('user_id', user?.id || '')

            if (formData.bukti_transfer) {
                submitData.append('bukti_transfer', formData.bukti_transfer)
            }

            const result = await onSubmit(submitData)
            
            if (result.success) {
                // Tampilkan kode unik yang digenerate backend
                const totalTransfer = result.data?.total_transfer || (parseInt(formData.nominal_donasi) + kodeUnikFixed)
                
                alert(`🎉 Terima kasih atas donasi Anda!
                📋 Detail Transfer:
                💰 Total Transfer: ${formatRupiah(totalTransfer)}
                🔢 Kode Unik: ${kodeUnikFixed}
                ✅ Donasi akan diverifikasi oleh admin dalam 1x24 jam.`)
                onClose()
            } else {
                alert(result.message || 'Gagal mengirim donasi')
            }
        } catch (error) {
            console.error('Error submitting donation:', error)
            alert('Terjadi kesalahan saat mengirim donasi')
        }
    }

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Identitas Donatur</h3>
                        
                        <div className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                id="anonymous"
                                name="isAnonymous"
                                checked={formData.isAnonymous}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-green-600 rounded"
                            />
                            <label htmlFor="anonymous" className="text-sm text-gray-700">
                                Saya ingin berdonasi secara anonim (Hamba Allah)
                            </label>
                        </div>

                        {!formData.isAnonymous && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nama Lengkap *
                                    </label>
                                    <input
                                        type="text"
                                        name="nama_donatur"
                                        value={formData.nama_donatur}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="Masukkan nama lengkap"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        No. WhatsApp (Opsional)
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
                            </>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Pesan/Doa (Opsional)
                            </label>
                            <textarea
                                name="catatan"
                                value={formData.catatan}
                                onChange={handleInputChange}
                                rows="3"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="Semoga bermanfaat untuk umat..."
                            />
                        </div>
                    </div>
                )

            case 2:
                return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Metode Pembayaran</h3>
                        
                        <div className="space-y-3">
                            {Object.entries(metodePembayaran).map(([key, method]) => (
                                <label
                                    key={key}
                                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                                        formData.metode_pembayaran === key
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="metode_pembayaran"
                                        value={key}
                                        checked={formData.metode_pembayaran === key}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 text-green-600"
                                    />
                                    <div className="ml-3 flex items-center">
                                        <span className="text-2xl mr-3">{method.icon}</span>
                                        <div>
                                            <div className="font-medium text-gray-900">{method.label}</div>
                                            <div className="text-sm text-gray-500">{method.info.description}</div>
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>

                        {formData.metode_pembayaran && (
                            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <h4 className="font-semibold text-blue-800 mb-2">
                                    Informasi {metodePembayaran[formData.metode_pembayaran].label}
                                </h4>
                                
                                {formData.metode_pembayaran === 'transfer_bank' && (
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Bank:</span>
                                            <span className="font-medium">{metodePembayaran.transfer_bank.info.bank}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">No. Rekening:</span>
                                            <span className="font-medium font-mono">{metodePembayaran.transfer_bank.info.norek}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Atas Nama:</span>
                                            <span className="font-medium">{metodePembayaran.transfer_bank.info.atas_nama}</span>
                                        </div>
                                    </div>
                                )}

                                {formData.metode_pembayaran === 'qris' && (
                                    <div className="text-center">
                                        <div className="inline-block p-4 bg-white rounded-lg shadow">
                                            <img 
                                                src="https://via.placeholder.com/200x200?text=QR+MASJID" 
                                                alt="QR Code QRIS"
                                                className="w-48 h-48 mx-auto"
                                            />
                                        </div>
                                        <p className="text-sm text-gray-600 mt-2">
                                            Scan QR Code dengan aplikasi mobile banking atau e-wallet
                                        </p>
                                    </div>
                                )}

                                {formData.metode_pembayaran === 'tunai' && (
                                    <div className="text-center">
                                        <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                            <p className="text-sm text-yellow-800">
                                                <strong>Alamat Masjid:</strong><br />
                                                Jl. Contoh No. 123, Kota, Provinsi<br />
                                                <strong>Waktu Operasional:</strong> 08:00 - 20:00 WIB
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )

            case 3:
                return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Nominal Donasi</h3>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Jumlah Donasi *
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-500">Rp</span>
                                <input
                                    type="number"
                                    name="nominal_donasi"
                                    value={formData.nominal_donasi}
                                    onChange={handleInputChange}
                                    min="10000"
                                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="50000"
                                    required
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Minimal donasi Rp 10.000</p>
                        </div>

                        {/* Quick Amount Buttons */}
                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Nominal Cepat:</p>
                            <div className="grid grid-cols-3 gap-2">
                                {[25000, 50000, 100000, 200000, 500000, 1000000].map(amount => (
                                    <button
                                        key={amount}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, nominal_donasi: amount.toString() }))}
                                        className="p-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        {formatRupiah(amount)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )
                
            case 4:
                {
                const estimasiTotal = parseInt(formData.nominal_donasi || 0) + kodeUnikFixed
                return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Konfirmasi Donasi</h3>
                        
                        {/* Summary */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-3">Ringkasan Donasi</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Program:</span>
                                    <span className="font-medium">{program.nama_barang}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Donatur:</span>
                                    <span className="font-medium">{formData.nama_donatur}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Metode:</span>
                                    <span className="font-medium">{metodePembayaran[formData.metode_pembayaran]?.label}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Nominal Donasi:</span>
                                    <span className="font-medium">{formatRupiah(formData.nominal_donasi || 0)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Kode Unik:</span>
                                    <span className="font-medium font-mono">+{formatKodeUnik(kodeUnikFixed)}</span>
                                </div>
                                <div className="flex justify-between border-t pt-2 font-bold">
                                    <span>Total Transfer:</span>
                                    <span className="text-green-600">{formatRupiah(estimasiTotal)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Penjelasan Kode Unik */}
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <h5 className="font-medium text-blue-800 mb-1">ℹ️ Tentang Kode Unik</h5>
                            <p className="text-sm text-blue-700">
                                Kode unik <strong>{formatKodeUnik(kodeUnikFixed)}</strong> dimulai dengan angka <strong>3</strong> yang menandakan kategori donasi. 
                                Ini membantu admin memverifikasi pembayaran Anda dengan mudah.
                            </p>
                        </div>

                        {/* Upload Bukti */}
                        {formData.metode_pembayaran !== 'tunai' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Upload Bukti Transfer *
                                </label>
                                <input
                                    type="file"
                                    name="bukti_transfer"
                                    accept="image/*"
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Upload screenshot bukti transfer dengan nominal <strong>{formatRupiah(estimasiTotal)}</strong>
                                </p>
                            </div>
                        )}
                    </div>
                ) }

            default:
                return null
        }
    }

    const canProceed = () => {
        switch (currentStep) {
            case 1:
                return formData.nama_donatur.trim() !== ''
            case 2:
                return formData.metode_pembayaran !== ''
            case 3:
                return formData.nominal_donasi && parseInt(formData.nominal_donasi) >= 10000
            case 4:
                return formData.metode_pembayaran === 'tunai' || formData.bukti_transfer
            default:
                return false
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex">
                    {/* Sidebar - Detail Program */}
                    <div className="w-1/3 bg-gray-50 p-6">
                        <button
                            onClick={onClose}
                            className="float-right text-gray-500 hover:text-gray-700"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Detail Program</h2>
                        
                        {program.foto_barang && (
                            <img
                                src={`http://localhost:5000/images/donasi-program/${program.foto_barang}`}
                                alt={program.nama_barang}
                                className="w-full h-40 object-cover rounded-lg mb-4"
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/300x200?text=No+Image'
                                }}
                            />
                        )}

                        <h3 className="font-semibold text-gray-900 mb-2">{program.nama_barang}</h3>
                        <p className="text-sm text-gray-600 mb-4">{program.deskripsi}</p>

                        {/* Progress */}
                        <div className="mb-4">
                            <div className="flex justify-between text-sm mb-1">
                                <span>Progress</span>
                                <span>{((program.dana_terkumpul / program.target_dana) * 100).toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className="bg-green-500 h-2 rounded-full"
                                    style={{ width: `${Math.min((program.dana_terkumpul / program.target_dana) * 100, 100)}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>Terkumpul:</span>
                                <span className="font-medium text-green-600">{formatRupiah(program.dana_terkumpul)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Target:</span>
                                <span className="font-medium">{formatRupiah(program.target_dana)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Donatur:</span>
                                <span className="font-medium">{program.total_donatur} orang</span>
                            </div>
                        </div>
                    </div>

                    {/* Main Content - Form Steps */}
                    <div className="w-2/3 p-6">
                        {/* Step Indicator */}
                        <div className="flex items-center justify-between mb-6">
                            {steps.map((step, index) => (
                                <div key={step.id} className="flex items-center">
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                                        currentStep >= step.id ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                                    }`}>
                                        {currentStep > step.id ? (
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : (
                                            <span>{step.icon}</span>
                                        )}
                                    </div>
                                    <span className={`ml-2 text-sm font-medium ${
                                        currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                                    }`}>
                                        {step.title}
                                    </span>
                                    {index < steps.length - 1 && (
                                        <div className={`mx-4 h-1 w-16 ${
                                            currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                                        }`} />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Step Content */}
                        <div className="min-h-[400px]">
                            {renderStepContent()}
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-6 pt-4 border-t">
                            <button
                                onClick={handlePrev}
                                disabled={currentStep === 1}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Sebelumnya
                            </button>

                            {currentStep < 4 ? (
                                <button
                                    onClick={handleNext}
                                    disabled={!canProceed()}
                                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Selanjutnya
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={!canProceed() || loading}
                                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Mengirim...' : 'Selesai Donasi'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DetailDonasiModal