import { formatCurrency } from '../../kas-components/utils/formatters';

const formatDate = (value) => {
    if (!value) return '-';
    return new Date(value).toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short'
    });
};

const formatLabel = (value) => {
    if (!value) return '-';
    return String(value)
        .replace(/[_-]+/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

const ZakatVerificationTable = ({
    data = [],
    loading = false,
    actionLoading = false,
    onApprove,
    onReject,
    onOpenBukti
}) => {
    if (loading) {
        return (
            <div className="rounded-lg border bg-white p-6 text-center text-gray-500">
                Memuat data zakat...
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="rounded-lg border bg-white p-6 text-center text-gray-500">
                Tidak ada zakat yang perlu diverifikasi.
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full min-w-245">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Tanggal</th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Muzakki</th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Jenis</th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Nominal</th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Kode Unik</th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Total Bayar</th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Metode</th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Bukti</th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Aksi</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                        {data.map((item) => (
                            <tr key={item.id}>
                                <td className="px-4 py-3 text-sm text-gray-700">{formatDate(item.created_at)}</td>
                                <td className="px-4 py-3 text-sm">
                                    <div className="font-medium text-gray-900">{item.nama || 'Hamba Allah'}</div>
                                    <div className="text-xs text-gray-500">{item.email || '-'}</div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700">{formatLabel(item.jenis_zakat)}</td>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(item.jumlah)}</td>
                                <td className="px-4 py-3 text-sm text-yellow-700">+{item.kode_unik || 0}</td>
                                <td className="px-4 py-3 text-sm font-semibold text-green-700">{formatCurrency(item.total_bayar)}</td>
                                <td className="px-4 py-3 text-sm text-gray-700">{formatLabel(item.metode_pembayaran)}</td>
                                <td className="px-4 py-3 text-sm">
                                    {item.bukti_transfer ? (
                                        <button
                                            type="button"
                                            onClick={() => onOpenBukti(item.bukti_transfer, item)}
                                            className="rounded bg-blue-50 px-2 py-1 text-xs text-blue-700 hover:bg-blue-100"
                                        >
                                            Lihat
                                        </button>
                                    ) : (
                                        <span className="text-xs text-gray-400">Belum ada</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            disabled={actionLoading}
                                            onClick={() => onApprove(item)}
                                            className="rounded bg-green-600 px-3 py-1.5 text-xs text-white hover:bg-green-700 disabled:opacity-50"
                                        >
                                            Setujui
                                        </button>

                                        <button
                                            type="button"
                                            disabled={actionLoading}
                                            onClick={() => onReject(item)}
                                            className="rounded bg-red-600 px-3 py-1.5 text-xs text-white hover:bg-red-700 disabled:opacity-50"
                                        >
                                            Tolak
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ZakatVerificationTable;
