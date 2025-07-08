import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import DetailDonasiModal from '../../components/donasi-components/components/shared/DetailDonasiModal';
import { useAuth } from '../../hooks/useAuth'

const Crowdfunding = () => {
    const { user } = useAuth();
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');
    const [downloadingPdf, setDownloadingPdf] = useState(null);
    const API_URL = 'http://localhost:5000/api/donasi';

    const location = useLocation();
    const isLoggedIn = location.pathname.startsWith('/dashboard');

    // ✅ FIX: Perbaiki fetch function
    const fetchPrograms = async () => {
        try {
            setLoading(true);
            console.log('🔍 Fetching programs with filter:', filterStatus);
            
            let url = `${API_URL}/program`;
            if (filterStatus === 'all') {
                url += '?status=aktif,selesai';
            } else {
                url += `?status=${filterStatus}`;
            }
            
            console.log('📡 Request URL:', url);
            
            const response = await axios.get(url);
            console.log('📊 Response data:', response.data);
            
            setPrograms(response.data);
        } catch (error) {
            console.error('❌ Error fetching programs:', error);
            console.error('Response:', error.response?.data);
            // ✅ TOAST: Error saat fetch data
            toast.error('Gagal memuat data program donasi');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrograms();
    }, [filterStatus]);

    // ✅ UPDATE: Function download PDF dengan Toast
    const handleDownloadPdf = async (programId, programName) => {
        try {
            setDownloadingPdf(programId);
            
            // ✅ TOAST: Loading state
            const loadingToast = toast.loading('Sedang menyiapkan laporan PDF...');
            
            console.log('📄 Downloading PDF for program:', programId);
            
            const response = await axios.get(`${API_URL}/program/${programId}/export/pdf`, {
                responseType: 'blob',
                timeout: 30000
            });
            
            // ✅ Create download link
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            
            const filename = `laporan-donasi-${programName.replace(/\s+/g, '-')}-${new Date().getTime()}.pdf`;
            link.download = filename;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            window.URL.revokeObjectURL(downloadUrl);
            
            console.log('✅ PDF downloaded successfully');
            
            // ✅ TOAST: Success - dismiss loading toast dan show success
            toast.dismiss(loadingToast);
            toast.success(
                `Laporan PDF "${programName}" berhasil diunduh!`,
                {
                    duration: 4000,
                    icon: '📄',
                }
            );
            
        } catch (error) {
            console.error('❌ Error downloading PDF:', error);
            
            // ✅ TOAST: Error
            toast.error(
                'Gagal mengunduh laporan. Silakan coba lagi.',
                {
                    duration: 5000,
                    icon: '❌',
                }
            );
        } finally {
            setDownloadingPdf(null);
        }
    };

    // ✅ UPDATE: Submit donasi dengan Toast
    const handleSubmitDonasi = async (donasiData) => {
        try {
            // ✅ TOAST: Loading saat submit
            const loadingToast = toast.loading('Sedang mengirim donasi...');
            
            if (user?.id && !donasiData.get('user_id')) {
                donasiData.append('user_id', user.id);
            }
            
            const response = await axios.post(
                `${API_URL}/submit/${selectedProgram.id}`,
                donasiData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            // ✅ TOAST: Success
            toast.dismiss(loadingToast);
            toast.success(
                response.data.message || 'Donasi berhasil dikirim!',
                {
                    duration: 4000,
                    icon: '🎉',
                }
            );

            return {
                success: true,
                message: response.data.message || 'Donasi berhasil dikirim!',
                data: response.data.data
            };
        } catch (error) {
            console.error('Error submitting donasi:', error);
            
            // ✅ TOAST: Error
            toast.error(
                error.response?.data?.error || 'Gagal mengirim donasi',
                {
                    duration: 5000,
                    icon: '😞',
                }
            );
            
            return {
                success: false,
                message: error.response?.data?.error || 'Gagal mengirim donasi'
            };
        }
    };

    // Fungsi untuk membuka modal donasi
    const handleDonateClick = (program) => {
        if (program.status === 'aktif' || program.status_pengadaan === 'aktif') {
            setSelectedProgram(program);
            setIsModalOpen(true);
        } else {
            // ✅ TOAST: Info ketika program tidak aktif
            toast('Program donasi ini sedang tidak aktif', {
                icon: 'ℹ️',
                duration: 3000,
            });
        }
    };

    // Fungsi untuk menutup modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedProgram(null);
        fetchPrograms();
    };

    // ✅ FIX: Perbaiki filtering
    const filteredPrograms = programs.filter(program => {
        if (filterStatus === 'all') return true;
        
        const programStatus = program.status || program.status_pengadaan;
        
        if (filterStatus === 'aktif') return programStatus === 'aktif';
        if (filterStatus === 'selesai') return programStatus === 'selesai';
        return true;
    });
    
    // Helper untuk format Rupiah
    const formatRupiah = (angka) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(angka);
    };

    // Debug info
    console.log('🎯 Current filter:', filterStatus);
    console.log('📊 Total programs:', programs.length);
    console.log('🔍 Filtered programs:', filteredPrograms.length);
    console.log('📋 Programs data:', programs);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
                <p className="ml-4 text-gray-600">Memuat program donasi...</p>
            </div>
        );
    }

    return (
        <div className={`${isLoggedIn ? '' : 'bg-gray-50 min-h-screen'}`}>
            {/* ✅ TOAST CONTAINER - WAJIB ADA! */}
            <Toaster
                position="top-right"
                reverseOrder={false}
                gutter={8}
                containerClassName=""
                containerStyle={{}}
                toastOptions={{
                    // Default options
                    className: '',
                    duration: 4000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                        padding: '16px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        maxWidth: '400px',
                    },
                    // Success style
                    success: {
                        style: {
                            background: '#10b981',
                            color: '#fff',
                        },
                        iconTheme: {
                            primary: '#fff',
                            secondary: '#10b981',
                        },
                    },
                    // Error style
                    error: {
                        style: {
                            background: '#ef4444',
                            color: '#fff',
                        },
                        iconTheme: {
                            primary: '#fff',
                            secondary: '#ef4444',
                        },
                    },
                    // Loading style
                    loading: {
                        style: {
                            background: '#3b82f6',
                            color: '#fff',
                        },
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

                {/* FILTER TABS */}
                <div className="flex justify-center mb-8">
                    <div className="bg-white rounded-lg p-1 shadow-sm border">
                        <button
                            onClick={() => {
                                setFilterStatus('all');
                                // ✅ TOAST: Feedback filter change (opsional)
                                toast('Menampilkan semua program', { 
                                    icon: '📋', 
                                    duration: 2000 
                                });
                            }}
                            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                                filterStatus === 'all'
                                    ? 'bg-blue-500 text-white'
                                    : 'text-gray-600 hover:text-blue-500'
                            }`}
                        >
                            Semua Program ({programs.length})
                        </button>
                        <button
                            onClick={() => {
                                setFilterStatus('aktif');
                                toast('Menampilkan program aktif', { 
                                    icon: '🔥', 
                                    duration: 2000 
                                });
                            }}
                            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                                filterStatus === 'aktif'
                                    ? 'bg-green-500 text-white'
                                    : 'text-gray-600 hover:text-green-500'
                            }`}
                        >
                            Sedang Berjalan
                        </button>
                        <button
                            onClick={() => {
                                setFilterStatus('selesai');
                                toast('Menampilkan program selesai', { 
                                    icon: '✅', 
                                    duration: 2000 
                                });
                            }}
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

                {/* Rest of the component remains the same... */}
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
                            const programStatus = program.status || program.status_pengadaan;
                            const isCompleted = progress >= 100 || programStatus === 'selesai';
                            const isDownloading = downloadingPdf === program.id;
                            
                            return (
                                <div key={program.id} className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300">
                                    {/* BADGE STATUS */}
                                    <div className="relative">
                                        {program.foto_barang ? (
                                            <img 
                                                src={`http://localhost:5000/images/donasi-program/${program.foto_barang}`}
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
                                        
                                        {/* Badge Status */}
                                        {programStatus === 'selesai' && (
                                            <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                                ✓ Selesai
                                            </div>
                                        )}
                                        {programStatus === 'aktif' && (
                                            <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                                🔥 Aktif
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

                                        {/* CONDITIONAL BUTTONS BERDASARKAN STATUS */}
                                        {programStatus === 'selesai' ? (
                                            <div className="space-y-2">
                                                {/* Badge Selesai */}
                                                <div className="w-full bg-green-100 text-green-800 font-bold py-2 px-4 rounded-lg text-center">
                                                    ✓ Program Telah Selesai
                                                </div>
                                                
                                                {/* Download PDF Button */}
                                                <button 
                                                    onClick={() => handleDownloadPdf(program.id, program.nama_barang)}
                                                    disabled={isDownloading}
                                                    className={`w-full font-bold py-2 px-4 rounded-lg transition-colors duration-300 ${
                                                        isDownloading
                                                            ? 'bg-gray-400 text-white cursor-not-allowed'
                                                            : 'bg-purple-600 text-white hover:bg-purple-700'
                                                    }`}
                                                >
                                                    {isDownloading ? (
                                                        <div className="flex items-center justify-center">
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                            Mengunduh...
                                                        </div>
                                                    ) : (
                                                        <>
                                                            📄 Download Laporan PDF
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        ) : (
                                            /* Button untuk program aktif */
                                            <button 
                                                onClick={() => handleDonateClick(program)}
                                                className={`w-full font-bold py-2 px-4 rounded-lg transition-colors duration-300 ${
                                                    isCompleted || programStatus !== 'aktif'
                                                        ? 'bg-gray-400 text-white cursor-not-allowed' 
                                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                                }`}
                                                disabled={isCompleted || programStatus !== 'aktif'}
                                            >
                                                {isCompleted 
                                                    ? '✓ Target Tercapai' 
                                                    : 'Donasi Sekarang'
                                                }
                                            </button>
                                        )}

                                        {/* INFO TANGGAL SELESAI */}
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

            {/* Modal */}
            {isModalOpen && selectedProgram && (
                <DetailDonasiModal 
                    program={selectedProgram}
                    onSubmit={handleSubmitDonasi}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
};

export default Crowdfunding;