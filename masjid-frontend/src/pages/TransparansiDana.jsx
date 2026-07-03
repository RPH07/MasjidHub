import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/nav';
import Footer from '../components/footer';
import api from '../config/api';
import transparansiService from '../services/transparansiService';
import { formatCurrency } from '../components/kas-components/utils/formatters';

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const StatCard = ({ label, value, tone = 'green' }) => {
  const tones = {
    green: 'bg-green-50 text-green-700 border-green-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    red: 'bg-red-50 text-red-700 border-red-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100'
  };

  return (
    <div className={`rounded-lg border p-4 ${tones[tone] || tones.green}`}>
      <p className="text-sm font-medium opacity-80">{label}</p>
      <p className="mt-2 text-2xl font-bold">{formatCurrency(value || 0)}</p>
    </div>
  );
};

const TransparansiDana = () => {
  const [zakatData, setZakatData] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [selectedProgramId, setSelectedProgramId] = useState('');
  const [programData, setProgramData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [programLoading, setProgramLoading] = useState(false);
  const [error, setError] = useState('');
  const [downloadLoading, setDownloadLoading] = useState({
    zakat: false,
    program: false
  });

  const handleDownloadZakat = async() => {
    try {
      setDownloadLoading((prev) => ({...prev, zakat: true}));
      await transparansiService.downloadZakatPdf();
    } catch (error) {
      setError(error.response?.data?.msg || 'Gagal mengunduh laporan zakat');
    } finally {
      setDownloadLoading((prev) => ({...prev, zakat: false}));
    }
  };

  const handleDownloadProgramPdf = async() => {
    try {
      setDownloadLoading((prev) => ({...prev, program: true}));
      await transparansiService.downloadProgramPdf(selectedProgramId);
    } catch (error) {
      setError(error.response?.data?.msg || 'Gagal mengunduh laporan program');
    } finally {
      setDownloadLoading((prev) => ({...prev, program: false}));
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [zakat, programResponse] = await Promise.all([
          transparansiService.getZakat(),
          api.get('/pengadaan', { params: { status: 'aktif' } })
        ]);
        const programList = programResponse.data?.data?.programs || programResponse.data?.data || [];
        setZakatData(zakat);
        setPrograms(Array.isArray(programList) ? programList : []);
        if (Array.isArray(programList) && programList[0]?.id) {
          setSelectedProgramId(String(programList[0].id));
        }
      } catch (err) {
        setError(err.response?.data?.msg || 'Gagal memuat data transparansi');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!selectedProgramId) return;

    const fetchProgramTransparency = async () => {
      try {
        setProgramLoading(true);
        const data = await transparansiService.getProgram(selectedProgramId);
        setProgramData(data);
      } catch (err) {
        setError(err.response?.data?.msg || 'Gagal memuat data program');
        setProgramData(null);
      } finally {
        setProgramLoading(false);
      }
    };

    fetchProgramTransparency();
  }, [selectedProgramId]);

  const zakatRows = useMemo(() => zakatData?.distributions || [], [zakatData]);
  const programRows = useMemo(() => programData?.realisasi || [], [programData]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-green-700">Transparansi Dana</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900 md:text-4xl">Laporan Amanah Umat</h1>
          <p className="mt-3 max-w-3xl text-gray-600">
            Pantau dana zakat dan program pengadaan: berapa yang terkumpul, berapa yang sudah disalurkan, dan bukti realisasi yang sudah disetujui pengurus.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-lg bg-white p-8 text-center text-gray-500 shadow-sm">Memuat laporan transparansi...</div>
        ) : (
          <div className="space-y-10">
            <section className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Transparansi Zakat</h2>
                  <p className="text-sm text-gray-500">Ringkasan zakat masuk dan penyaluran yang sudah disetujui.</p>
                </div>
                <button
                  onClick={handleDownloadZakat}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                  disabled={downloadLoading.zakat}
                >
                  {downloadLoading.zakat ? 'Mengunduh...' : 'Download PDF Zakat'}
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <StatCard label="Zakat Terkumpul" value={zakatData?.summary?.totalTerkumpul} />
                <StatCard label="Tersalurkan" value={zakatData?.summary?.totalTersalurkan} tone="blue" />
                <StatCard label="Sisa Amanah" value={zakatData?.summary?.sisaAmanah} tone="amber" />
              </div>

              <div className="mt-6 overflow-hidden rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Tanggal</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Penerima Publik</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Jenis</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-700">Nominal</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Bukti</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {zakatRows.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-4 py-6 text-center text-gray-500">Belum ada penyaluran zakat approved.</td>
                      </tr>
                    ) : zakatRows.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3 text-gray-600">{formatDate(item.tanggal_distribusi)}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{item.label_penerima_publik}</p>
                          <p className="text-xs text-gray-500">{item.deskripsi}</p>
                        </td>
                        <td className="px-4 py-3 capitalize text-gray-600">{item.jenis_zakat}</td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatCurrency(item.nominal)}</td>
                        <td className="px-4 py-3">
                          {item.bukti_foto ? (
                            <a className="text-green-700 hover:underline" href={item.bukti_foto} target="_blank" rel="noreferrer">Lihat bukti</a>
                          ) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Transparansi Program Pengadaan</h2>
                  <p className="text-sm text-gray-500">Pilih program untuk melihat realisasi dana dan sisa dana program.</p>
                </div>
                <select
                  value={selectedProgramId}
                  onChange={(event) => setSelectedProgramId(event.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  {programs.map((program) => (
                    <option key={program.id} value={program.id}>{program.nama_barang}</option>
                  ))}
                </select>
              </div>

              {programLoading ? (
                <div className="py-8 text-center text-gray-500">Memuat laporan program...</div>
              ) : programData ? (
                <>
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">{programData.program?.nama_barang}</h3>
                    <button
                      onClick={handleDownloadProgramPdf}
                      className="rounded-lg border border-green-600 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-50"
                      disabled={downloadLoading.program}
                    >
                      {downloadLoading.program ? 'Mengunduh...' : 'Download PDF Program'}
                    </button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-4">
                    <StatCard label="Dana Terkumpul" value={programData.summary?.danaTerkumpul} />
                    <StatCard label="Dana Dipakai" value={programData.summary?.totalRealisasi} tone="blue" />
                    <StatCard label="Sisa Dana" value={programData.summary?.sisaDana} tone="amber" />
                    <StatCard label="Target" value={programData.summary?.targetDana} tone="green" />
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {programRows.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-gray-500 md:col-span-2">
                        Belum ada realisasi approved untuk program ini.
                      </div>
                    ) : programRows.map((item) => (
                      <div key={item.id} className="rounded-lg border border-gray-200 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-gray-900">{item.penerima_vendor}</p>
                            <p className="text-sm text-gray-500">{formatDate(item.tanggal_realisasi)}</p>
                          </div>
                          <p className="font-bold text-green-700">{formatCurrency(item.nominal)}</p>
                        </div>
                        <p className="mt-3 text-sm text-gray-600">{item.deskripsi}</p>
                        {item.bukti_foto && (
                          <a className="mt-3 inline-block text-sm font-medium text-green-700 hover:underline" href={item.bukti_foto} target="_blank" rel="noreferrer">
                            Lihat bukti realisasi
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="py-8 text-center text-gray-500">Pilih program untuk melihat laporan.</div>
              )}
            </section>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default TransparansiDana;
