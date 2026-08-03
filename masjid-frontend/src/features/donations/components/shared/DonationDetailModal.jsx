import React, { useEffect, useMemo, useRef, useState } from 'react'
import Swal from 'sweetalert2'
import { formatRupiah } from '@/utils/formatters'
import { useAuth } from '@/hooks/useAuth'
import { Button } from "@/components/ui/button";
import { FloatingInput } from '@/components/form';
import { User, CreditCard, Wallet, CheckCircle2, Landmark, QrCode, Info, X, Check } from 'lucide-react';

const INK = '#1c2620';
const INK_SOFT = '#5c6b5f';
const PAPER = '#f3efe4';
const GREEN = '#1f4d3a';
const GREEN_SOFT = '#e8ede8';

const DonationDetailModal = ({ program, onSubmit, onUploadProof, onClose, loading = false }) => {
    const { user } = useAuth();
    const initialIdentity = useMemo(() => {
        const userName = user?.nama || '';
        const userContact = user?.no_telepon || user?.no_hp || user?.phone || '';

        return {
            nama_donatur: userName || 'Hamba Allah',
            kontak_donatur: userContact,
            isAnonymous: !userName
        };
    }, [user]);
    const [currentStep, setCurrentStep] = useState(1)
    const [paymentInfo, setPaymentInfo] = useState(null)
    const mouseDownOnBackdrop = useRef(false)
    const [formData, setFormData] = useState({
        ...initialIdentity,
        metode_pembayaran: '',
        nominal_donasi: '',
        bukti_transfer: null,
        catatan: ''
    })

    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            ...initialIdentity
        }));
    }, [initialIdentity]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const steps = [
        { id: 1, title: 'Identitas', icon: User },
        { id: 2, title: 'Metode', icon: CreditCard },
        { id: 3, title: 'Nominal', icon: Wallet },
        { id: 4, title: 'Konfirmasi', icon: CheckCircle2 }
    ]

    const metodePembayaran = {
        transfer_bank: {
            label: 'Transfer Bank',
            icon: Landmark,
            info: {
                bank: 'Bank BCA',
                norek: '1234567890',
                atas_nama: 'Masjid Al-Ikhlas'
            }
        },
        qris: {
            label: 'QRIS',
            icon: QrCode,
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
                nama_donatur: checked ? 'Hamba Allah' : (user?.nama || '')
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

    const handleSubmit = async () => {
        try {
            if (paymentInfo) {
                if (formData.metode_pembayaran !== 'tunai' && !formData.bukti_transfer) {
                    Swal.fire('Bukti wajib diupload', 'Upload bukti transfer setelah melakukan pembayaran.', 'warning')
                    return
                }

                if (formData.bukti_transfer && onUploadProof) {
                    const uploadResult = await onUploadProof(paymentInfo.id, formData.bukti_transfer)

                    if (!uploadResult.success) {
                        Swal.fire('Gagal', uploadResult.message || 'Gagal upload bukti transfer', 'error')
                        return
                    }
                }

                Swal.fire({
                    title: 'Bukti donasi terkirim',
                    html: `
                        <div style="text-align:left">
                            <p><strong>Total transfer:</strong> ${formatRupiah(paymentInfo.total_transfer)}</p>
                            <p><strong>Kode unik:</strong> +${paymentInfo.kode_unik}</p>
                            <p style="margin-top:8px">Donasi akan diverifikasi oleh DKM dalam 1x24 jam.</p>
                        </div>
                    `,
                    icon: 'success',
                    confirmButtonColor: GREEN
                })
                onClose()
                return
            }

            const submitData = new FormData()
            submitData.append('barang_id', program.id)
            submitData.append('nama_donatur', formData.nama_donatur)
            submitData.append('kontak_donatur', formData.kontak_donatur)
            submitData.append('nominal', formData.nominal_donasi)
            submitData.append('metode_pembayaran', formData.metode_pembayaran)
            submitData.append('catatan', formData.catatan)
            submitData.append('user_id', user?.id || '')

            const result = await onSubmit(submitData)

            if (result.success) {
                const nextPaymentInfo = {
                    id: result.data?.id,
                    kode_unik: result.data?.kode_unik,
                    total_transfer: result.data?.total_transfer,
                    nominal: result.data?.nominal
                }
                setPaymentInfo(nextPaymentInfo)

                Swal.fire({
                    title: 'Kode pembayaran dibuat',
                    html: `
                        <div style="text-align:left">
                            <p><strong>Total transfer:</strong> ${formatRupiah(nextPaymentInfo.total_transfer)}</p>
                            <p><strong>Kode unik:</strong> +${nextPaymentInfo.kode_unik}</p>
                            <p style="margin-top:8px">Silakan transfer sesuai total tersebut, lalu upload bukti pembayaran.</p>
                        </div>
                    `,
                    icon: 'success',
                    confirmButtonColor: GREEN
                })
            } else {
                Swal.fire('Gagal', result.message || 'Gagal mengirim donasi', 'error')
            }
        } catch (error) {
            console.error('Error submitting donation:', error)
            Swal.fire('Gagal', 'Terjadi kesalahan saat mengirim donasi', 'error')
        }
    }

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-4">
                        <h3 style={{ color: INK }} className="text-lg font-semibold">Identitas Donatur</h3>

                        <label style={{ borderColor: INK }} className="flex items-center space-x-3 border p-3 cursor-pointer">
                            <input
                                type="checkbox"
                                id="anonymous"
                                name="isAnonymous"
                                checked={formData.isAnonymous}
                                onChange={handleInputChange}
                                className="h-4 w-4 accent-[#1f4d3a]"
                            />
                            <span style={{ color: INK }} className="text-sm">
                                Saya ingin berdonasi secara anonim (Hamba Allah)
                            </span>
                        </label>

                        {!formData.isAnonymous && (
                            <>
                                <FloatingInput
                                    label="Nama Lengkap"
                                    name="nama_donatur"
                                    value={formData.nama_donatur}
                                    onChange={handleInputChange}
                                    labelBgClass="bg-[#f3efe4]"
                                    inputClassName="border-[#1c2620] bg-transparent focus:ring-[#1f4d3a] rounded-none"
                                    labelFocusClass="peer-focus:text-[#1f4d3a]"
                                    required
                                />

                                <FloatingInput
                                    label="No. WhatsApp (Opsional)"
                                    name="kontak_donatur"
                                    value={formData.kontak_donatur}
                                    onChange={handleInputChange}
                                    labelBgClass="bg-[#f3efe4]"
                                    inputClassName="border-[#1c2620] bg-transparent focus:ring-[#1f4d3a] rounded-none"
                                    labelFocusClass="peer-focus:text-[#1f4d3a]"
                                />
                            </>
                        )}

                        <div>
                            <label style={{ color: INK }} className="block text-sm font-medium mb-1">
                                Pesan/Doa (Opsional)
                            </label>
                            <textarea
                                name="catatan"
                                value={formData.catatan}
                                onChange={handleInputChange}
                                rows="3"
                                style={{ borderColor: INK }}
                                className="w-full px-3 py-2 border bg-transparent text-sm focus:outline-none focus:ring-1"
                                placeholder="Semoga bermanfaat untuk umat..."
                            />
                        </div>
                    </div>
                )

            case 2:
                return (
                    <div className="space-y-4">
                        <h3 style={{ color: INK }} className="text-lg font-semibold">Metode Pembayaran</h3>

                        <div className="space-y-3">
                            {Object.entries(metodePembayaran).map(([key, method]) => {
                                const MethodIcon = method.icon;
                                const isSelected = formData.metode_pembayaran === key;
                                return (
                                    <label
                                        key={key}
                                        style={{ borderColor: INK, backgroundColor: isSelected ? GREEN_SOFT : 'transparent' }}
                                        className="flex items-center p-4 border cursor-pointer transition-colors"
                                    >
                                        <input
                                            type="radio"
                                            name="metode_pembayaran"
                                            value={key}
                                            checked={isSelected}
                                            onChange={handleInputChange}
                                            className="h-4 w-4 accent-[#1f4d3a]"
                                        />
                                        <div className="ml-3 flex items-center">
                                            <div style={{ backgroundColor: GREEN }} className="w-9 h-9 flex items-center justify-center mr-3 shrink-0">
                                                <MethodIcon style={{ color: PAPER }} className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div style={{ color: INK }} className="font-medium">{method.label}</div>
                                                <div style={{ color: INK_SOFT }} className="text-sm">{method.info.description}</div>
                                            </div>
                                        </div>
                                    </label>
                                );
                            })}
                        </div>

                        {formData.metode_pembayaran && (
                            <div style={{ borderColor: INK }} className="mt-4 p-4 border">
                                <h4 style={{ color: INK }} className="font-semibold mb-2">
                                    Informasi {metodePembayaran[formData.metode_pembayaran].label}
                                </h4>

                                {formData.metode_pembayaran === 'transfer_bank' && (
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span style={{ color: INK_SOFT }}>Bank:</span>
                                            <span style={{ color: INK }} className="font-medium">{metodePembayaran.transfer_bank.info.bank}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span style={{ color: INK_SOFT }}>No. Rekening:</span>
                                            <span style={{ color: INK }} className="font-medium font-mono">{metodePembayaran.transfer_bank.info.norek}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span style={{ color: INK_SOFT }}>Atas Nama:</span>
                                            <span style={{ color: INK }} className="font-medium">{metodePembayaran.transfer_bank.info.atas_nama}</span>
                                        </div>
                                    </div>
                                )}

                                {formData.metode_pembayaran === 'qris' && (
                                    <div className="text-center">
                                        <div style={{ borderColor: INK }} className="inline-block p-4 border">
                                            <img
                                                src="https://via.placeholder.com/200x200?text=QR+MASJID"
                                                alt="QR Code QRIS"
                                                className="w-48 h-48 mx-auto"
                                            />
                                        </div>
                                        <p style={{ color: INK_SOFT }} className="text-sm mt-2">
                                            Scan QR Code dengan aplikasi mobile banking atau e-wallet
                                        </p>
                                    </div>
                                )}

                                {formData.metode_pembayaran === 'tunai' && (
                                    <div style={{ borderColor: INK }} className="p-3 border">
                                        <p style={{ color: INK }} className="text-sm">
                                            <strong>Alamat Masjid:</strong><br />
                                            Jl. Contoh No. 123, Kota, Provinsi<br />
                                            <strong>Waktu Operasional:</strong> 08:00 - 20:00 WIB
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )

            case 3:
                return (
                    <div className="space-y-4">
                        <h3 style={{ color: INK }} className="text-lg font-semibold">Nominal Donasi</h3>

                        <div>
                            <FloatingInput
                                label="Jumlah Donasi"
                                type="number"
                                name="nominal_donasi"
                                value={formData.nominal_donasi}
                                onChange={handleInputChange}
                                min="10000"
                                icon={<span className="text-sm">Rp</span>}
                                labelBgClass="bg-[#f3efe4]"
                                inputClassName="border-[#1c2620] bg-transparent focus:ring-[#1f4d3a] rounded-none"
                                labelFocusClass="peer-focus:text-[#1f4d3a]"
                                required
                            />
                            <p style={{ color: INK_SOFT }} className="text-xs mt-1">Minimal donasi Rp 10.000</p>
                        </div>

                        <div>
                            <p style={{ color: INK }} className="text-sm font-medium mb-2">Nominal Cepat:</p>
                            <div className="grid grid-cols-3 gap-2">
                                {[25000, 50000, 100000, 200000, 500000, 1000000].map(amount => {
                                    const isSelected = formData.nominal_donasi === amount.toString();
                                    return (
                                        <Button
                                            key={amount}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, nominal_donasi: amount.toString() }))}
                                            style={{
                                                borderColor: INK,
                                                backgroundColor: isSelected ? GREEN : 'transparent',
                                                color: isSelected ? PAPER : INK
                                            }}
                                            className="p-2 text-sm border rounded-none focus:outline-none focus:ring-1 focus:ring-[#1f4d3a]"
                                        >
                                            {formatRupiah(amount)}
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )

            case 4:
                {
                return (
                    <div className="space-y-4">
                        <h3 style={{ color: INK }} className="text-lg font-semibold">Konfirmasi Donasi</h3>

                        {/* Summary */}
                        <div style={{ borderColor: INK }} className="border p-4">
                            <h4 style={{ color: INK }} className="font-medium mb-3">Ringkasan Donasi</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span style={{ color: INK_SOFT }}>Program:</span>
                                    <span style={{ color: INK }} className="font-medium">{program.nama_barang}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span style={{ color: INK_SOFT }}>Donatur:</span>
                                    <span style={{ color: INK }} className="font-medium">{formData.nama_donatur}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span style={{ color: INK_SOFT }}>Metode:</span>
                                    <span style={{ color: INK }} className="font-medium">{metodePembayaran[formData.metode_pembayaran]?.label}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span style={{ color: INK_SOFT }}>Nominal Donasi:</span>
                                    <span style={{ color: INK }} className="font-medium">{formatRupiah(formData.nominal_donasi || 0)}</span>
                                </div>
                                {paymentInfo ? (
                                    <>
                                        <div className="flex justify-between">
                                            <span style={{ color: INK_SOFT }}>Kode Unik:</span>
                                            <span style={{ color: GREEN }} className="font-medium font-mono">+{paymentInfo.kode_unik}</span>
                                        </div>
                                        <div style={{ borderColor: INK }} className="flex justify-between border-t pt-2 font-bold">
                                            <span style={{ color: INK }}>Total Transfer:</span>
                                            <span style={{ color: GREEN }}>{formatRupiah(paymentInfo.total_transfer)}</span>
                                        </div>
                                    </>
                                ) : (
                                    <div style={{ borderColor: INK }} className="border border-dashed p-3" >
                                        <span style={{ color: INK_SOFT }}>
                                            Klik <strong style={{ color: INK }}>Buat Kode Pembayaran</strong> untuk mendapatkan kode unik dan total transfer dari backend.
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Penjelasan Kode Unik */}
                        <div style={{ borderColor: INK }} className="p-3 border flex gap-2">
                            <Info style={{ color: GREEN }} className="w-4 h-4 mt-0.5 shrink-0" />
                            <div>
                                <h5 style={{ color: INK }} className="font-medium mb-1">Tentang Kode Unik</h5>
                                <p style={{ color: INK_SOFT }} className="text-sm">
                                    Kode unik dibuat oleh sistem setelah data donasi dibuat. Gunakan total transfer final yang tampil di halaman ini.
                                </p>
                            </div>
                        </div>

                        {/* Upload Bukti */}
                        {paymentInfo && formData.metode_pembayaran !== 'tunai' && (
                            <div>
                                <label style={{ color: INK }} className="block text-sm font-medium mb-1">
                                    Upload Bukti Transfer *
                                </label>
                                <input
                                    type="file"
                                    name="bukti_transfer"
                                    accept="image/*"
                                    onChange={handleInputChange}
                                    style={{ borderColor: INK }}
                                    className="w-full px-3 py-2 border bg-transparent text-sm focus:outline-none focus:ring-1"
                                    required
                                />
                                <p style={{ color: INK_SOFT }} className="text-xs mt-1">
                                    Upload screenshot bukti transfer dengan nominal <strong style={{ color: INK }}>{formatRupiah(paymentInfo.total_transfer)}</strong>
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
                if (!paymentInfo) return true
                return formData.metode_pembayaran === 'tunai' || formData.bukti_transfer
            default:
                return false
        }
    }

    return (
        <div
            className="fixed inset-0 bg-[#1c2620]/60 flex items-center justify-center z-50 p-4"
            onMouseDown={(e) => {
                mouseDownOnBackdrop.current = e.target === e.currentTarget;
            }}
            onClick={(e) => {
                if (mouseDownOnBackdrop.current && e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                style={{ backgroundColor: PAPER, borderColor: INK }}
                className="border max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
                <div className="flex flex-col md:flex-row">
                    {/* Sidebar - Detail Program */}
                    <div style={{ backgroundColor: GREEN_SOFT, borderColor: INK }} className="w-full md:w-1/3 p-6 border-b md:border-b-0 md:border-r">
                        <div className="flex justify-between items-start mb-4">
                            <h2 style={{ color: INK }} className="text-lg font-semibold">Detail Program</h2>
                            <Button
                                onClick={onClose}
                                style={{ color: INK }}
                                className="bg-transparent hover:bg-transparent p-1 rounded-none"
                                aria-label="Tutup"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {program.foto_barang && (
                            <img
                                src={String(program.foto_barang).startsWith('http') ? program.foto_barang : program.foto_barang}
                                alt={program.nama_barang}
                                style={{ borderColor: INK }}
                                className="w-full h-40 object-cover border mb-4"
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/300x200?text=No+Image'
                                }}
                            />
                        )}

                        <h3 style={{ color: INK }} className="font-semibold mb-2">{program.nama_barang}</h3>
                        <p style={{ color: INK_SOFT }} className="text-sm mb-4">{program.deskripsi}</p>

                        {/* Progress */}
                        <div className="mb-4">
                            <div className="flex justify-between text-sm mb-1">
                                <span style={{ color: INK_SOFT }}>Progress</span>
                                <span style={{ color: INK }} className="font-medium">{((program.dana_terkumpul / program.target_dana) * 100).toFixed(1)}%</span>
                            </div>
                            <div style={{ borderColor: INK }} className="w-full h-2 border">
                                <div
                                    style={{ width: `${Math.min((program.dana_terkumpul / program.target_dana) * 100, 100)}%`, backgroundColor: GREEN }}
                                    className="h-full"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span style={{ color: INK_SOFT }}>Terkumpul:</span>
                                <span style={{ color: GREEN }} className="font-medium">{formatRupiah(program.dana_terkumpul)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span style={{ color: INK_SOFT }}>Target:</span>
                                <span style={{ color: INK }} className="font-medium">{formatRupiah(program.target_dana)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span style={{ color: INK_SOFT }}>Donatur:</span>
                                <span style={{ color: INK }} className="font-medium">{program.total_donatur} orang</span>
                            </div>
                        </div>
                    </div>

                    {/* Main Content - Form Steps */}
                    <div className="w-full md:w-2/3 p-6">
                        {/* Step Indicator */}
                        <div className="flex items-center mb-6">
                            {steps.map((step, index) => {
                                const StepIcon = step.icon;
                                const isDone = currentStep > step.id;
                                const isActive = currentStep >= step.id;
                                return (
                                    <div key={step.id} className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}>
                                        <div className="flex items-center shrink-0">
                                            <div
                                                style={{
                                                    borderColor: INK,
                                                    backgroundColor: isActive ? GREEN : 'transparent',
                                                    color: isActive ? PAPER : INK_SOFT
                                                }}
                                                className="flex items-center justify-center w-9 h-9 border shrink-0"
                                            >
                                                {isDone ? <Check className="w-4 h-4" /> : <StepIcon className="w-4 h-4" />}
                                            </div>
                                            <span style={{ color: isActive ? INK : INK_SOFT }} className="ml-2 text-xs sm:text-sm font-medium whitespace-nowrap hidden md:inline">
                                                {step.title}
                                            </span>
                                        </div>
                                        {index < steps.length - 1 && (
                                            <div style={{ backgroundColor: currentStep > step.id ? GREEN : INK_SOFT }} className="flex-1 min-w-3 h-px mx-2 sm:mx-3" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Step Content */}
                        <div className="min-h-100">
                            {renderStepContent()}
                        </div>

                        {/* Navigation Buttons */}
                        <div style={{ borderColor: INK }} className="flex justify-between mt-6 pt-4 border-t">
                            <Button
                                onClick={handlePrev}
                                disabled={currentStep === 1}
                                style={{ borderColor: INK, color: INK }}
                                className="px-4 py-2 bg-transparent border rounded-none disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Sebelumnya
                            </Button>

                            {currentStep < 4 ? (
                                <Button
                                    onClick={handleNext}
                                    disabled={!canProceed()}
                                    style={{ backgroundColor: GREEN, borderColor: INK, color: PAPER }}
                                    className="px-6 py-2 border rounded-none disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Selanjutnya
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={!canProceed() || loading}
                                    style={{ backgroundColor: GREEN, borderColor: INK, color: PAPER }}
                                    className="px-6 py-2 border rounded-none disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    {loading
                                        ? 'Memproses...'
                                        : !paymentInfo
                                            ? 'Buat Kode Pembayaran'
                                            : formData.metode_pembayaran === 'tunai'
                                                ? 'Selesai'
                                                : 'Upload Bukti Transfer'}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DonationDetailModal
