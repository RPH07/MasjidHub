import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '@/components/navigation/Navbar';
import toast, { Toaster } from 'react-hot-toast';
import { CheckCircle2, Download, Loader2, ImageOff } from 'lucide-react';
import DetailDonasiModal from '@/features/donasi/components/shared/DetailDonasiModal';
import { useAuth } from '@/hooks/useAuth'
import { donasiService } from '@/features/donasi/services/DonasiService';
import transparansiService from '@/services/transparansiService';
import { Button } from "@/components/ui/button";
import { formatRupiah, toNumber } from '@/utils/formatters';

const INK = '#1c2620';
const INK_SOFT = '#5c6b5f';
const PAPER = '#f3efe4';
const GREEN = '#1f4d3a';
const GREEN_SOFT = '#e8ede8';

const FILTERS = [
    { key: 'all', label: 'Semua Program' },
    { key: 'aktif', label: 'Sedang Berjalan' },
    { key: 'selesai', label: 'Telah Selesai' }
];

const Crowdfunding = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');
    const [downloadingPdf, setDownloadingPdf] = useState(null);

    const isLoggedIn = Boolean(user);
    const showPublicNavbar = location.pathname === '/crowdfunding';

    const fetchPrograms = useCallback (async () => {
        try {
            setLoading(true);
            const response = await donasiService.getPrograms(
                filterStatus === 'all' 
                ? undefined 
                : filterStatus
            );
            setPrograms(response.data?.data || []);
        } catch (error) {
            console.error('Error fetching programs:', error);
            console.error('Response:', error.response?.data);
            toast.error('Gagal memuat data program donasi');
        } finally {
            setLoading(false);
        }
    }, [filterStatus]);

    useEffect(() => {
        fetchPrograms();
    }, [fetchPrograms]);

    const handleDownloadPdf = async (programId, programName) => {
        try {
            setDownloadingPdf(programId);
            const loadingToast = toast.loading('Sedang menyiapkan laporan PDF...');

            await transparansiService.downloadProgramPdf(programId);

            toast.dismiss(loadingToast);
            toast.success(`Laporan PDF "${programName}" berhasil diunduh`, {
                duration: 4000,
            });
        } catch (error) {
            console.error('Error downloading PDF:', error);
            toast.error('Gagal mengunduh laporan. Silakan coba lagi.', {
                duration: 5000,
            });
        } finally {
            setDownloadingPdf(null);
        }
    };

    const handleSubmitDonasi = async (donasiData) => {
        try {
            const loadingToast = toast.loading('Sedang mengirim donasi...');

            if (selectedProgram?.id && !donasiData.get('barang_id')) {
                donasiData.append('barang_id', selectedProgram.id);
            }

            if (user?.id && !donasiData.get('user_id')) {
                donasiData.append('user_id', user.id);
            }

            const response = await donasiService.submitDonation(donasiData);

            toast.dismiss(loadingToast);
            toast.success(
                response.data.msg || response.data.message || 'Donasi berhasil dikirim',
                { duration: 4000 }
            );

            return {
                success: true,
                message: response.data.msg || response.data.message || 'Donasi berhasil dikirim',
                data: response.data.data
            };
        } catch (error) {
            console.error('Error submitting donasi:', error);
            toast.error(
                error.response?.data?.msg || error.response?.data?.error || 'Gagal mengirim donasi',
                { duration: 5000 }
            );

            return {
                success: false,
                message: error.response?.data?.msg || error.response?.data?.error || 'Gagal mengirim donasi'
            };
        }
    };

    const handleUploadDonasiProof = async (donationId, proofFile) => {
        try {
            const loadingToast = toast.loading('Sedang mengupload bukti transfer...');
            const proofData = new FormData();
            proofData.append('bukti_transfer', proofFile);

            const response = await donasiService.uploadDonationProof(donationId, proofData);

            toast.dismiss(loadingToast);
            toast.success(response.data?.msg || 'Bukti transfer berhasil diupload');

            return {
                success: true,
                message: response.data?.msg || 'Bukti transfer berhasil diupload',
                data: response.data?.data
            };
        } catch (error) {
            console.error('Error uploading bukti donasi:', error);
            toast.error(
                error.response?.data?.msg || error.response?.data?.error || 'Gagal upload bukti transfer',
                { duration: 5000 }
            );

            return {
                success: false,
                message: error.response?.data?.msg || error.response?.data?.error || 'Gagal upload bukti transfer'
            };
        }
    };

    const handleDonateClick = (program) => {
        if (program.status === 'aktif') {
            setSelectedProgram(program);
            setIsModalOpen(true);
        } else {
            toast('Program donasi ini sedang tidak aktif', { duration: 3000 });
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedProgram(null);
        fetchPrograms();
    };

    const filteredPrograms = programs.filter(program => {
        if (filterStatus === 'all') return ['aktif', 'selesai'].includes(program.status);

        const programStatus = program.status;

        if (filterStatus === 'aktif') return programStatus === 'aktif';
        if (filterStatus === 'selesai') return programStatus === 'selesai';
        return true;
    });

    if (loading) {
        return (
            <div style={{ backgroundColor: PAPER }} className="flex justify-center items-center h-64">
                <Loader2 style={{ color: GREEN }} className="h-6 w-6 animate-spin" />
                <p style={{ color: INK_SOFT }} className="ml-4">Memuat program donasi...</p>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: PAPER }} className="min-h-screen">
            {showPublicNavbar && <Navbar />}

            <Toaster
                position="top-right"
                reverseOrder={false}
                gutter={8}
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: INK,
                        color: PAPER,
                        padding: '16px',
                        borderRadius: '2px',
                        fontSize: '14px',
                        maxWidth: '400px',
                    },
                    success: {
                        style: { background: GREEN, color: PAPER },
                        iconTheme: { primary: PAPER, secondary: GREEN },
                    },
                    error: {
                        style: { background: '#7a2e2e', color: PAPER },
                        iconTheme: { primary: PAPER, secondary: '#7a2e2e' },
                    },
                    loading: {
                        style: { background: INK, color: PAPER },
                    },
                }}
            />

            <div className={`container mx-auto px-4 ${showPublicNavbar ? 'pt-24 pb-12' : 'py-8'}`}>
                <div className="text-center mb-10">
                    <p style={{ color: GREEN }} className="text-[11px] tracking-[0.14em] font-medium mb-2">
                        PROGRAM DONASI
                    </p>
                    <h1 style={{ color: INK }} className="text-3xl font-semibold mb-2">
                        Program donasi masjid
                    </h1>
                    <p style={{ color: INK_SOFT }} className="text-sm">
                        {isLoggedIn
                            ? 'Mari lanjutkan kontribusi Anda untuk masjid'
                            : 'Mari bantu penuhi kebutuhan masjid melalui program pengadaan barang.'
                        }
                    </p>
                </div>

                <div className="flex justify-center mb-10">
                    <div style={{ borderColor: INK }} className="flex border-b">
                        {FILTERS.map((f) => (
                            <Button
                                key={f.key}
                                onClick={() => setFilterStatus(f.key)}
                                style={{
                                    color: filterStatus === f.key ? GREEN : INK_SOFT,
                                    borderColor: filterStatus === f.key ? GREEN : 'transparent'
                                }}
                                className="px-5 py-2.5 text-sm font-medium border-b-2 bg-transparent hover:bg-transparent rounded-none -mb-px"
                            >
                                {f.label}{f.key === 'all' ? ` (${programs.length})` : ''}
                            </Button>
                        ))}
                    </div>
                </div>

                {filteredPrograms.length === 0 ? (
                    <div style={{ borderColor: INK }} className="text-center py-12 border border-dashed">
                        <div style={{ color: INK_SOFT }} className="text-base">
                            {filterStatus === 'aktif' && 'Belum ada program donasi aktif saat ini'}
                            {filterStatus === 'selesai' && 'Belum ada program donasi yang selesai'}
                            {filterStatus === 'all' && 'Belum ada program donasi saat ini'}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPrograms.map((program) => {
                            const targetDana = toNumber(program.target_dana);
                            const danaTerkumpul = toNumber(program.dana_terkumpul);
                            const progress = targetDana > 0 ? (danaTerkumpul / targetDana) * 100 : 0;
                            const programStatus = program.status;
                            const isCompleted = progress >= 100 || programStatus === 'selesai';
                            const isDownloading = downloadingPdf === program.id;

                            return (
                                <div
                                    key={program.id}
                                    style={{ borderColor: INK, backgroundColor: PAPER }}
                                    className="border overflow-hidden hover:border-2 transition-[border-width] duration-150"
                                >
                                    <div style={{ borderColor: INK }} className="relative border-b">
                                        {program.foto_barang ? (
                                            <img
                                                src={program.foto_barang}
                                                alt={program.nama_barang}
                                                className="w-full h-56 object-cover"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling?.classList.remove('hidden');
                                                }}
                                            />
                                        ) : null}
                                        <div
                                            style={{ backgroundColor: GREEN_SOFT, color: INK_SOFT }}
                                            className={`w-full h-56 flex flex-col items-center justify-center gap-2 ${program.foto_barang ? 'hidden' : ''}`}
                                        >
                                            <ImageOff className="w-6 h-6" />
                                            <span className="text-xs tracking-wide">NO IMAGE</span>
                                        </div>

                                        {programStatus === 'selesai' && (
                                            <div
                                                style={{ backgroundColor: GREEN, color: PAPER, borderColor: INK }}
                                                className="absolute top-3 right-3 flex items-center gap-1.5 border px-3 py-1 text-xs font-medium"
                                            >
                                                <CheckCircle2 size={13} />
                                                Selesai
                                            </div>
                                        )}
                                        {programStatus === 'aktif' && (
                                            <div
                                                style={{ backgroundColor: PAPER, color: GREEN, borderColor: INK }}
                                                className="absolute top-3 right-3 flex items-center gap-1.5 border px-3 py-1 text-xs font-medium"
                                            >
                                                <span style={{ backgroundColor: GREEN }} className="h-1.5 w-1.5 rounded-full" />
                                                Aktif
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-6">
                                        <h2 style={{ color: INK }} className="text-xl font-semibold mb-2">{program.nama_barang}</h2>
                                        <p style={{ color: INK_SOFT }} className="text-sm mb-4 line-clamp-3">{program.deskripsi}</p>

                                        <div style={{ borderColor: INK }} className="w-full h-2 border mb-2">
                                            <div
                                                style={{ width: `${Math.min(progress, 100)}%`, backgroundColor: GREEN }}
                                                className="h-full transition-all duration-300"
                                            />
                                        </div>

                                        <div className="flex justify-between items-center text-sm mb-4">
                                            <span style={{ color: GREEN }} className="font-medium">
                                                Terkumpul: {formatRupiah(danaTerkumpul)}
                                            </span>
                                            <span style={{ color: INK_SOFT }}>
                                                Target: {formatRupiah(targetDana)}
                                            </span>
                                        </div>

                                        <div style={{ color: INK_SOFT }} className="text-center text-sm mb-4">
                                            {program.total_donatur || 0} donatur &middot; {progress.toFixed(1)}% tercapai
                                        </div>

                                        {programStatus === 'selesai' ? (
                                            <div className="space-y-2">
                                                <div
                                                    style={{ borderColor: INK, color: GREEN }}
                                                    className="flex items-center justify-center gap-1.5 w-full border font-medium py-2 px-4"
                                                >
                                                    <CheckCircle2 size={16} />
                                                    Program Telah Selesai
                                                </div>

                                                <Button
                                                    onClick={() => handleDownloadPdf(program.id, program.nama_barang)}
                                                    disabled={isDownloading}
                                                    style={{
                                                        backgroundColor: isDownloading ? GREEN_SOFT : GREEN,
                                                        color: isDownloading ? INK_SOFT : PAPER,
                                                        borderColor: INK
                                                    }}
                                                    className="w-full flex items-center justify-center gap-2 font-medium py-2 px-4 border rounded-none transition-colors duration-200 disabled:cursor-not-allowed"
                                                >
                                                    {isDownloading ? (
                                                        <>
                                                            <Loader2 size={16} className="animate-spin" />
                                                            Mengunduh...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Download size={16} />
                                                            Download Laporan PDF
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button
                                                onClick={() => handleDonateClick(program)}
                                                style={{
                                                    backgroundColor: (isCompleted || programStatus !== 'aktif') ? GREEN_SOFT : GREEN,
                                                    color: (isCompleted || programStatus !== 'aktif') ? INK_SOFT : PAPER,
                                                    borderColor: INK
                                                }}
                                                className="w-full flex items-center justify-center gap-2 font-medium py-2 px-4 border rounded-none transition-colors duration-200 disabled:cursor-not-allowed"
                                                disabled={isCompleted || programStatus !== 'aktif'}
                                            >
                                                {isCompleted ? (
                                                    <>
                                                        <CheckCircle2 size={16} />
                                                        Target Tercapai
                                                    </>
                                                ) : (
                                                    'Donasi Sekarang'
                                                )}
                                            </Button>
                                        )}

                                        {programStatus === 'selesai' && program.tanggal_selesai && (
                                            <div style={{ color: INK_SOFT }} className="mt-2 text-center text-xs">
                                                Diselesaikan pada: {new Date(program.tanggal_selesai).toLocaleDateString('id-ID')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {isModalOpen && selectedProgram && (
                <DetailDonasiModal
                    program={selectedProgram}
                    onSubmit={handleSubmitDonasi}
                    onUploadProof={handleUploadDonasiProof}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
};

export default Crowdfunding;
