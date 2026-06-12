import React, { useMemo, useState } from 'react';
import { formatCurrency } from '../../utils/formatters';

const formatLabel = (value) => {
  if (!value) return '-';
  return String(value).replace(/[_-]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};

const getSourceLabel = (source) => {
  const labels = {
    zakat: 'Zakat',
    infaq: 'Infaq',
    donasi_pengadaan: 'Donasi Program',
    manual: 'Kas Manual'
  };
  return labels[source] || formatLabel(source);
};

const KasPemasukan = ({
  transactions = [],
  onEdit,
  onDelete,
  onOpenModal,
  onOpenBukti,
  onRequestVoid
}) => {
  const [sortConfig, setSortConfig] = useState({ key: 'tanggal', direction: 'desc' });

  const rows = useMemo(() => {
    const sorted = [...transactions];
    sorted.sort((a, b) => {
      const direction = sortConfig.direction === 'asc' ? 1 : -1;
      if (sortConfig.key === 'jumlah') {
        return (Number(a.jumlah || 0) - Number(b.jumlah || 0)) * direction;
      }
      return String(a[sortConfig.key] || '').localeCompare(String(b[sortConfig.key] || '')) * direction;
    });
    return sorted;
  }, [transactions, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const canManageManual = (item) => item.source_table === 'manual' && item.void_status !== 'approved';
  const canRequestVoid = (item) => item.void_status === 'none' || !item.void_status;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Data Pemasukan</h3>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          onClick={() => onOpenModal('add-pemasukan')}
        >
          + Tambah Pemasukan
        </button>
      </div>

      {rows.length === 0 ? (
        <div className="p-6 text-center text-gray-500 bg-white rounded-lg border">
          Belum ada pemasukan pada periode ini.
        </div>
      ) : (
        <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    ['tanggal', 'Tanggal'],
                    ['source_table', 'Sumber'],
                    ['nama_pemberi', 'Nama'],
                    ['kategori', 'Kategori'],
                    ['jumlah', 'Jumlah']
                  ].map(([key, label]) => (
                    <th
                      key={key}
                      onClick={() => handleSort(key)}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                    >
                      {label}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kode Unik</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bukti</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rows.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(item.tanggal).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        {getSourceLabel(item.source_table)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.nama_pemberi || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{formatLabel(item.kategori)}</td>
                    <td className="px-6 py-4 text-sm font-medium text-green-600">
                      +{formatCurrency(item.jumlah)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {item.kode_unik ? `+${item.kode_unik}` : '-'}
                    </td>
                    <td className="px-6 py-4">
                      {item.bukti_transfer ? (
                        <button
                          onClick={() => onOpenBukti(item.bukti_transfer, item)}
                          className="text-blue-600 hover:text-blue-900 text-sm bg-blue-50 px-2 py-1 rounded"
                        >
                          Lihat
                        </button>
                      ) : (
                        <span className="text-gray-400 text-sm">Tidak ada</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {item.void_status === 'requested' ? (
                        <span className="text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full text-xs">Void Pending</span>
                      ) : item.void_status === 'rejected' ? (
                        <span className="text-red-700 bg-red-100 px-2 py-1 rounded-full text-xs">Void Ditolak</span>
                      ) : (
                        <span className="text-green-700 bg-green-100 px-2 py-1 rounded-full text-xs">Aktif</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex flex-wrap gap-2">
                        {canManageManual(item) && (
                          <>
                            <button onClick={() => onEdit(item)} className="text-blue-600 hover:text-blue-900">
                              Edit
                            </button>
                            <button onClick={() => onDelete(item.id)} className="text-red-600 hover:text-red-900">
                              Hapus
                            </button>
                          </>
                        )}
                        {canRequestVoid(item) && (
                          <button onClick={() => onRequestVoid(item)} className="text-orange-600 hover:text-orange-900">
                            Void
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default KasPemasukan;
