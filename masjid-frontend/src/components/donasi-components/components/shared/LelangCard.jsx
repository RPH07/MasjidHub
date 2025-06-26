import React from 'react'
import { formatRupiah, formatDate, getStatusBadge } from '../../utils'

const LelangCard = ({
    barang,
    onStart,
    onCancel,
    onFinish,
    onEdit,
    onDelete,
    showActions = true
}) => {
    const {
        id,
        nama_barang,
        deskripsi,
        harga_awal,
        harga_tertinggi,
        harga_terjual,
        foto_barang,
        kondisi_barang,
        status_lelang,
        tanggal_lelang,
        pemenang_nama,
        total_bid
    } = barang

    return (
        <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
                <div className="flex items-start space-x-4">
                    {/* Foto Barang */}
                    {foto_barang && (
                        <img
                            src={`http://localhost:5000/uploads/${foto_barang}`}
                            alt={nama_barang}
                            className="h-20 w-20 rounded-lg object-cover flex-shrink-0"
                        />
                    )}

                    {/* Info Barang */}
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-medium text-gray-900 truncate">
                                {nama_barang}
                            </h3>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(status_lelang)}`}>
                                {status_lelang}
                            </span>
                        </div>

                        {deskripsi && (
                            <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                                {deskripsi}
                            </p>
                        )}

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500">Kondisi:</span>
                                <span className="ml-1 capitalize">{kondisi_barang?.replace('_', ' ')}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Tanggal:</span>
                                <span className="ml-1">{formatDate(tanggal_lelang)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Harga Section */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-sm text-gray-500">Harga Awal</span>
                            <div className="text-lg font-medium text-gray-900">
                                {formatRupiah(harga_awal)}
                            </div>
                        </div>

                        <div>
                            <span className="text-sm text-gray-500">
                                {status_lelang === 'selesai' ? 'Harga Final' : 'Harga Tertinggi'}
                            </span>
                            <div className="text-lg font-medium">
                                {status_lelang === 'selesai' && harga_terjual ? (
                                    <span className="text-green-600">{formatRupiah(harga_terjual)}</span>
                                ) : status_lelang === 'aktif' && harga_tertinggi ? (
                                    <span className="text-blue-600">{formatRupiah(harga_tertinggi)}</span>
                                ) : (
                                    <span className="text-gray-400">-</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Info Tambahan */}
                    {(total_bid > 0 || pemenang_nama) && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="flex justify-between items-center text-sm">
                                {total_bid > 0 && (
                                    <span className="text-gray-600">
                                        {total_bid} bid masuk
                                    </span>
                                )}
                                {pemenang_nama && (
                                    <span className="text-gray-600">
                                        Pemenang: {pemenang_nama}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                {showActions && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex justify-end space-x-2">
                            {status_lelang === 'draft' && (
                                <>
                                    <button
                                        onClick={() => onEdit?.(barang)}
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
                                        onClick={() => onStart?.(id)}
                                        className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 text-sm"
                                    >
                                        Mulai Lelang
                                    </button>
                                </>
                            )}

                            {status_lelang === 'aktif' && (
                                <>
                                    <button
                                        onClick={() => onCancel?.(id)}
                                        className="text-red-600 hover:text-red-800 px-3 py-1 rounded border border-red-300 text-sm"
                                    >
                                        Batalkan
                                    </button>
                                    <button
                                        onClick={() => onFinish?.(id)}
                                        className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 text-sm"
                                    >
                                        Selesaikan
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default LelangCard