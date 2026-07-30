import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '@/components/navigation/Navbar';
import Footer from '@/components/navigation/Footer';
import api from '@/config/api';
import transparansiService from '@/services/transparansiService';
import { formatCurrency } from '@/utils/formatters';
import { Button } from "@/components/ui/button";

const INK = '#1c2620';
const INK_SOFT = '#5c6b5f';
const PAPER = '#f3efe4';
const GREEN = '#1f4d3a';
const GREEN_SOFT = '#e8ede8';

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const StatCard = ({ label, value, tone = 'default' }) => {
  const isAccent = tone === 'accent';

  return (
    <div
      style={{
        borderColor: INK,
        backgroundColor: isAccent ? GREEN : 'transparent'
      }}
      className="border p-4"
    >
      <p style={{ color: isAccent ? GREEN_SOFT : INK_SOFT }} className="text-sm font-medium">{label}</p>
      <p style={{ color: isAccent ? PAPER : INK }} className="mt-2 text-2xl font-semibold">{formatCurrency(value || 0)}</p>
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
    <div style={{ backgroundColor: PAPER }} className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p style={{ color: GREEN }} className="text-[11px] font-medium uppercase tracking-[0.14em]">Transparansi Dana</p>
          <h1 style={{ color: INK }} className="mt-2 text-3xl font-semibold md:text-4xl">Laporan Amanah Umat</h1>
          <p style={{ color: INK_SOFT }} className="mt-3 max-w-3xl text-sm">
            Pantau dana zakat dan program pengadaan: berapa yang terkumpul, berapa yang sudah disalurkan, dan bukti realisasi yang sudah disetujui pengurus.
          </p>
        </div>

        {error && (
          <div style={{ borderColor: INK, backgroundColor: GREEN_SOFT, color: INK }} className="mb-6 border p-4 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ borderColor: INK, color: INK_SOFT }} className="border p-8 text-center text-sm">Memuat laporan transparansi...</div>
        ) : (
          <div className="space-y-10">
            <section style={{ borderColor: INK, backgroundColor: PAPER }} className="border p-6">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 style={{ color: INK }} className="text-xl font-semibold">Transparansi Zakat</h2>
                  <p style={{ color: INK_SOFT }} className="text-sm">Ringkasan zakat masuk dan penyaluran yang sudah disetujui.</p>
                </div>
                <Button
                  onClick={handleDownloadZakat}
                  style={{ backgroundColor: GREEN, borderColor: INK, color: PAPER }}
                  className="border px-4 py-2 text-sm font-medium rounded-none hover:opacity-90 transition-opacity"
                  disabled={downloadLoading.zakat}
                >
                  {downloadLoading.zakat ? 'Mengunduh...' : 'Download PDF Zakat'}
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <StatCard label="Zakat Terkumpul" value={zakatData?.summary?.totalTerkumpul} tone="accent" />
                <StatCard label="Tersalurkan" value={zakatData?.summary?.totalTersalurkan} />
                <StatCard label="Sisa Amanah" value={zakatData?.summary?.sisaAmanah} />
              </div>

              <div style={{ borderColor: INK }} className="mt-6 overflow-hidden border">
                <table className="min-w-full text-sm">
                  <thead style={{ backgroundColor: GREEN_SOFT, borderColor: INK }} className="border-b">
                    <tr>
                      <th style={{ color: INK }} className="px-4 py-3 text-left font-medium">Tanggal</th>
                      <th style={{ color: INK }} className="px-4 py-3 text-left font-medium">Penerima Publik</th>
                      <th style={{ color: INK }} className="px-4 py-3 text-left font-medium">Jenis</th>
                      <th style={{ color: INK }} className="px-4 py-3 text-right font-medium">Nominal</th>
                      <th style={{ color: INK }} className="px-4 py-3 text-left font-medium">Bukti</th>
                    </tr>
                  </thead>
                  <tbody>
                    {zakatRows.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ color: INK_SOFT }} className="px-4 py-6 text-center">Belum ada penyaluran zakat approved.</td>
                      </tr>
                    ) : zakatRows.map((item, i) => (
                      <tr key={item.id} style={{ borderColor: i > 0 ? INK : 'transparent', borderTopWidth: i > 0 ? '1px' : 0, borderStyle: 'dashed' }}>
                        <td style={{ color: INK_SOFT }} className="px-4 py-3">{formatDate(item.tanggal_distribusi)}</td>
                        <td className="px-4 py-3">
                          <p style={{ color: INK }} className="font-medium">{item.label_penerima_publik}</p>
                          <p style={{ color: INK_SOFT }} className="text-xs">{item.deskripsi}</p>
                        </td>
                        <td style={{ color: INK_SOFT }} className="px-4 py-3 capitalize">{item.jenis_zakat}</td>
                        <td style={{ color: INK }} className="px-4 py-3 text-right font-medium">{formatCurrency(item.nominal)}</td>
                        <td className="px-4 py-3">
                          {item.bukti_foto ? (
                            <a style={{ color: GREEN }} className="hover:underline" href={item.bukti_foto} target="_blank" rel="noreferrer">Lihat bukti</a>
                          ) : <span style={{ color: INK_SOFT }}>-</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section style={{ borderColor: INK, backgroundColor: PAPER }} className="border p-6">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 style={{ color: INK }} className="text-xl font-semibold">Transparansi Program Pengadaan</h2>
                  <p style={{ color: INK_SOFT }} className="text-sm">Pilih program untuk melihat realisasi dana dan sisa dana program.</p>
                </div>
                <select
                  value={selectedProgramId}
                  onChange={(event) => setSelectedProgramId(event.target.value)}
                  style={{ borderColor: INK, color: INK, backgroundColor: 'transparent' }}
                  className="border px-3 py-2 text-sm rounded-none focus:outline-none focus:ring-1"
                >
                  {programs.map((program) => (
                    <option key={program.id} value={program.id}>{program.nama_barang}</option>
                  ))}
                </select>
              </div>

              {programLoading ? (
                <div style={{ color: INK_SOFT }} className="py-8 text-center text-sm">Memuat laporan program...</div>
              ) : programData ? (
                <>
                  <div className="mb-4 flex items-center justify-between">
                    <h3 style={{ color: INK }} className="font-semibold">{programData.program?.nama_barang}</h3>
                    <Button
                      onClick={handleDownloadProgramPdf}
                      style={{ borderColor: INK, color: GREEN }}
                      className="border bg-transparent px-4 py-2 text-sm font-medium rounded-none hover:bg-(--green-soft) transition-colors"
                      disabled={downloadLoading.program}
                    >
                      {downloadLoading.program ? 'Mengunduh...' : 'Download PDF Program'}
                    </Button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-4">
                    <StatCard label="Dana Terkumpul" value={programData.summary?.danaTerkumpul} tone="accent" />
                    <StatCard label="Dana Dipakai" value={programData.summary?.totalRealisasi} />
                    <StatCard label="Sisa Dana" value={programData.summary?.sisaDana} />
                    <StatCard label="Target" value={programData.summary?.targetDana} />
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {programRows.length === 0 ? (
                      <div style={{ borderColor: INK, color: INK_SOFT }} className="border border-dashed p-6 text-center text-sm md:col-span-2">
                        Belum ada realisasi approved untuk program ini.
                      </div>
                    ) : programRows.map((item) => (
                      <div key={item.id} style={{ borderColor: INK }} className="border p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p style={{ color: INK }} className="font-semibold">{item.penerima_vendor}</p>
                            <p style={{ color: INK_SOFT }} className="text-sm">{formatDate(item.tanggal_realisasi)}</p>
                          </div>
                          <p style={{ color: GREEN }} className="font-semibold">{formatCurrency(item.nominal)}</p>
                        </div>
                        <p style={{ color: INK_SOFT }} className="mt-3 text-sm">{item.deskripsi}</p>
                        {item.bukti_foto && (
                          <a style={{ color: GREEN }} className="mt-3 inline-block text-sm font-medium hover:underline" href={item.bukti_foto} target="_blank" rel="noreferrer">
                            Lihat bukti realisasi
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ color: INK_SOFT }} className="py-8 text-center text-sm">Pilih program untuk melihat laporan.</div>
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