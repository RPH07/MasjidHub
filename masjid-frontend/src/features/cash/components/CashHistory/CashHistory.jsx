import React, { useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { cashService } from '../../services/cashService';
import { formatCurrency } from '@/utils/formatters';
import { Button } from "@/components/ui/button";

const formatLabel = (value) => {
  if (!value) return '-';
  return String(value).replace(/[_-]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};

const statusClass = {
  approved: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  rejected: 'bg-red-100 text-red-800',
  voided: 'bg-gray-200 text-gray-800',
  void_requested: 'bg-yellow-100 text-yellow-800',
  void_rejected: 'bg-red-100 text-red-800'
};

const CashHistory = ({
  history = { transactions: [], summary: {}, filters: {} },
  filters = {},
  onOpenBukti
}) => {
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [exportLoading, setExportLoading] = useState({ csv: false, xlsx: false, pdf: false });

  const rows = useMemo(() => {
    const data = [...(history.transactions || [])];
    data.sort((a, b) => {
      const direction = sortConfig.direction === 'asc' ? 1 : -1;
      if (sortConfig.key === 'jumlah') {
        return (Number(a.jumlah || 0) - Number(b.jumlah || 0)) * direction;
      }
      return String(a[sortConfig.key] || '').localeCompare(String(b[sortConfig.key] || '')) * direction;
    });
    return data;
  }, [history.transactions, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const handleExport = async (format) => {
    setExportLoading((prev) => ({ ...prev, [format]: true }));
    try {
      const filename = format === 'pdf'
        ? await cashService.downloadPdfReport(filters)
        : await cashService.downloadHistoryExport({ ...filters, type: 'all', status: 'all' }, format);

      await Swal.fire({
        icon: 'success',
        title: 'Export Berhasil',
        text: `${filename} berhasil diunduh`,
        timer: 2500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error exporting kas:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Export Gagal',
        text: error.response?.data?.msg || error.response?.data?.error || 'Gagal mengunduh laporan kas'
      });
    } finally {
      setExportLoading((prev) => ({ ...prev, [format]: false }));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h3 className="text-lg font-medium">Riwayat dan Laporan Kas</h3>
          <p className="text-sm text-gray-500">
            Total {history.summary?.total || 0} transaksi, {history.summary?.voided || 0} void
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => handleExport('csv')}
            disabled={exportLoading.csv}
            variant="success"
            size="sm"
          >
            {exportLoading.csv ? 'Mengunduh...' : 'CSV'}
          </Button>
          <Button
            onClick={() => handleExport('xlsx')}
            disabled={exportLoading.xlsx}
            variant="info"
            size="sm"
          >
            {exportLoading.xlsx ? 'Mengunduh...' : 'Excel'}
          </Button>
          <Button
            onClick={() => handleExport('pdf')}
            disabled={exportLoading.pdf}
            variant="danger"
            size="sm"
          >
            {exportLoading.pdf ? 'Mengunduh...' : 'PDF'}
          </Button>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="p-6 text-center text-gray-500 bg-white rounded-lg border">
          Tidak ada riwayat transaksi pada periode ini.
        </div>
      ) : (
        <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-240">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    ['created_at', 'Tanggal'],
                    ['type_label', 'Jenis'],
                    ['nama_pemberi', 'Nama'],
                    ['kategori', 'Kategori'],
                    ['jumlah', 'Jumlah'],
                    ['status', 'Status']
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rows.map((item) => (
                  <tr key={`${item.type}-${item.id}`}>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(item.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-sm">{item.type_label || formatLabel(item.type)}</td>
                    <td className="px-6 py-4 text-sm">{item.nama_pemberi || '-'}</td>
                    <td className="px-6 py-4 text-sm">{formatLabel(item.kategori)}</td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {formatCurrency(item.jumlah)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${statusClass[item.status] || 'bg-gray-100 text-gray-800'}`}>
                        {formatLabel(item.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{item.kode_unik ? `+${item.kode_unik}` : '-'}</td>
                    <td className="px-6 py-4">
                      {item.bukti_transfer ? (
                        <Button
                          onClick={() => onOpenBukti(item.bukti_transfer, item)}
                          variant="infoSoft"
                          size="xs"
                        >
                          Lihat
                        </Button>
                      ) : (
                        <span className="text-gray-400 text-sm">Tidak ada</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.reject_reason || '-'}
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

export default CashHistory;
