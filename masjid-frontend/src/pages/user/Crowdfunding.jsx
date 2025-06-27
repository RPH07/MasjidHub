import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DetailDonasiModal from '../../components/donasi-components/components/shared/DetailDonasiModal';

const Crowdfunding = () => {
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const API_URL = 'http://localhost:5000/api/donasi';

    // Fungsi untuk mengambil data program dari backend
    const fetchPrograms = async () => {
        try {
            setLoading(true);
            // Filter hanya program yang aktif untuk public
            const response = await axios.get(`${API_URL}/program?status=aktif`);
            setPrograms(response.data);
        } catch (error) {
            console.error('Gagal mengambil data program crowdfunding:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrograms();
    }, []);

    // Fungsi untuk submit donasi
    const handleSubmitDonasi = async (donasiData) => {
        try {
            const response = await axios.post(
                `${API_URL}/submit/${selectedProgram.id}`,
                donasiData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            return {
                success: true,
                message: response.data.message || 'Donasi berhasil dikirim!'
            };
        } catch (error) {
            console.error('Error submitting donasi:', error);
            return {
                success: false,
                message: error.response?.data?.error || 'Gagal mengirim donasi'
            };
        }
    };

    // Fungsi untuk membuka modal donasi
    const handleDonateClick = (program) => {
        setSelectedProgram(program);
        setIsModalOpen(true);
    };

    // Fungsi untuk menutup modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedProgram(null);
        // Refresh data setelah donasi berhasil untuk melihat update progress bar
        fetchPrograms();
    };
    
    // Helper untuk format Rupiah
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 py-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-800">Program Donasi Masjid</h1>
                    <p className="text-lg text-gray-600 mt-2">Mari bantu penuhi kebutuhan masjid melalui program pengadaan barang.</p>
                </div>

                {programs.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-500 text-lg">
                            Belum ada program donasi aktif saat ini
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {programs.map((program) => {
                            const progress = (program.dana_terkumpul / program.target_dana) * 100;
                            const isCompleted = progress >= 100;
                            
                            return (
                                <div key={program.id} className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300">
                                    {program.foto_barang && (
                                        <img 
                                            src={`http://localhost:5000/images/donasi-program/${program.foto_barang}`}
                                            alt={program.nama_barang} 
                                            className="w-full h-56 object-cover"
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                                            }}
                                        />
                                    )}
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

                                        <button 
                                            onClick={() => handleDonateClick(program)}
                                            className={`w-full font-bold py-2 px-4 rounded-lg transition-colors duration-300 ${
                                                isCompleted 
                                                    ? 'bg-green-500 text-white cursor-not-allowed' 
                                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                            }`}
                                            disabled={isCompleted}
                                        >
                                            {isCompleted ? 'Target Tercapai ✓' : 'Donasi Sekarang'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Render Modal hanya jika isModalOpen bernilai true */}
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