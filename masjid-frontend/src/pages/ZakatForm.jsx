import React, { useEffect, useMemo, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Briefcase,
  Check,
  CheckCircle2,
  Coins,
  CreditCard,
  Landmark,
  Loader2,
  Minus,
  Moon,
  Plus,
  QrCode,
  ReceiptText,
  RefreshCcw,
  UploadCloud,
  User,
  Wallet
} from 'lucide-react';
import { FloatingInput } from '@/components/form';
import { useAuth } from '@/hooks/useAuth';
import api from '@/config/api';
import Navbar from '@/components/navigation/Navbar';
import { formatCurrency } from '@/utils/formatters';

const INITIAL_COUNTS = { istri: 0, anak: 0, lain: 0 };

const DEFAULT_ZAKAT_SETTINGS = {
  label: 'BAZNAS RI 2026',
  sumber: 'BAZNAS RI',
  fitrah_uang: 50000,
  fitrah_beras_kg: 2.5,
  fitrah_beras_liter: 3.5,
  nisab_maal: 91681728,
  nisab_penghasilan_bulanan: 7640144,
  nisab_penghasilan_tahunan: 91681728,
  kadar_zakat: 0.025
};

const STEPS = [
  { number: 1, label: 'Jenis' },
  { number: 2, label: 'Data Diri' },
  { number: 3, label: 'Hitung' },
  { number: 4, label: 'Konfirmasi' },
  { number: 5, label: 'Selesai' }
];

const ZAKAT_TYPES = [
  {
    value: 'fitrah',
    label: 'Zakat Fitrah',
    Icon: Moon,
    description: 'Zakat wajib untuk setiap Muslim menjelang Idul Fitri'
  },
  {
    value: 'maal',
    label: 'Zakat Maal',
    Icon: Coins,
    description: 'Zakat atas harta yang telah mencapai nisab dan haul'
  },
  {
    value: 'profesi',
    label: 'Zakat Profesi',
    Icon: Briefcase,
    description: 'Zakat atas penghasilan atau gaji bulanan'
  }
];

const PAYMENT_METHODS = [
  {
    value: 'tunai',
    label: 'Tunai',
    Icon: Banknote,
    description: 'Bayar langsung ke panitia masjid'
  },
  {
    value: 'transfer_bank',
    label: 'Transfer Bank',
    Icon: Landmark,
    description: 'Transfer ke rekening resmi masjid'
  },
  {
    value: 'qris',
    label: 'QRIS',
    Icon: QrCode,
    description: 'Bayar menggunakan QRIS'
  }
];

const createInitialForm = (user) => ({
  jenisZakat: '',
  nama: user?.nama || '',
  email: user?.email || '',
  no_telepon: user?.no_telepon || user?.no_hp || user?.phone || '',
  jumlah_jiwa: 1,
  total_harta: '',
  gaji_kotor: '',
  metodePembayaran: '',
  bukti: null
});

const getTotalJiwa = (counts) => 1 + counts.istri + counts.anak + counts.lain;

const sanitizeNumber = (value) => String(value || '').replace(/[^\d]/g, '');

const parseAmount = (value) => Number(sanitizeNumber(value) || 0);

const SectionTitle = ({ title, description }) => (
  <div className="text-center">
    <h2 className="font-serif text-2xl font-bold text-[#1B4332]">{title}</h2>
    <p className="mt-1 text-sm leading-6 text-gray-500">{description}</p>
  </div>
);

const Field = ({ label, hint, children }) => (
  <div className="space-y-2">
    <label className="text-xs font-semibold uppercase tracking-wide text-[#1B4332]">
      {label}
    </label>
    {children}
    {hint && <p className="text-xs leading-5 text-gray-500">{hint}</p>}
  </div>
);

const SummaryRow = ({ label, value, total = false }) => (
  <div
    className={`flex items-center justify-between gap-4 px-4 py-3 ${
      total ? 'text-[#1B4332]' : 'text-gray-600'
    }`}
  >
    <span className={total ? 'text-sm font-semibold' : 'text-sm'}>{label}</span>
    <span className={total ? 'text-base font-bold' : 'text-right text-sm font-medium text-gray-900'}>
      {value}
    </span>
  </div>
);

