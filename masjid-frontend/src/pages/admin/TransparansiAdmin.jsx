import React, { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import api from '../../config/api';
import transparansiService from '../../services/transparansiService';
import { formatCurrency } from '../../components/kas-components/utils/formatters';

const emptyZakatForm = {
  jenis_zakat: 'fitrah',
  kategori_mustahik: '',
  nama_penerima: '',
  label_penerima_publik: '',
  nominal: '',
  tanggal_distribusi: '',
  deskripsi: '',
  bukti_foto: null
};

const emptyRealisasiForm = {
  programId: '',
  penerima_vendor: '',
  nominal: '',
  tanggal_realisasi: '',
  deskripsi: '',
  bukti_foto: null
};

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const buildFormData = (payload) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, value);
    }
  });
  return formData;
};

const StatusBadge = ({ status }) => {
  const className = {
    draft: 'bg-amber-50 text-amber-700 border-amber-200',
    approved: 'bg-green-50 text-green-700 border-green-200',
    rejected: 'bg-red-50 text-red-700 border-red-200'
  }[status] || 'bg-gray-50 text-gray-700 border-gray-200';

  return (
    <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold capitalize ${className}`}>
      {status || '-'}
    </span>
  );
};

const TransparansiAdmin = () => {
  const [activeTab, setActiveTab] = useState('zakat');
  const [zakatForm, setZakatForm] = useState(emptyZakatForm);
  const [realisasiForm, setRealisasiForm] = useState(emptyRealisasiForm);
  const [zakatReport, setZakatReport] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [programReport, setProgramReport] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState({
    zakat: false,
    program: false
  });
  const [actionLoading, setActionLoading] = useState({
    type: '',
    id: null,
    action: ''
  });

  const selectedProgramId = realisasiForm.programId || programs[0]?.id || '';
  const zakatItems = useMemo(() => zakatReport?.distributions || [], [zakatReport]);
  const realisasiItems = useMemo(() => programReport?.realisasi || [], [programReport]);

  const fetchData = async () => {
    try {
      setFetchLoading(true);
      const [zakat, programResponse] = await Promise.all([
        transparansiService.getZakat({ status: 'all' }),
        api.get('/pengadaan')
      ]);
      const programList = programResponse.data?.data?.programs || programResponse.data?.data || [];
      const normalizedPrograms = Array.isArray(programList) ? programList : [];
      setZakatReport(zakat);
      setPrograms(normalizedPrograms);

      const programId = selectedProgramId || normalizedPrograms[0]?.id;
      if (programId) {
        const report = await transparansiService.getProgram(programId, { status: 'all' });
        setProgramReport(report);
        setRealisasiForm((current) => ({
          ...current,
          programId: String(current.programId || programId)
        }));
      }
    } catch (err) {
      Swal.fire('Gagal', err.response?.data?.msg || 'Gagal memuat data transparansi', 'error');
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleProgramChange = async (programId) => {
    setRealisasiForm((current) => ({ ...current, programId }));
    if (!programId) return;

    try {
      setFetchLoading(true);
      const report = await transparansiService.getProgram(programId, { status: 'all' });
      setProgramReport(report);
    } catch (err) {
      Swal.fire('Gagal', err.response?.data?.msg || 'Gagal memuat transparansi program', 'error');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleCreateZakat = async (event) => {
    event.preventDefault();
    setSubmitLoading((prev) => ({ ...prev, zakat: true }));
    try {
      await transparansiService.createZakatDistribution(buildFormData(zakatForm));
      setZakatForm(emptyZakatForm);
      await fetchData();
      Swal.fire('Berhasil', 'Draft penyaluran zakat berhasil dibuat', 'success');
    } catch (err) {
      Swal.fire('Gagal', err.response?.data?.msg || err.response?.data?.error || 'Gagal membuat draft', 'error');
    } finally {
      setSubmitLoading((prev) => ({ ...prev, zakat: false }));
    }
  };

  const handleCreateRealisasi = async (event) => {
    event.preventDefault();
    setSubmitLoading((prev) => ({ ...prev, program: true }));
    try {
      const { programId, ...payload } = realisasiForm;
      await transparansiService.createProgramRealisasi(programId, buildFormData(payload));
      setRealisasiForm({ ...emptyRealisasiForm, programId });
      await handleProgramChange(programId);
      Swal.fire('Berhasil', 'Draft realisasi program berhasil dibuat', 'success');
    } catch (err) {
      Swal.fire('Gagal', err.response?.data?.msg || err.response?.data?.error || 'Gagal membuat draft', 'error');
    } finally {
      setSubmitLoading((prev) => ({ ...prev, program: false }));
    }
  };

  const approveItem = async (type, item) => {
    const result = await Swal.fire({
      title: 'Setujui data?',
      text: 'Data approved akan masuk kas keluar dan tampil di laporan publik.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Setujui',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#16a34a'
    });
    if (!result.isConfirmed) return;

    try {
      if (type === 'zakat') {
        await transparansiService.approveZakatDistribution(item.id);
        await fetchData();
      } else {
        await transparansiService.approveProgramRealisasi(item.id);
        await handleProgramChange(selectedProgramId);
      }
      Swal.fire('Berhasil', 'Data berhasil disetujui', 'success');
    } catch (err) {
      Swal.fire('Gagal', err.response?.data?.msg || err.response?.data?.error || 'Gagal approve data', 'error');
    }
  };

  const rejectItem = async (type, item) => {
    const result = await Swal.fire({
      title: 'Tolak data?',
      input: 'textarea',
      inputLabel: 'Alasan penolakan',
      inputPlaceholder: 'Tuliskan alasan penolakan',
      showCancelButton: true,
      confirmButtonText: 'Tolak',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#dc2626'
    });
    if (!result.isConfirmed) return;
    setActionLoading({type, id: item.id, action: 'reject'});

    try {
      if (type === 'zakat') {
        await transparansiService.rejectZakatDistribution(item.id, result.value);
        await fetchData();
      } else {
        await transparansiService.rejectProgramRealisasi(item.id, result.value);
        await handleProgramChange(selectedProgramId);
      }
      Swal.fire('Berhasil', 'Data berhasil ditolak', 'success');
    } catch (err) {
      Swal.fire('Gagal', err.response?.data?.msg || err.response?.data?.error || 'Gagal reject data', 'error');
    } finally {
      setActionLoading({type: '', id: null, action: ''});
    }
  };

  const isActionLoading = (type, item, action) => 
    actionLoading.type === type && 
    actionLoading.id === item.id &&
    actionLoading.action === action;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-green-700">Akuntabilitas</p>
        <h1 className="text-2xl font-bold text-gray-900">Transparansi Dana</h1>
        <p className="mt-1 text-sm text-gray-500">Kelola penyaluran zakat dan realisasi program sebelum tampil di laporan publik.</p>
      </div>

      <div className="flex flex-wrap gap-2 rounded-lg bg-white p-2 shadow-sm">
        {[
          ['zakat', 'Penyaluran Zakat'],
          ['program', 'Realisasi Program'],
          ['approval', 'Approval Transparansi']
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`rounded-md px-4 py-2 text-sm font-semibold ${activeTab === key ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'zakat' && (
        <section className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-gray-900">Buat Draft Penyaluran Zakat</h2>
          <form onSubmit={handleCreateZakat} className="grid gap-4 md:grid-cols-2">
            <select className="rounded-lg border px-3 py-2" value={zakatForm.jenis_zakat} onChange={(e) => setZakatForm({ ...zakatForm, jenis_zakat: e.target.value })}>
              <option value="fitrah">Zakat Fitrah</option>
              <option value="maal">Zakat Maal</option>
              <option value="profesi">Zakat Profesi</option>
            </select>
            <input className="rounded-lg border px-3 py-2" placeholder="Kategori mustahik" value={zakatForm.kategori_mustahik} onChange={(e) => setZakatForm({ ...zakatForm, kategori_mustahik: e.target.value })} required />
            <input className="rounded-lg border px-3 py-2" placeholder="Nama penerima internal (opsional)" value={zakatForm.nama_penerima} onChange={(e) => setZakatForm({ ...zakatForm, nama_penerima: e.target.value })} />
            <input className="rounded-lg border px-3 py-2" placeholder="Label publik, contoh: Mustahik 1" value={zakatForm.label_penerima_publik} onChange={(e) => setZakatForm({ ...zakatForm, label_penerima_publik: e.target.value })} required />
            <input className="rounded-lg border px-3 py-2" type="number" min="1" placeholder="Nominal" value={zakatForm.nominal} onChange={(e) => setZakatForm({ ...zakatForm, nominal: e.target.value })} required />
            <input className="rounded-lg border px-3 py-2" type="date" value={zakatForm.tanggal_distribusi} onChange={(e) => setZakatForm({ ...zakatForm, tanggal_distribusi: e.target.value })} required />
            <textarea className="rounded-lg border px-3 py-2 md:col-span-2" rows="3" placeholder="Deskripsi penyaluran" value={zakatForm.deskripsi} onChange={(e) => setZakatForm({ ...zakatForm, deskripsi: e.target.value })} required />
            <input className="rounded-lg border px-3 py-2 md:col-span-2" type="file" accept="image/*" onChange={(e) => setZakatForm({ ...zakatForm, bukti_foto: e.target.files?.[0] || null })} />
            <button className="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700 md:col-span-2" disabled={submitLoading.zakat}>
              {submitLoading.zakat ? 'Menyimpan...' : 'Simpan Draft Penyaluran'}
            </button>
          </form>
        </section>
      )}

      {activeTab === 'program' && (
        <section className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-gray-900">Buat Draft Realisasi Program</h2>
          <form onSubmit={handleCreateRealisasi} className="grid gap-4 md:grid-cols-2">
            <select className="rounded-lg border px-3 py-2 md:col-span-2" value={selectedProgramId} onChange={(e) => handleProgramChange(e.target.value)} required>
              {programs.map((program) => (
                <option key={program.id} value={program.id}>{program.nama_barang}</option>
              ))}
            </select>
            <input className="rounded-lg border px-3 py-2" placeholder="Vendor / penerima" value={realisasiForm.penerima_vendor} onChange={(e) => setRealisasiForm({ ...realisasiForm, penerima_vendor: e.target.value })} required />
            <input className="rounded-lg border px-3 py-2" type="number" min="1" placeholder="Nominal" value={realisasiForm.nominal} onChange={(e) => setRealisasiForm({ ...realisasiForm, nominal: e.target.value })} required />
            <input className="rounded-lg border px-3 py-2" type="date" value={realisasiForm.tanggal_realisasi} onChange={(e) => setRealisasiForm({ ...realisasiForm, tanggal_realisasi: e.target.value })} required />
            <input className="rounded-lg border px-3 py-2" type="file" accept="image/*" onChange={(e) => setRealisasiForm({ ...realisasiForm, bukti_foto: e.target.files?.[0] || null })} />
            <textarea className="rounded-lg border px-3 py-2 md:col-span-2" rows="3" placeholder="Deskripsi realisasi" value={realisasiForm.deskripsi} onChange={(e) => setRealisasiForm({ ...realisasiForm, deskripsi: e.target.value })} required />
            <button className="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700 md:col-span-2" disabled={submitLoading.program}>
              {submitLoading.program ? 'Menyimpan...' : 'Simpan Draft Realisasi'}
            </button>
          </form>

          {programReport?.summary && (
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <div className="rounded-lg bg-green-50 p-4 text-green-700">
                <p className="text-sm">Dana Terkumpul</p>
                <p className="text-xl font-bold">{formatCurrency(programReport.summary.danaTerkumpul)}</p>
              </div>
              <div className="rounded-lg bg-blue-50 p-4 text-blue-700">
                <p className="text-sm">Direalisasikan</p>
                <p className="text-xl font-bold">{formatCurrency(programReport.summary.totalRealisasi)}</p>
              </div>
              <div className="rounded-lg bg-amber-50 p-4 text-amber-700">
                <p className="text-sm">Sisa Dana</p>
                <p className="text-xl font-bold">{formatCurrency(programReport.summary.sisaDana)}</p>
              </div>
            </div>
          )}
        </section>
      )}

      {activeTab === 'approval' && (
        <section className="space-y-6">
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Approval Penyaluran Zakat</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">Tanggal</th>
                    <th className="px-4 py-3 text-left">Penerima</th>
                    <th className="px-4 py-3 text-right">Nominal</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {zakatItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3">{formatDate(item.tanggal_distribusi)}</td>
                      <td className="px-4 py-3">{item.label_penerima_publik}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(item.nominal)}</td>
                      <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                      <td className="px-4 py-3 text-right">
                        {item.status === 'draft' ? (
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => approveItem('zakat', item)} 
                              className="rounded border border-green-600 px-3 py-1 text-green-700"
                              disabled={isActionLoading('zakat', item, 'approve')}
                            >
                              {isActionLoading('zakat', item, 'approve') ? 'Menyetujui...' : 'Approve'}
                            </button>
                            <button 
                              onClick={() => rejectItem('zakat', item)} 
                              className="rounded border border-red-600 px-3 py-1 text-red-700"
                              disabled={isActionLoading('zakat', item, 'reject')}
                            >
                              {isActionLoading('zakat', item, 'reject') ? 'Menolak...' : 'Reject'}
                            </button>
                          </div>
                        ) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-gray-900">Approval Realisasi Program</h2>
              <select className="rounded-lg border px-3 py-2 text-sm" value={selectedProgramId} disabled={fetchLoading} onChange={(e) => handleProgramChange(e.target.value)}>
                {programs.map((program) => (
                  <option key={program.id} value={program.id}>{program.nama_barang}</option>
                ))}
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">Tanggal</th>
                    <th className="px-4 py-3 text-left">Vendor/Penerima</th>
                    <th className="px-4 py-3 text-right">Nominal</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {realisasiItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3">{formatDate(item.tanggal_realisasi)}</td>
                      <td className="px-4 py-3">{item.penerima_vendor}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(item.nominal)}</td>
                      <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                      <td className="px-4 py-3 text-right">
                        {item.status === 'draft' ? (
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => approveItem('program', item)} 
                              className="rounded border border-green-600 px-3 py-1 text-green-700"
                              disabled={isActionLoading('program', item, 'approve')}
                            >
                              {isActionLoading('program', item, 'approve') ? 'Menyetujui...' : 'Approve'}
                            </button>
                            <button 
                              onClick={() => rejectItem('program', item)} 
                              className="rounded border border-red-600 px-3 py-1 text-red-700"
                              disabled={isActionLoading('program', item, 'reject')}
                            >
                              {isActionLoading('program', item, 'reject') ? 'Menolak...' : 'Reject'}
                            </button>
                          </div>
                        ) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default TransparansiAdmin;
