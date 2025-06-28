import React from "react";
import { formatCurrency } from "../../utils/formatters";

const formatKategori = (kategoriStr) => {
  if (!kategoriStr) return "Umum";
  return kategoriStr
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const KasPemasukan = ({
  kasData,
  zakatData,
  infaqData,
  donasiData = [],
  onOpenModal,
  onOpenBukti,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <h3 className="text-lg font-medium">Data Pemasukan</h3>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm sm:text-base"
          onClick={() => onOpenModal("add-pemasukan")}
        >
          + Tambah Pemasukan
        </button>
      </div>

      {/* Desktop Table View - Ditampilkan pada layar besar (sm dan ke atas) */}
      <div className="hidden sm:block rounded-lg border bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jenis
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama/Donatur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deskripsi/Program
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Metode
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jumlah
                </th>
                {/*  TAMBAH KOLOM KODE UNIK */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kode Unik
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bukti
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi/Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {/* Data Zakat */}
              {zakatData.map((item) => (
                <tr key={`zakat-${item.id}`}>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(item.created_at).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      🕌 Zakat {item.jenis_zakat}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.nama}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">-</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      item.metode_pembayaran === 'qris'
                        ? 'bg-purple-100 text-purple-800'
                        : item.metode_pembayaran === 'cash'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {item.metode_pembayaran === 'qris'
                        ? '📱 QRIS'
                        : item.metode_pembayaran === 'cash'
                        ? '💵 Tunai'
                        : '🏦 Transfer Bank'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-green-600">
                    {formatCurrency(item.jumlah)}
                  </td>
                  <td className="px-6 py-4 text-sm text-center">
                    <span className="text-gray-400 text-xs">-</span>
                  </td>
                  <td className="px-6 py-4">
                    {item.bukti_transfer ? (
                      <button
                        onClick={() => onOpenBukti(item.bukti_transfer)}
                        className="text-blue-600 hover:text-blue-900 text-sm bg-blue-50 px-2 py-1 rounded"
                      >
                        Lihat Bukti
                      </button>
                    ) : (
                      <span className="text-gray-400 text-sm">Tidak ada</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-green-600 text-sm font-medium">✓ Approved</span>
                  </td>
                </tr>
              ))}

              {/* Data Infaq */}
              {infaqData.map((item) => (
                <tr key={`infaq-${item.id}`}>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(item.tanggal).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      📝 Infaq
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {item.nama_pemberi || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {item.keterangan || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                      📝 Form Online
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-green-600">
                    {formatCurrency(item.jumlah)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-400 text-sm">Tidak ada</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-green-600 text-sm font-medium">✓ Approved</span>
                  </td>
                </tr>
              ))}

              {/* Data Donasi */}
              {donasiData.map((item) => (
                <tr key={`donasi-${item.id}`}>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(item.tanggal || item.created_at).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                      💝 Donasi Program
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {item.nama_donatur || item.nama_pemberi || 'Hamba Allah'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="font-medium">{item.program_donasi || 'Program Donasi'}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      item.metode_pembayaran === 'qris'
                        ? 'bg-purple-100 text-purple-800'
                        : item.metode_pembayaran === 'cash' || item.metode_pembayaran === 'tunai'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {item.metode_pembayaran === 'qris'
                        ? '📱 QRIS'
                        : item.metode_pembayaran === 'cash' || item.metode_pembayaran === 'tunai'
                        ? '💵 Tunai'
                        : '🏦 Transfer Bank'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-green-600">
                    {formatCurrency(item.jumlah)}
                  </td>
                  {/*  KOLOM KODE UNIK */}
                  <td className="px-6 py-4 text-sm text-center">
                    {item.kode_unik ? (
                      <span className="px-2 py-1 text-xs font-mono font-medium bg-yellow-100 text-yellow-800 rounded">
                        +{item.kode_unik}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {item.bukti_transfer ? (
                      <button
                        onClick={() => onOpenBukti(item.bukti_transfer)}
                        className="text-blue-600 hover:text-blue-900 text-sm bg-blue-50 px-2 py-1 rounded"
                      >
                        Lihat Bukti
                      </button>
                    ) : (
                      <span className="text-gray-400 text-sm">Tidak ada</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-green-600 text-sm font-medium">✓ Approved</span>
                  </td>
                </tr>
              ))}

              {/* Data Kas Manual */}
              {kasData
                .filter((item) => item.jenis === "masuk")
                .map((item) => (
                  <tr key={`kas-${item.id}`}>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(item.tanggal).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">
                        ✏️ {formatKategori(item.kategori)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.nama_donatur || item.nama || item.nama_pemberi || 'Hamba Allah'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.keterangan || item.deskripsi || item.description || 'Tidak ada deskripsi'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">
                        ✏️ Input Manual
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-green-600">
                      {formatCurrency(item.jumlah)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-400 text-sm">Manual</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onEdit(item)}
                          className="text-blue-600 hover:text-blue-900 text-sm"
                        >
                          Edit
                        </button>
                        <span className="text-gray-500">|</span>
                        <button
                          onClick={() => onDelete(item.id)}
                          className="text-red-600 hover:text-red-900 text-sm"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View - Update juga untuk mobile */}
      <div className="block sm:hidden space-y-4">
        {/* Data Zakat */}
        {zakatData.map((item) => (
          <div
            key={`zakat-mobile-${item.id}`}
            className="bg-white border rounded-lg p-4 shadow-sm"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="text-sm text-gray-500">
                {new Date(item.created_at).toLocaleDateString("id-ID")}
              </div>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                ✓ Approved
              </span>
            </div>
            <div className="text-sm font-medium text-gray-900 mb-1">
              Zakat {item.jenis_zakat}
            </div>
            <div className="text-sm text-gray-600 mb-1">
              <span className="font-medium">Nama:</span> {item.nama}
            </div>
            <div className="flex justify-between items-center mb-2">
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  item.metode_pembayaran === "qris"
                    ? "bg-purple-100 text-purple-800"
                    : item.metode_pembayaran === "cash"
                    ? "bg-green-100 text-green-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {item.metode_pembayaran === "qris"
                  ? "📱 QRIS"
                  : item.metode_pembayaran === "cash"
                  ? "💵 Tunai"
                  : "🏦 Transfer"}
              </span>
              <div className="text-lg font-medium text-green-600">
                {formatCurrency(item.jumlah)}
              </div>
            </div>
            <div className="flex justify-end">
              {item.bukti_transfer ? (
                <button
                  onClick={() => onOpenBukti(item.bukti_transfer)}
                  className="text-blue-600 hover:text-blue-900 text-sm bg-blue-50 px-2 py-1 rounded"
                >
                  Lihat Bukti
                </button>
              ) : (
                <span className="text-gray-400 text-sm">Tidak ada bukti</span>
              )}
            </div>
          </div>
        ))}

        {/* Data Infaq */}
        {infaqData.map((item) => (
          <div
            key={`infaq-mobile-${item.id}`}
            className="bg-white border rounded-lg p-4 shadow-sm"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="text-sm text-gray-500">
                {new Date(item.tanggal).toLocaleDateString("id-ID")}
              </div>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                ✓ Approved
              </span>
            </div>
            <div className="text-sm font-medium text-gray-900 mb-1">Infaq</div>
            {item.nama_pemberi && (
              <div className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Nama:</span> {item.nama_pemberi}
              </div>
            )}
            {item.keterangan && (
              <div className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Deskripsi:</span> {item.keterangan}
              </div>
            )}
            <div className="flex justify-between items-center mb-2">
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                📝 Form Online
              </span>
              <div className="text-lg font-medium text-green-600">
                {formatCurrency(item.jumlah)}
              </div>
            </div>
            <div className="flex justify-end">
              <span className="text-gray-400 text-sm">Tidak ada bukti</span>
            </div>
          </div>
        ))}

        {/* Donasi mobile */}
        {donasiData.map((item) => (
          <div
            key={`donasi-mobile-${item.id}`}
            className="bg-white border rounded-lg p-4 shadow-sm"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="text-sm text-gray-500">
                {new Date(item.tanggal || item.created_at).toLocaleDateString("id-ID")}
              </div>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                ✓ Approved
              </span>
            </div>
            <div className="text-sm font-medium text-gray-900 mb-1">
              💝 Donasi Program
            </div>
            <div className="text-sm text-gray-600 mb-1">
              <span className="font-medium">Donatur:</span> {item.nama_donatur || item.nama_pemberi || 'Hamba Allah'}
            </div>
            <div className="text-sm text-gray-600 mb-1">
              <span className="font-medium">Program:</span> {item.program_donasi || 'Program Donasi'}
            </div>
            {item.kode_unik && (
              <div className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Kode Unik:</span> 
                <span className="ml-1 px-2 py-1 text-xs font-mono font-medium bg-yellow-100 text-yellow-800 rounded">
                  +{item.kode_unik}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center mb-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                item.metode_pembayaran === 'qris'
                  ? 'bg-purple-100 text-purple-800'
                  : item.metode_pembayaran === 'cash' || item.metode_pembayaran === 'tunai'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {item.metode_pembayaran === 'qris'
                  ? '📱 QRIS'
                  : item.metode_pembayaran === 'cash' || item.metode_pembayaran === 'tunai'
                  ? '💵 Tunai'
                  : '🏦 Transfer Bank'}
              </span>
              <div className="text-lg font-medium text-green-600">
                {formatCurrency(item.jumlah)}
              </div>
            </div>
            <div className="flex justify-end">
              {item.bukti_transfer ? (
                <button
                  onClick={() => onOpenBukti(item.bukti_transfer)}
                  className="text-blue-600 hover:text-blue-900 text-sm bg-blue-50 px-2 py-1 rounded"
                >
                  Lihat Bukti
                </button>
              ) : (
                <span className="text-gray-400 text-sm">Tidak ada bukti</span>
              )}
            </div>
          </div>
        ))}

        {/* Data Kas Masuk (Manual) */}
      {kasData
        .filter((item) => item.jenis === "masuk")
        .map((item) => (
          <div
            key={`kas-mobile-${item.id}`}
            className="bg-white border rounded-lg p-4 shadow-sm"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="text-sm text-gray-500">
                {new Date(item.tanggal).toLocaleDateString("id-ID")}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => onEdit(item)}
                  className="text-blue-600 hover:text-blue-900 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  className="text-red-600 hover:text-red-900 text-sm"
                >
                  Hapus
                </button>
              </div>
            </div>
            <div className="text-sm font-medium text-gray-900 mb-1">
              {formatKategori(item.kategori)}
            </div>
            {/* Tambah nama donatur di mobile view juga */}
            {item.nama_donatur && (
              <div className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Nama:</span> {item.nama_donatur}
              </div>
            )}
            <div className="text-sm text-gray-600 mb-2">
              <span className="font-medium">Deskripsi:</span> {item.keterangan}
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">
                ✏️ Input Manual
              </span>
              <div className="text-lg font-medium text-green-600">
                {formatCurrency(item.jumlah)}
              </div>
            </div>
            <div className="flex justify-end">
              <span className="text-gray-400 text-sm">Manual</span>
            </div>
          </div>
      ))}
      </div>
    </div>
  );
};

export default KasPemasukan;