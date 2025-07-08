import React from 'react'
import { formatRupiah, formatDate, getStatusBadge } from '../../utils'

const ProgramCard = ({
    program,
    onActivate,
    onComplete,
    onEdit,
    onDelete,
    onViewDonations,
    showActions = true
}) => {
    const {
        id,
        nama_barang,
        deskripsi,
        target_dana,
        dana_terkumpul,
        foto_barang,
        kategori_barang,
        status,
        tanggal_dibuat,
        total_donatur,
        deadline
    } = program

    const progressPercentage = dana_terkumpul && target_dana ? (dana_terkumpul / target_dana) * 100 : 0
    const isCompleted = progressPercentage >= 100

    const getImageUrl = (filename) =>{
        if(!filename) return null;
        
        const pathImg = [
            `http://localhost:5000/images/donasi-program/${filename}`,
            `http://localhost:5000/uploads/${filename}`,
            `http://localhost:5000/public/images/donasi-program/${filename}`
        ];
        return pathImg[0];
    };

    const imgUrl = getImageUrl(foto_barang);

    return (
        <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
                <div className="flex items-start space-x-4">
                    {/* Foto Barang */}
                    {foto_barang && (
                        <div className="flex-shrink-0">
                            <img
                                src={imgUrl}
                                alt={nama_barang}
                                className="h-20 w-20 rounded-lg object-cover"
                                onLoad={() => console.log('Image loaded successfully:', imgUrl)}
                                onError={(e) => {
                                    console.error('Image failed to load:', imgUrl);
                                    console.error('Error event:', e);
                                    // Fallback ke placeholder
                                    e.target.src = 'https://via.placeholder.com/80x80?text=No+Image';
                                }}
                                style={{ backgroundColor: '#f3f4f6' }} // Gray background while loading
                            />
                        </div>
                    )}

                    {/* Info Program */}
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-medium text-gray-900 truncate">
                                {nama_barang}
                            </h3>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(status)}`}>
                                {status === 'aktif' ? 'Aktif' : status === 'selesai' ? 'Selesai' : status === 'draft' ? 'Draft' : 'Batal'}
                            </span>
                        </div>

                        {deskripsi && (
                            <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                                {deskripsi}
                            </p>
                        )}

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500">Kategori:</span>
                                <span className="ml-1 capitalize">{kategori_barang?.replace('_', ' ')}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Dibuat:</span>
                                <span className="ml-1">{formatDate(tanggal_dibuat)}</span>
                            </div>
                        </div>

                        {deadline && (
                            <div className="mt-2 text-sm">
                                <span className="text-gray-500">Deadline:</span>
                                <span className="ml-1 text-red-600">{formatDate(deadline)}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Progress Section */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Dana Terkumpul</span>
                            <span className="font-medium">{progressPercentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                    isCompleted ? 'bg-green-500' : 'bg-blue-500'
                                }`}
                                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-sm text-gray-500">Dana Terkumpul</span>
                            <div className="text-lg font-medium text-green-600">
                                {formatRupiah(dana_terkumpul || 0)}
                            </div>
                        </div>

                        <div>
                            <span className="text-sm text-gray-500">Target Dana</span>
                            <div className="text-lg font-medium text-gray-900">
                                {formatRupiah(target_dana)}
                            </div>
                        </div>
                    </div>

                    {/* Info Donatur */}
                    {total_donatur > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">
                                    {total_donatur} donatur berpartisipasi
                                </span>
                                {status === 'aktif' && (
                                    <button
                                        onClick={() => onViewDonations?.(program)}
                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                    >
                                        Lihat Donasi
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                {showActions && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex justify-end space-x-2">
                            {status === 'draft' && (
                                <>
                                    <button
                                        onClick={() => onEdit?.(program)}
                                        className="text-gray-600 hover:text-gray-800 px-3 py-1 rounded border border-gray-300 text-sm"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => onDelete?.(id)}
                                        className="text-red-600 hover:text-red-800 px-3 py-1 rounded border border-red-300 text-sm"
                                    >
                                        Hapus
                                    </button>
                                    <button
                                        onClick={() => onActivate?.(id)}
                                        className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 text-sm"
                                    >
                                        Aktifkan
                                    </button>
                                </>
                            )}

                            {status === 'aktif' && (
                                <>
                                    <button
                                        onClick={() => onViewDonations?.(program)}
                                        className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded border border-blue-300 text-sm"
                                    >
                                        Kelola Donasi
                                    </button>
                                    <button
                                        onClick={() => onComplete?.(id)}
                                        className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 text-sm"
                                    >
                                        Selesaikan
                                    </button>
                                </>
                            )}

                            {status === 'selesai' && (
                                <button
                                    onClick={() => onViewDonations?.(program)}
                                    className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded border border-blue-300 text-sm"
                                >
                                    Lihat Laporan
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

// Export sebagai ProgramCard dan tetap backward compatibility
export default ProgramCard
export { ProgramCard }

// Backward compatibility untuk import lama
export const LelangCard = ProgramCard