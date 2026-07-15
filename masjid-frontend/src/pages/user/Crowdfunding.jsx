import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/nav';
import toast, { Toaster } from 'react-hot-toast';
import { CheckCircle2, Download, Loader2 } from 'lucide-react';
import DetailDonasiModal from '../../components/donasi-components/components/shared/DetailDonasiModal';
import { useAuth } from '../../hooks/useAuth'
import { donasiService } from '../../components/donasi-components/services/DonasiService';
import transparansiService from '../../services/transparansiService';

const Crowdfunding = () => {
    const { user } = useAuth();
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');
    const [downloadingPdf, setDownloadingPdf] = useState(null);

    const isLoggedIn = Boolean(user);

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

    const formatRupiah = (angka) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(angka);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-green-500" />
                <p className="ml-4 text-gray-600">Memuat program donasi...</p>
            </div>
        );
    }

    return (
        <div className={`${isLoggedIn ? '' : 'bg-gray-50 min-h-screen'}`}>
            {!isLoggedIn && <Navbar />}

            <Toaster
                position="top-right"
                reverseOrder={false}
                gutter={8}
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                        padding: '16px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        maxWidth: '400px',
                    },
                    success: {
                        style: { background: '#10b981', color: '#fff' },
                        iconTheme: { primary: '#fff', secondary: '#10b981' },
                    },
                    error: {
                        style: { background: '#ef4444', color: '#fff' },
                        iconTheme: { primary: '#fff', secondary: '#ef4444' },
                    },
                    loading: {
                        style: { background: '#3b82f6', color: '#fff' },
                    },
                }}
            />

            <div className={`container mx-auto px-4 ${isLoggedIn ? 'py-4' : 'py-8'}`}>
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-800">Program Donasi Masjid</h1>
                    <p className="text-lg text-gray-600 mt-2">
                        {isLoggedIn
                            ? 'Mari lanjutkan kontribusi Anda untuk masjid'
                            : 'Mari bantu penuhi kebutuhan masjid melalui program pengadaan barang.'
                        }
                    </p>
                </div>

                <div className="flex justify-center mb-8">
                    <div className="bg-white rounded-lg p-1 shadow-sm border">
                        <button
                            onClick={() => setFilterStatus('all')}
                            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                                filterStatus === 'all'
                                    ? 'bg-blue-500 text-white'
                                    : 'text-gray-600 hover:text-blue-500'
                            }`}
                        >
                            Semua Program ({programs.length})
                        </button>
                        <button
                            onClick={() => setFilterStatus('aktif')}
                            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                                filterStatus === 'aktif'
                                    ? 'bg-green-500 text-white'
                                    : 'text-gray-600 hover:text-green-500'
                            }`}
                        >
                            Sedang Berjalan
                        </button>
                        <button
                            onClick={() => setFilterStatus('selesai')}
                            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                                filterStatus === 'selesai'
                                    ? 'bg-purple-500 text-white'
                                    : 'text-gray-600 hover:text-purple-500'
                            }`}
                        >
                            Telah Selesai
                        </button>
                    </div>
                </div>

                {filteredPrograms.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-500 text-lg mb-4">
                            {filterStatus === 'aktif' && 'Belum ada program donasi aktif saat ini'}
                            {filterStatus === 'selesai' && 'Belum ada program donasi yang selesai'}
                            {filterStatus === 'all' && 'Belum ada program donasi saat ini'}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredPrograms.map((program) => {
                            const progress = (program.dana_terkumpul / program.target_dana) * 100;
                            const programStatus = program.status;
                            const isCompleted = progress >= 100 || programStatus === 'selesai';
                            const isDownloading = downloadingPdf === program.id;

                            return (
                                <div key={program.id} className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300">
                                    <div className="relative">
                                        {program.foto_barang ? (
                                            <img
                                                src={program.foto_barang}
                                                alt={program.nama_barang}
                                                className="w-full h-56 object-cover"
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-56 bg-gray-200 flex items-center justify-center">
                                                <span className="text-gray-400">No Image</span>
                                            </div>
                                        )}

                                        {programStatus === 'selesai' && (
                                            <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                                <CheckCircle2 size={14} />
                                                Selesai
                                            </div>
                                        )}
                                        {programStatus === 'aktif' && (
                                            <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                                <span className="h-1.5 w-1.5 rounded-full bg-white" />
                                                Aktif
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-6">
                                        <h2 className="text-2xl font-bold text-gray-800 mb-2">{program.nama_barang}</h2>
                                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{program.deskripsi}</p>

                                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                                            <div
                                                className={`h-2.5 rounded-full transition-all duration-300 ${
                                                    isCompleted ? 'bg-green-500' : 'bg-blue-500'
                                                }`}
                                                style={{ width: `${Math.min(progress, 100)}%` }}
                                            ></div>
                                        </div>

                                        <div className="flex justify-between items-center text-sm mb-4">
                                            <span className="font-semibold text-green-700">
                                                Terkumpul: {formatRupiah(program.dana_terkumpul || 0)}
                                            </span>
                                            <span className="text-gray-500">
                                                Target: {formatRupiah(program.target_dana)}
                                            </span>
                                        </div>

                                        <div className="text-center text-sm text-gray-600 mb-4">
                                            {program.total_donatur || 0} donatur • {progress.toFixed(1)}% tercapai
                                        </div>

                                        {programStatus === 'selesai' ? (
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-center gap-1.5 w-full bg-green-100 text-green-800 font-bold py-2 px-4 rounded-lg">
                                                    <CheckCircle2 size={16} />
                                                    Program Telah Selesai
                                                </div>

                                                <button
                                                    onClick={() => handleDownloadPdf(program.id, program.nama_barang)}
                                                    disabled={isDownloading}
                                                    className={`w-full flex items-center justify-center gap-2 font-bold py-2 px-4 rounded-lg transition-colors duration-300 ${
                                                        isDownloading
                                                            ? 'bg-gray-400 text-white cursor-not-allowed'
                                                            : 'bg-purple-600 text-white hover:bg-purple-700'
                                                    }`}
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
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleDonateClick(program)}
                                                className={`w-full flex items-center justify-center gap-2 font-bold py-2 px-4 rounded-lg transition-colors duration-300 ${
                                                    isCompleted || programStatus !== 'aktif'
                                                        ? 'bg-gray-400 text-white cursor-not-allowed'
                                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                                }`}
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
                                            </button>
                                        )}

                                        {programStatus === 'selesai' && program.tanggal_selesai && (
                                            <div className="mt-2 text-center text-xs text-gray-500">
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