const CounterRow = ({ label, hint, value, onDecrease, onIncrease, readonly = false }) => (
  <div className="flex items-center justify-between rounded-xl border border-[#EDE6D6] px-4 py-3">
    <div>
      <div className="text-sm font-medium text-gray-900">{label}</div>
      <div className="text-xs text-gray-500">{hint}</div>
    </div>

    {readonly ? (
      <div className="min-w-8 text-center text-lg font-semibold text-[#1B4332]">{value}</div>
    ) : (
      <div className="flex items-center gap-3">
        <Button
          type="button"
          onClick={onDecrease}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#EDE6D6] text-[#2D6A4F] hover:border-[#1B4332] hover:bg-[#1B4332] hover:text-white"
          aria-label={`Kurangi ${label}`}
        >
          <Minus className="h-4 w-4" aria-hidden="true" />
        </Button>
        <div className="min-w-6 text-center text-lg font-semibold text-[#1B4332]">{value}</div>
        <Button
          type="button"
          onClick={onIncrease}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#EDE6D6] text-[#2D6A4F] hover:border-[#1B4332] hover:bg-[#1B4332] hover:text-white"
          aria-label={`Tambah ${label}`}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    )}
  </div>
);

const ZakatForm = () => {
  const { user } = useAuth();
  const location = useLocation();
  const showPublicNavbar = location.pathname === '/zakat';

  // State inti form dibuat kecil: step, data form, tanggungan fitrah, pembayaran, dan sukses.
  const [currentStep, setCurrentStep] = useState(1);
  const [counts, setCounts] = useState(INITIAL_COUNTS);
  const [formData, setFormData] = useState(() => createInitialForm(user));
  const [zakatSettings, setZakatSettings] = useState(DEFAULT_ZAKAT_SETTINGS);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [successInfo, setSuccessInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const totalJiwa = getTotalJiwa(counts);
  const selectedPayment = PAYMENT_METHODS.find((item) => item.value === formData.metodePembayaran);

  // Nominal selalu dihitung dari state terbaru, jadi tidak perlu disimpan terpisah.
  const nominalZakat = useMemo(() => {
    if (formData.jenisZakat === 'fitrah') {
      return totalJiwa * zakatSettings.fitrah_uang;
    }

    if (formData.jenisZakat === 'maal') {
      const totalHarta = parseAmount(formData.total_harta);
      return totalHarta >= zakatSettings.nisab_maal
        ? Math.round(totalHarta * zakatSettings.kadar_zakat)
        : 0;
    }

    if (formData.jenisZakat === 'profesi') {
      const gajiKotor = parseAmount(formData.gaji_kotor);
      return gajiKotor >= zakatSettings.nisab_penghasilan_bulanan
        ? Math.round(gajiKotor * zakatSettings.kadar_zakat)
        : 0;
    }

    return 0;
  }, [formData.gaji_kotor, formData.jenisZakat, formData.total_harta, totalJiwa, zakatSettings]);

  // Setting aktif diambil dari backend supaya angka zakat bisa diubah dari dashboard admin.
  useEffect(() => {
    let mounted = true;

    const fetchActiveSetting = async () => {
      try {
        const response = await api.get('/zakat-settings/active');
        const activeSetting = response.data?.data;

        if (mounted && activeSetting) {
          setZakatSettings({
            ...DEFAULT_ZAKAT_SETTINGS,
            ...activeSetting
          });
        }
      } catch (error) {
        console.error('Gagal mengambil setting zakat aktif:', error);
      }
    };

    fetchActiveSetting();

    return () => {
      mounted = false;
    };
  }, []);

  // Autofill data user login. Field yang sudah diketik manual tidak ditimpa.
  useEffect(() => {
    if (!user) return;

    setFormData((prev) => ({
      ...prev,
      nama: prev.nama || user.nama || '',
      email: prev.email || user.email || '',
      no_telepon: prev.no_telepon || user.no_telepon || user.no_hp || user.phone || ''
    }));
  }, [user]);

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const resetGeneratedPayment = () => {
    setPaymentInfo(null);
    setSuccessInfo(null);
  };

  // Kalau user mengubah data yang memengaruhi pembayaran, kode unik lama harus dibuang.
  const updateFormField = (name, value, shouldResetPayment = true) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(shouldResetPayment ? { bukti: null } : {})
    }));

    if (shouldResetPayment) {
      resetGeneratedPayment();
    }
  };

  const handleChange = (event) => {
    const { name, value, files } = event.target;

    if (name === 'bukti') {
      updateFormField('bukti', files?.[0] || null, false);
      return;
    }

    updateFormField(name, value);
  };

  const selectZakat = (value) => {
    setCounts(INITIAL_COUNTS);
    setFormData((prev) => ({
      ...prev,
      jenisZakat: value,
      jumlah_jiwa: 1,
      total_harta: '',
      gaji_kotor: '',
      metodePembayaran: '',
      bukti: null
    }));
    resetGeneratedPayment();
  };

  const changeCount = (key, delta) => {
    setCounts((prev) => {
      const nextCounts = {
        ...prev,
        [key]: Math.max(0, prev[key] + delta)
      };

      setFormData((current) => ({
        ...current,
        jumlah_jiwa: getTotalJiwa(nextCounts),
        bukti: null
      }));

      return nextCounts;
    });

    resetGeneratedPayment();
  };

  const getZakatLabel = (value) => {
    return ZAKAT_TYPES.find((item) => item.value === value)?.label || '-';
  };

  const getPaymentLabel = (value) => {
    return PAYMENT_METHODS.find((item) => item.value === value)?.label || '-';
  };

  // Validasi dipisah per step supaya tombol bawah gampang dibaca.
  const isCurrentStepValid = () => {
    if (currentStep === 1) return Boolean(formData.jenisZakat);

    if (currentStep === 2) {
      return Boolean(
        formData.nama.trim() &&
        formData.email.trim() &&
        formData.no_telepon.trim()
      );
    }

    if (currentStep === 3) {
      if (formData.jenisZakat === 'fitrah') return totalJiwa > 0;
      if (formData.jenisZakat === 'maal') return Boolean(formData.total_harta) && nominalZakat > 0;
      if (formData.jenisZakat === 'profesi') return Boolean(formData.gaji_kotor) && nominalZakat > 0;
      return false;
    }

    if (currentStep === 4) {
      if (!formData.metodePembayaran || nominalZakat <= 0) return false;
      if (!paymentInfo) return true;
      if (formData.metodePembayaran === 'tunai') return true;
      return Boolean(formData.bukti);
    }

    return false;
  };

  const nextStep = () => {
    if (!isCurrentStepValid()) return;
    setCurrentStep((prev) => Math.min(prev + 1, 4));
    scrollToTop();
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    scrollToTop();
  };

  // Tahap pertama submit: backend membuat record zakat, kode unik, dan total bayar.
  const createZakatPaymentRequest = async () => {
    const createResponse = await api.post('/zakat', {
      nama: formData.nama,
      email: formData.email,
      no_telepon: formData.no_telepon,
      jenis_zakat: formData.jenisZakat,
      jumlah_jiwa: formData.jenisZakat === 'fitrah' ? totalJiwa : null,
      total_harta: sanitizeNumber(formData.total_harta) || null,
      gaji_kotor: sanitizeNumber(formData.gaji_kotor) || null,
      jumlah: nominalZakat,
      metode_pembayaran: formData.metodePembayaran
    });

    const zakat = createResponse.data?.data;
    const instruction = createResponse.data?.instruction || {};
    const kodeUnik = instruction.kode_unik ?? zakat?.kode_unik;
    const totalBayar = instruction.total_transfer ?? zakat?.total_bayar;

    const nextPaymentInfo = {
      zakat,
      kode_unik: kodeUnik,
      total_bayar: totalBayar,
      rekening_tujuan: instruction.rekening_tujuan || []
    };

    setPaymentInfo(nextPaymentInfo);

    toast.success(
      `Kode pembayaran dibuat. Total bayar ${formatCurrency(totalBayar)}.`,
      { duration: 7000 }
    );

    return nextPaymentInfo;
  };

  const resetForm = () => {
    setCounts(INITIAL_COUNTS);
    setFormData(createInitialForm(user));
    setPaymentInfo(null);
    setSuccessInfo(null);
    setCurrentStep(1);
    scrollToTop();
  };

  // Tahap kedua submit: setelah kode ada, upload bukti kalau perlu lalu tampilkan sukses.
  const handleSubmit = async () => {
    if (!isCurrentStepValid()) return;

    setIsLoading(true);

    try {
      if (!paymentInfo) {
        await createZakatPaymentRequest();
        return;
      }

      if (formData.metodePembayaran !== 'tunai' && !formData.bukti) {
        toast.error('Silakan upload bukti pembayaran terlebih dahulu.');
        return;
      }

      if (formData.bukti) {
        if (!paymentInfo?.zakat?.id) {
          toast.error('Data pembayaran tidak ditemukan. Buat kode pembayaran ulang.');
          return;
        }

        const buktiData = new FormData();
        buktiData.append('bukti', formData.bukti);

        await api.patch(`/zakat/${paymentInfo.zakat.id}/upload`, buktiData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      const nextSuccessInfo = {
        nama: formData.nama,
        jenisZakat: formData.jenisZakat,
        jumlahJiwa: formData.jenisZakat === 'fitrah' ? totalJiwa : null,
        nominal: nominalZakat,
        metodePembayaran: formData.metodePembayaran,
        kode_unik: paymentInfo.kode_unik,
        total_bayar: paymentInfo.total_bayar
      };

      setSuccessInfo(nextSuccessInfo);
      setCurrentStep(5);

      toast.success(
        formData.metodePembayaran === 'tunai'
          ? 'Data zakat tunai berhasil dibuat dan menunggu verifikasi DKM.'
          : 'Bukti pembayaran berhasil diupload. Zakat menunggu verifikasi DKM.',
        { duration: 7000 }
      );

      scrollToTop();
    } catch (err) {
      console.error('Network error:', err);
      toast.error(
        err.response?.data?.msg ||
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Terjadi kesalahan saat mengirim zakat.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const primaryLabel = currentStep < 4
    ? 'Lanjut'
    : isLoading
      ? 'Memproses...'
      : !paymentInfo
        ? 'Buat Kode Pembayaran'
        : formData.metodePembayaran === 'tunai'
          ? 'Selesaikan Zakat'
          : 'Upload Bukti Pembayaran';

  const bankList = paymentInfo?.rekening_tujuan || [];

  return (
    
    <main className={`min-h-screen bg-[#F5F0E8] px-0 pb-10 text-gray-900 md:px-6 lg:flex lg:items-center lg:px-8 ${showPublicNavbar ? 'pt-20 md:pt-24 lg:pt-28' : 'md:py-10'}`}>
      {showPublicNavbar && <Navbar />}
      <Toaster position="top-center" />

      <div className="mx-auto flex min-h-screen w-full max-w-105 flex-col overflow-hidden bg-white shadow-2xl md:min-h-0 md:rounded-2xl lg:grid lg:min-h-180 lg:max-w-6xl lg:grid-cols-[360px_minmax(0,1fr)] lg:grid-rows-[1fr_auto]">
        <header className="relative overflow-hidden bg-[#1B4332] px-6 pb-5 pt-7 lg:row-span-2 lg:flex lg:flex-col lg:justify-between lg:px-8 lg:py-8">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#C9A84C]/10" />
          <div className="absolute -left-6 bottom-2 h-24 w-24 rounded-full bg-[#52B788]/10" />

          <div className="relative">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#E8C96A]">
              Masjid Nur Ul-Ilmi
            </div>
            <h1 className="mt-1 font-serif text-[27px] font-bold leading-tight text-white">
              Pembayaran Zakat
            </h1>

            <div className="mt-6 flex items-start lg:mt-10">
              {STEPS.map((step, index) => {
                const isDone = currentStep > step.number;
                const isActive = currentStep === step.number;

                return (
                  <React.Fragment key={step.number}>
                    <div className="flex flex-1 flex-col items-center">
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-bold transition ${
                          isDone
                            ? 'border-[#C9A84C] bg-[#C9A84C] text-[#1B4332]'
                            : isActive
                              ? 'border-white bg-white text-[#1B4332]'
                              : 'border-white/25 bg-white/15 text-white/50'
                        }`}
                      >
                        {isDone ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : step.number}
                      </div>
                      <div
                        className={`mt-2 text-center text-[10px] font-medium leading-tight ${
                          isDone
                            ? 'text-[#E8C96A]'
                            : isActive
                              ? 'text-white'
                              : 'text-white/40'
                        }`}
                      >
                        {step.label}
                      </div>
                    </div>

                    {index < STEPS.length - 1 && (
                      <div
                        className={`mt-3 h-px w-4 shrink-0 ${
                          currentStep > step.number ? 'bg-[#C9A84C]' : 'bg-white/20'
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            <div className="mt-10 hidden rounded-2xl border border-white/10 bg-white/5 p-5 lg:block">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#E8C96A]">
                Alur Pembayaran
              </div>
              <p className="mt-3 text-sm leading-7 text-white/70">
                Isi data zakat, buat kode pembayaran dari sistem, lalu upload bukti transfer setelah total bayar muncul.
              </p>
            </div>
          </div>
        </header>

        <section className="flex-1 px-6 py-7 lg:min-h-0 lg:px-10 lg:py-8">
          {currentStep === 1 && (
            <div className="space-y-6">
              <SectionTitle
                title="Pilih Jenis Zakat"
                description="Pilih jenis zakat yang ingin Anda tunaikan."
              />

              <div className="space-y-3 lg:grid lg:grid-cols-3 lg:gap-3 lg:space-y-0">
                {ZAKAT_TYPES.map((zakatType) => {
                  const selected = formData.jenisZakat === zakatType.value;

                  return (
                    <Button
                      key={zakatType.value}
                      type="button"
                      onClick={() => selectZakat(zakatType.value)}
                      className={`flex w-full h-auto whitespace-normal items-center gap-4 rounded-xl border bg-white p-4 text-left transition lg:flex-col lg:items-start ${
                        selected
                          ? 'border-[#2D6A4F] border-l-4 bg-emerald-50'
                          : 'border-[#EDE6D6] hover:border-[#52B788] hover:bg-emerald-50/50'
                      }`}
                    >
                      <span
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                          selected ? 'bg-emerald-100 text-[#2D6A4F]' : 'bg-[#F5F0E8] text-[#1B4332]'
                        }`}
                      >
                        {React.createElement(zakatType.Icon, {
                          className: 'h-5 w-5',
                          'aria-hidden': true
                        })}
                      </span>
                      <span>
                        <span className={`block text-sm font-semibold ${selected ? 'text-[#2D6A4F]' : 'text-gray-900'}`}>
                          {zakatType.label}
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-gray-500">
                          {zakatType.description}
                        </span>
                      </span>
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <SectionTitle
                title="Data Muzakki"
                description="Data orang yang menunaikan zakat."
              />

              <div className="space-y-4 rounded-2xl bg-gray-50 p-4 lg:grid lg:grid-cols-3 lg:gap-4 lg:space-y-0">
                <FloatingInput
                  label="Nama Lengkap"
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  required
                  icon={<User className="h-5 w-5" aria-hidden="true" />}
                  labelBgClass="bg-gray-50"
                />

                <FloatingInput
                  label="Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  icon="@"
                  labelBgClass="bg-gray-50"
                />

                <FloatingInput
                  label="No. Telepon"
                  type="tel"
                  name="no_telepon"
                  value={formData.no_telepon}
                  onChange={handleChange}
                  required
                  icon="08"
                  labelBgClass="bg-gray-50"
                />
              </div>

              <p className="text-xs leading-5 text-gray-500">
                Kalau Anda login, nama dan email otomatis terisi dari akun. Nomor telepon tetap bisa Anda isi manual.
              </p>
            </div>
          )}

          {currentStep === 3 && (
              <div className="space-y-6">
              <SectionTitle
                title={formData.jenisZakat === 'fitrah' ? 'Jumlah Tanggungan' : 'Perhitungan Zakat'}
                description={
                  formData.jenisZakat === 'fitrah'
                    ? 'Zakat fitrah ditunaikan untuk setiap jiwa yang ditanggung.'
                    : 'Masukkan data dasar untuk menghitung nominal zakat.'
                }
              />

              {formData.jenisZakat === 'fitrah' && (
                <div className="space-y-4 lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start lg:gap-5 lg:space-y-0">
                  <Field label="Bentuk Pembayaran" hint="Sistem saat ini mencatat pembayaran zakat fitrah dalam nominal rupiah.">
                    <div className="flex items-center gap-3 rounded-xl border border-[#EDE6D6] px-4 py-3 text-sm">
                      <Wallet className="h-4 w-4 text-[#2D6A4F]" aria-hidden="true" />
                      <span>Uang ({formatCurrency(zakatSettings.fitrah_uang)} / jiwa)</span>
                    </div>
                  </Field>

                  <div className="space-y-3 lg:row-span-2">
                    <CounterRow label="Muzakki (Diri Sendiri)" hint="Wajib" value={1} readonly />
                    <CounterRow
                      label="Istri"
                      hint="Tanggungan"
                      value={counts.istri}
                      onDecrease={() => changeCount('istri', -1)}
                      onIncrease={() => changeCount('istri', 1)}
                    />
                    <CounterRow
                      label="Anak"
                      hint="Tanggungan"
                      value={counts.anak}
                      onDecrease={() => changeCount('anak', -1)}
                      onIncrease={() => changeCount('anak', 1)}
                    />
                    <CounterRow
                      label="Lainnya"
                      hint="Anggota keluarga lain"
                      value={counts.lain}
                      onDecrease={() => changeCount('lain', -1)}
                      onIncrease={() => changeCount('lain', 1)}
                    />
                  </div>
                </div>
              )}

              {formData.jenisZakat === 'maal' && (
                <div className="space-y-4 rounded-2xl bg-gray-50 p-4">
                  <FloatingInput
                    label="Total Harta"
                    type="currency"
                    name="total_harta"
                    value={formData.total_harta}
                    onChange={handleChange}
                    required
                    icon="Rp"
                    labelBgClass="bg-gray-50"
                  />

                  <p className="text-xs leading-5 text-gray-500">
                    Nisab saat ini: {formatCurrency(zakatSettings.nisab_maal)}.
                  </p>

                  {formData.total_harta && nominalZakat === 0 && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                      Harta belum mencapai nisab zakat maal.
                    </div>
                  )}
                </div>
              )}

              {formData.jenisZakat === 'profesi' && (
                <div className="space-y-4 rounded-2xl bg-gray-50 p-4">
                  <FloatingInput
                    label="Gaji Kotor Bulanan"
                    type="currency"
                    name="gaji_kotor"
                    value={formData.gaji_kotor}
                    onChange={handleChange}
                    required
                    icon="Rp"
                    labelBgClass="bg-gray-50"
                  />

                  <p className="text-xs leading-5 text-gray-500">
                    Nisab penghasilan bulanan: {formatCurrency(zakatSettings.nisab_penghasilan_bulanan)}.
                  </p>

                  {formData.gaji_kotor && nominalZakat === 0 && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                      Penghasilan bersih belum melewati acuan perhitungan zakat profesi.
                    </div>
                  )}
                </div>
              )}

              <div className="overflow-hidden rounded-xl bg-[#F5F0E8] lg:max-w-sm">
                {formData.jenisZakat === 'fitrah' && (
                  <>
                    <SummaryRow label="Total jiwa" value={`${totalJiwa} jiwa`} />
                    <SummaryRow label="Satuan" value={`${formatCurrency(zakatSettings.fitrah_uang)} / jiwa`} />
                  </>
                )}
                <div className="border-t border-[#EDE6D6]">
                  <SummaryRow label="Total Zakat" value={formatCurrency(nominalZakat)} total />
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-6 lg:space-y-0">
              {formData.jenisZakat === 'fitrah' ? (
                <div className="relative overflow-hidden rounded-2xl bg-[#1B4332] px-5 py-6 text-center">
                  <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[#C9A84C]/10" />
                  <div className="relative space-y-4">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#E8C96A]">
                      Niat Zakat Fitrah
                    </div>
                    <div className="font-serif text-xl leading-loose text-white" dir="rtl">
                      نَوَيْتُ أَنْ أُخْرِجَ زَكَاةَ الْفِطْرِ عَنْ نَفْسِي وَعَنْ جَمِيعِ مَا يَلْزَمُنِي نَفَقَتُهُمْ فَرْضًا لِلَّهِ تَعَالَى
                    </div>
                    <div className="mx-auto h-px w-10 bg-[#C9A84C]/40" />
                    <p className="font-serif text-sm italic leading-7 text-white/80">
                      Nawaitu an ukhrija zakatal fitri an nafsi wa an jami'i ma yalzamuni nafaqatuhum fardhan lillahi ta'ala
                    </p>
                    <p className="text-xs leading-6 text-white/60">
                      Saya niat mengeluarkan zakat fitrah untuk diri saya dan semua orang yang nafkahnya menjadi tanggungan saya, fardhu karena Allah Ta'ala.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl bg-[#1B4332] px-5 py-6 text-center">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#E8C96A]">
                    Konfirmasi Zakat
                  </div>
                  <p className="mt-3 text-sm leading-7 text-white/75">
                    Periksa kembali data zakat sebelum membuat kode pembayaran.
                  </p>
                </div>
              )}

              <div className="overflow-hidden rounded-xl border border-[#EDE6D6]">
                <div className="bg-[#F5F0E8] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#1B4332]">
                  Data Pembayaran
                </div>
                <div className="divide-y divide-[#F5F0E8]">
                  <SummaryRow label="Muzakki" value={formData.nama || '-'} />
                  <SummaryRow label="Jenis Zakat" value={getZakatLabel(formData.jenisZakat)} />
                  {formData.jenisZakat === 'fitrah' && (
                    <SummaryRow label="Jumlah Jiwa" value={`${totalJiwa} jiwa`} />
                  )}
                  <SummaryRow label="Total Zakat" value={formatCurrency(nominalZakat)} total />
                </div>
              </div>

              <Field label="Metode Pembayaran">
                <div className="space-y-2">
                  {PAYMENT_METHODS.map((paymentMethod) => {
                    const selected = formData.metodePembayaran === paymentMethod.value;

                    return (
                      <Button
                        key={paymentMethod.value}
                        type="button"
                        onClick={() => updateFormField('metodePembayaran', paymentMethod.value)}
                        className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                          selected
                            ? 'border-[#2D6A4F] border-l-4 bg-emerald-50'
                            : 'border-[#EDE6D6] hover:border-[#52B788]'
                        }`}
                      >
                        {React.createElement(paymentMethod.Icon, {
                          className: 'h-5 w-5 shrink-0 text-[#2D6A4F]',
                          'aria-hidden': true
                        })}
                        <span className="flex-1">
                          <span className="block text-sm font-medium text-gray-900">{paymentMethod.label}</span>
                          <span className="block text-xs text-gray-500">{paymentMethod.description}</span>
                        </span>
                        <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold text-[#2D6A4F]">
                          Tersedia
                        </span>
                      </Button>
                    );
                  })}
                </div>
              </Field>

              <div className={`rounded-xl border p-4 ${
                paymentInfo
                  ? 'border-emerald-200 bg-emerald-50'
                  : 'border-amber-200 bg-amber-50'
              }`}>
                {paymentInfo ? (
                  <div className="space-y-3 text-sm">
                    <SummaryRow label="Kode Unik" value={`+${paymentInfo.kode_unik}`} />
                    <SummaryRow label="Total Bayar" value={formatCurrency(paymentInfo.total_bayar)} total />
                    <p className="text-xs leading-5 text-emerald-800">
                      Bayar sesuai total di atas. Setelah itu upload bukti pembayaran.
                    </p>
                  </div>
                ) : (
                  <div className="flex gap-3 text-sm leading-6 text-amber-800">
                    <ReceiptText className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <p>
                      Klik tombol <strong>Buat Kode Pembayaran</strong> untuk membuat record zakat,
                      kode unik, dan total bayar dari backend.
                    </p>
                  </div>
                )}
              </div>

              {formData.metodePembayaran && (
                <div className="rounded-xl border border-[#EDE6D6] bg-[#F8F6F0] p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#1B4332]">
                    <CreditCard className="h-4 w-4" aria-hidden="true" />
                    Informasi {selectedPayment?.label}
                  </div>

                  {formData.metodePembayaran === 'transfer_bank' && (
                    <div className="space-y-3 text-sm">
                      {bankList.length > 0 ? (
                        bankList.map((bank) => (
                          <div key={`${bank.nama_bank}-${bank.no_rekening}`} className="rounded-lg bg-white">
                            <SummaryRow label="Bank" value={bank.nama_bank} />
                            <SummaryRow label="No. Rekening" value={bank.no_rekening} />
                            <SummaryRow label="Atas Nama" value={bank.atas_nama} />
                          </div>
                        ))
                      ) : (
                        <div className="rounded-lg bg-white">
                          <SummaryRow label="Bank" value="Bank Syariah Indonesia" />
                          <SummaryRow label="No. Rekening" value="123-456-7890" />
                          <SummaryRow label="Atas Nama" value="Masjid Al-Muhajirin" />
                        </div>
                      )}
                    </div>
                  )}

                  {formData.metodePembayaran === 'qris' && (
                    <div className="text-center text-sm text-gray-600">
                      <div className="mx-auto flex h-44 w-44 items-center justify-center rounded-xl border bg-white">
                        <QrCode className="h-16 w-16 text-gray-400" aria-hidden="true" />
                      </div>
                      <p className="mt-3">Scan QRIS masjid, lalu upload screenshot bukti pembayaran.</p>
                    </div>
                  )}

                  {formData.metodePembayaran === 'tunai' && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-800">
                      <strong>Alamat Masjid:</strong>
                      <br />
                      Perumahan Talaga Bestari, Kabupaten Tangerang
                      <br />
                      <strong>Waktu:</strong> 08:00 - 20:00 WIB
                    </div>
                  )}
                </div>
              )}

              {paymentInfo && (
                <Field
                  label="Upload Bukti Pembayaran"
                  hint={formData.metodePembayaran === 'tunai' ? 'Opsional untuk pembayaran tunai.' : 'Wajib untuk transfer bank atau QRIS.'}
                >
                  <div className="rounded-xl border-2 border-dashed border-[#EDE6D6] p-5 text-center transition hover:border-[#52B788]">
                    <input
                      id="bukti-upload"
                      type="file"
                      name="bukti"
                      accept="image/*"
                      onChange={handleChange}
                      className="hidden"
                    />

                    <label htmlFor="bukti-upload" className="block cursor-pointer">
                      {formData.bukti ? (
                        <div className="space-y-2 text-[#2D6A4F]">
                          <CheckCircle2 className="mx-auto h-10 w-10" aria-hidden="true" />
                          <p className="text-sm font-semibold">File berhasil dipilih</p>
                          <p className="break-all text-xs text-gray-500">{formData.bukti.name}</p>
                        </div>
                      ) : (
                        <div className="space-y-2 text-gray-500">
                          <UploadCloud className="mx-auto h-10 w-10" aria-hidden="true" />
                          <p className="text-sm font-medium">Klik untuk upload bukti pembayaran</p>
                          <p className="text-xs">PNG, JPG, JPEG</p>
                        </div>
                      )}
                    </label>
                  </div>
                </Field>
              )}
            </div>
          )}

          {currentStep === 5 && (
            <div className="flex flex-col items-center gap-5 py-4 text-center lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start lg:text-left">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-[#2D6A4F]">
                <CheckCircle2 className="h-10 w-10" aria-hidden="true" />
              </div>

              <div>
                <h2 className="font-serif text-2xl font-bold text-[#1B4332]">Zakat Diterima</h2>
                <p className="mt-2 max-w-xs text-sm leading-6 text-gray-500 lg:max-w-none">
                  Jazākumullāhu khayran. Data zakat Anda sudah masuk dan menunggu verifikasi DKM.
                </p>
              </div>

              <div className="w-full rounded-xl bg-[#F5F0E8] p-4 text-left lg:col-start-1">
                <div className="text-xs text-gray-500">Kode unik pembayaran</div>
                <div className="mt-1 font-serif text-2xl font-bold tracking-widest text-[#1B4332]">
                  +{successInfo?.kode_unik || paymentInfo?.kode_unik || '-'}
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  {successInfo?.nama || formData.nama} · {getZakatLabel(successInfo?.jenisZakat || formData.jenisZakat)}
                </div>
                <div className="mt-1 text-sm text-gray-600">
                  Metode: {getPaymentLabel(successInfo?.metodePembayaran || formData.metodePembayaran)}
                </div>
                <div className="mt-1 text-sm font-semibold text-[#1B4332]">
                  {formatCurrency(successInfo?.total_bayar || paymentInfo?.total_bayar)}
                </div>
              </div>

              <div className="relative w-full overflow-hidden rounded-2xl bg-[#1B4332] px-5 py-6 lg:row-span-2">
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#E8C96A]">
                  Doa Amil Zakat
                </div>
                <div className="mt-4 font-serif text-lg leading-loose text-white" dir="rtl">
                  آجَرَكَ اللَّهُ فِيمَا أَعْطَيْتَ وَبَارَكَ فِيمَا أَبْقَيْتَ وَجَعَلَهُ لَكَ طَهُورًا
                </div>
                <div className="mx-auto my-4 h-px w-10 bg-[#C9A84C]/40" />
                <p className="font-serif text-sm italic leading-7 text-white/80">
                  Ajarakallahu fima a'thayta wa baraka fima abqayta wa ja'alahu laka tahura
                </p>
                <p className="mt-3 text-xs leading-6 text-white/60">
                  Semoga Allah memberimu pahala atas apa yang engkau berikan, memberkahi apa yang engkau sisakan, dan menjadikannya sebagai penyuci bagimu.
                </p>
              </div>

              <Button
                type="button"
                onClick={resetForm}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2D6A4F] px-4 py-3.5 text-sm font-semibold text-white hover:bg-[#1B4332] lg:col-start-1"
              >
                <RefreshCcw className="h-4 w-4" aria-hidden="true" />
                Bayar Zakat Lagi
              </Button>
            </div>
          )}
        </section>

        {currentStep < 5 && (
          <footer className="flex gap-3 border-t border-[#EDE6D6] bg-white px-6 pb-7 pt-4 lg:col-start-2 lg:px-10">
            <Button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1 || isLoading}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#F5F0E8] px-4 py-3.5 text-sm font-semibold text-gray-500 hover:bg-[#EDE6D6] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Kembali
            </Button>

            <Button
              type="button"
              onClick={currentStep < 4 ? nextStep : handleSubmit}
              disabled={!isCurrentStepValid() || isLoading}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 ${
                currentStep === 4 && !paymentInfo
                  ? 'bg-[#C9A84C] text-[#1B4332] hover:bg-[#E8C96A]'
                  : 'bg-[#2D6A4F] text-white hover:bg-[#1B4332]'
              }`}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              {primaryLabel}
              {!isLoading && currentStep < 4 ? <ArrowRight className="h-4 w-4" aria-hidden="true" /> : null}
            </Button>
          </footer>
        )}
      </div>
    </main>
  );
};

export default ZakatForm;
