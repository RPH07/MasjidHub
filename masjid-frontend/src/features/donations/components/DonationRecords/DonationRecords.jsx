import React, { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import { donationService } from '../../services';
import { Button } from "@/components/ui/button";
import { formatRupiah, toNumber } from '@/utils/formatters';

const DonationRecords = ({ program, onClose }) => {
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isExporting, setIsExporting] = useState(false);

    const fetchDonations = useCallback(async () => {
        try {
            setLoading(true);
            const response = await donationService.getDonationHistory(program.id);
            setDonations(response.data?.data?.donasi || []);
        } catch (error) {
            console.error('Error fetching donations:', error);
            setError('Gagal memuat data donasi');
        } finally {
            setLoading(false);
        }
    }, [program.id]);

    useEffect(() => {
        fetchDonations();
    }, [fetchDonations, program.id]);

    const handleExportPDF = async () => {
        try {
            setIsExporting(true);
            
            const response = await donationService.exportProgramPdf(program.id);
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `laporan-donasi-${program.nama_barang}-${Date.now()}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error('Error exporting PDF:', error);
            Swal.fire('Gagal', 'Gagal export PDF. Silakan coba lagi.', 'error');
        } finally {
            setIsExporting(false);
        }
    };

    const targetDana = toNumber(program.target_dana);
    const danaTerkumpul = toNumber(program.dana_terkumpul);
    const progressPercentage = targetDana > 0 ? (danaTerkumpul / targetDana) * 100 : 0;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-900 mb-2">
                                {program.status === 'selesai' ? 'Laporan Donasi' : 'Kelola Donasi'}
                            </h2>
                            <h3 className="text-lg text-gray-700 mb-3">{program.nama_barang}</h3>
                            
                            {/* Progress Info */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500">Dana Terkumpul:</span>
                                    <div className="font-semibold text-green-600">
                                        {formatRupiah(danaTerkumpul)}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-gray-500">Target Dana:</span>
                                    <div className="font-semibold">
                                        {formatRupiah(targetDana)}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-gray-500">Progress:</span>
                                    <div className="font-semibold text-blue-600">
                                        {progressPercentage.toFixed(1)}%
                                    </div>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mt-3">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                        className={`h-2 rounded-full transition-all duration-300 ${
                                            progressPercentage >= 100 ? 'bg-green-500' : 'bg-blue-500'
                                        }`}
                                        style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                        
                        <Button
                            onClick={onClose}
                            variant="icon"
                            size="icon"
                            className="ml-4 text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </Button>
                    </div>
                </div>

                {/* Actions */}
                <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                            Total {donations.length} donatur berpartisipasi
                        </div>
                        <div className="flex space-x-2">
                            <Button
                                onClick={handleExportPDF}
                                disabled={isExporting}
                                variant="danger"
                            >
                                {isExporting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Exporting...
                                    </>
                                ) : (
                                    <>
                                        📄 Export PDF
                                    </>
                                )}
                            </Button>
                            <Button
                                onClick={fetchDonations}
                                variant="info"
                            >
                                🔄 Refresh
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto" style={{ maxHeight: '60vh' }}>
                    {loading ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-8">
                            <div className="text-red-600 mb-4">{error}</div>
                            <Button
                                onClick={fetchDonations}
                                variant="info"
                            >
                                Coba Lagi
                            </Button>
                        </div>
                    ) : donations.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-gray-500 text-lg mb-2">
                                Belum ada donasi untuk program ini
                            </div>
                            <div className="text-gray-400">
                                Donasi akan muncul setelah divalidasi oleh admin
                            </div>
                        </div>
                    ) : (
                        <div className="p-6">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                No
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Nama Donatur
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Nominal
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Metode
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Tanggal
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Catatan
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {donations.map((donation, index) => (
                                            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                    {index + 1}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {donation.nama_donatur || 'Anonim'}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="text-sm font-semibold text-green-600">
                                                        {formatRupiah(donation.nominal)}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                        {donation.metode_pembayaran?.replace('_', ' ').toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                    {donation.created_at ? new Date(donation.created_at).toLocaleDateString('id-ID') : '-'}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
                                                    {donation.catatan || '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <div className="flex justify-end">
                        <Button
                            onClick={onClose}
                            variant="neutral"
                        >
                            Tutup
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DonationRecords;
