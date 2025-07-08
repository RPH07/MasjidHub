import React, { useState, useEffect } from 'react';
import { FloatingInput, FloatingSelect, FloatingTextarea } from '../components/form';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth'

const ZakatForm = () => {
  const { user } = useAuth();

  // State untuk step management
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Jenis Zakat
    jenisZakat: '',
    
    // Step 2: Data Personal
    nama: user?.nama || '',
    email: user?.email || '',
    no_telepon: '',
    
    // Step 3: Kalkulasi
    jumlah_jiwa: 1,
    total_harta: '',
    gaji_kotor: '',
    nominal_zakat: 0,
    
    // Step 4: Metode Pembayaran
    metodePembayaran: '',
    
    // Step 5: Upload & Submit
    bukti: null,
    kode_unik: null,
    total_bayar: null
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingKode, setIsLoadingKode] = useState(false); // ✅ FIX: Add missing state
  
  const zakatSettings = {
    fitrah: 35000,
    nisab_emas: 85,
    nisab_perak: 595,
    harga_emas: 1200000,
    harga_perak: 15000,
    kebutuhan_pokok: 4500000
  };

  // Data jenis zakat
  const jenisZakatOptions = [
    { 
      value: 'fitrah', 
      label: 'Zakat Fitrah',
      icon: '🌙',
      description: 'Zakat yang wajib dibayar setiap Muslim pada bulan Ramadan'
    },
    { 
      value: 'maal', 
      label: 'Zakat Maal',
      icon: '💰',
      description: 'Zakat dari harta yang telah mencapai nisab dan haul'
    },
    { 
      value: 'profesi', 
      label: 'Zakat Profesi',
      icon: '💼',
      description: 'Zakat dari penghasilan profesi/gaji bulanan'
    }
  ];

  // Data metode pembayaran
  const metodePembayaran = {
    transfer: {
      label: 'Transfer Bank',
      icon: '🏦',
      description: 'Transfer melalui bank ke rekening masjid',
      info: {
        bank: 'Bank Syariah Indonesia',
        norek: '123-456-7890',
        atas_nama: 'Masjid Al-Muhajirin'
      }
    },
    qris: {
      label: 'QRIS',
      icon: '📱',
      description: 'Bayar menggunakan QR Code',
      info: {
        description: 'Scan QR Code di bawah untuk pembayaran'
      }
    },
    cash: {
      label: 'Tunai',
      icon: '💵',
      description: 'Bayar langsung di masjid'
    }
  };

  // Steps configuration
  const steps = [
    { number: 1, title: 'Jenis Zakat', icon: '📋' },
    { number: 2, title: 'Data Diri', icon: '👤' },
    { number: 3, title: 'Kalkulasi', icon: '🧮' },
    { number: 4, title: 'Metode Bayar', icon: '💳' },
    { number: 5, title: 'Konfirmasi', icon: '✅' }
  ];

  // ✅ FIX: Generate kode unik dari backend
  const generateKodeUnikFromBackend = async () => {
    setIsLoadingKode(true);
    try {
      console.log('🔄 Generating kode unik from backend...');
      
      const response = await fetch('http://localhost:5173/api/zakat/generate-kode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nominal: formData.nominal_zakat
        }),
      });

      const result = await response.json();
      console.log('📊 Kode unik response:', result);
      
      if (response.ok) {
        setFormData(prev => ({
          ...prev,
          kode_unik: result.data.kode_unik,
          total_bayar: result.data.total_bayar
        }));
        
        console.log('✅ Kode unik generated:', result.data.kode_unik);
        console.log('💰 Total bayar:', result.data.total_bayar);
      } else {
        toast.error(result.message || 'Gagal generate kode unik');
      }
    } catch (err) {
      console.error('❌ Error generating kode unik:', err);
      toast.error('Terjadi kesalahan saat generate kode unik.');
    } finally {
      setIsLoadingKode(false);
    }
  };

  // Kalkulasi zakat berdasarkan jenis
  const hitungZakat = () => {
    const { jenisZakat, jumlah_jiwa, total_harta, gaji_kotor } = formData;
    let nominal = 0;

    switch (jenisZakat) {
      case 'fitrah': {
        nominal = jumlah_jiwa * zakatSettings.fitrah;
        break;
      }
        
      case 'maal': {
        const nisabRupiah = zakatSettings.nisab_perak * zakatSettings.harga_perak;
        const hartaBersih = parseFloat(total_harta.replace(/,/g, '') || 0);
        if (hartaBersih >= nisabRupiah) {
          nominal = hartaBersih * 0.025; // 2.5%
        }
        break;
      }
        
      case 'profesi': {
        const gajiKotor = parseFloat(gaji_kotor.replace(/,/g, '') || 0);
        const gajiNetto = gajiKotor - zakatSettings.kebutuhan_pokok;
        if (gajiNetto > 0) {
          nominal = gajiNetto * 0.025; // 2.5%
        }
        break;
      }
        
      default: {
        nominal = 0;
        break;
      }
    }

    return Math.round(nominal);
  };

  // Handle change
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'bukti') {
      setFormData(prev => ({ ...prev, bukti: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // ✅ FIX: Update kalkulasi dan auto-generate kode unik
  useEffect(() => {
    if (currentStep >= 3) {
      const nominal = hitungZakat();
      setFormData(prev => ({
        ...prev,
        nominal_zakat: nominal
      }));
    }

    // Auto generate kode unik saat masuk step 5
    if (currentStep === 5 && formData.nominal_zakat > 0 && !formData.kode_unik) {
      generateKodeUnikFromBackend();
    }
  }, [formData.jenisZakat, formData.jumlah_jiwa, formData.total_harta, formData.gaji_kotor, currentStep]); // ✅ FIX: Add proper dependencies

  // Navigation functions
  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Validasi per step
  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.jenisZakat !== '';
      case 2:
        return formData.nama.trim() && formData.email.trim() && formData.no_telepon.trim();
      case 3: {
        if (formData.jenisZakat === 'fitrah') return formData.jumlah_jiwa > 0;
        if (formData.jenisZakat === 'maal') return formData.total_harta.trim();
        if (formData.jenisZakat === 'profesi') return formData.gaji_kotor.trim();
        return false;
      }
      case 4:
        return formData.metodePembayaran !== '';
      case 5:
        return formData.metodePembayaran === 'cash' || formData.bukti !== null;
      default:
        return false;
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        nama: user.nama || '',
        email: user.email || '',
        // no_telepon: user.no_hp || '', // Jika ada field ini di user
      }));
    }
  }, [user]);

  // Handle submit
  const handleSubmit = async () => {
    setIsLoading(true);
    console.log('👤 Current user:', user); // ✅ DEBUG
    console.log('💳 Submitting zakat with token...');

    const submitData = new FormData();
    submitData.append('nama', formData.nama);
    submitData.append('email', formData.email);
    submitData.append('no_telepon', formData.no_telepon);
    submitData.append('jenis_zakat', formData.jenisZakat);
    submitData.append('jumlah_jiwa', formData.jumlah_jiwa);
    submitData.append('total_harta', formData.total_harta.replace(/,/g, '') || 0);
    submitData.append('gaji_kotor', formData.gaji_kotor.replace(/,/g, '') || 0);
    submitData.append('nominal', formData.nominal_zakat);
    submitData.append('metode_pembayaran', formData.metodePembayaran);
    
    if (formData.kode_unik) {
      submitData.append('kode_unik', formData.kode_unik);
      submitData.append('total_bayar', formData.total_bayar);
    }

    if (formData.bukti) {
      submitData.append('bukti', formData.bukti);
    }

    try {
      console.log('🚀 Sending zakat data to backend...');

      const token = localStorage.getItem('token');
      console.log('🎫 Token from localStorage:', token ? 'EXISTS' : 'NOT_FOUND');

      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('http://localhost:5173/api/zakat', {
        method: 'POST',
        headers: headers, 
        body: submitData,
      });

      const result = await response.json();
      console.log('📊 Backend response:', result);
      
      if (response.ok) {
        toast.success(
          `Zakat berhasil disubmit! Kode unik: ${formData.kode_unik}. Total bayar: ${formatCurrency(formData.total_bayar)}`, 
          { duration: 7000 }
        );
        
        // Reset form
        setFormData({
          jenisZakat: '',
          nama: '',
          email: '',
          no_telepon: '',
          jumlah_jiwa: 1,
          total_harta: '',
          gaji_kotor: '',
          nominal_zakat: 0,
          metodePembayaran: '',
          bukti: null,
          kode_unik: null,
          total_bayar: null
        });
        setCurrentStep(1);
      } else {
        console.error('❌ Backend error:', result);
        toast.error(result.message || 'Terjadi kesalahan saat mengirim data.');
      }
    } catch (err) {
      console.error('❌ Network error:', err);
      toast.error('Terjadi kesalahan jaringan. Pastikan server backend berjalan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden mt-10">
      {/* Toast Container */}
      <Toaster position="top-center" />
      
      {/* Header dengan Progress */}
      <div className="bg-gradient-to-r from-green-500 to-teal-600 p-6 text-white">
        <h1 className="text-2xl font-bold text-center mb-4">Form Pembayaran Zakat</h1>
        
        {/* Progress Steps - Desktop */}
        <div className="hidden md:flex items-center justify-center space-x-4">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  currentStep >= step.number 
                    ? 'bg-white text-green-600' 
                    : 'bg-green-400 text-white'
                }`}>
                  {currentStep > step.number ? '✓' : step.icon}
                </div>
                <span className="text-xs mt-1 text-center">{step.title}</span>
              </div>
              
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 transition-all duration-300 ${
                  currentStep > step.number ? 'bg-white' : 'bg-green-400'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
        
        {/* Progress Steps - Mobile */}
        <div className="flex md:hidden items-center justify-between">
          {steps.map((step) => (
            <div key={step.number} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              currentStep >= step.number 
                ? 'bg-white text-green-600' 
                : 'bg-green-400 text-white'
            }`}>
              {currentStep > step.number ? '✓' : step.number}
            </div>
          ))}
        </div>
        
        {/* Progress Bar - Mobile */}
        <div className="flex md:hidden mt-2 bg-green-400 rounded-full h-1">
          <div 
            className="bg-white rounded-full h-1 transition-all duration-300"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6">
        {/* Step 1: Pilih Jenis Zakat */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Pilih Jenis Zakat</h2>
              <p className="text-gray-600">Pilih jenis zakat yang ingin Anda bayarkan</p>
            </div>
            
            <div className="space-y-4">
              {jenisZakatOptions.map((option) => (
                <label
                  key={option.value}
                  className={`block p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    formData.jenisZakat === option.value
                      ? 'border-green-500 bg-green-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="jenisZakat"
                    value={option.value}
                    checked={formData.jenisZakat === option.value}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className="flex items-start">
                    <span className="text-3xl mr-4">{option.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{option.label}</h3>
                      <p className="text-gray-600 text-sm mt-1">{option.description}</p>
                    </div>
                    {formData.jenisZakat === option.value && (
                      <span className="text-green-500 ml-2">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Data Personal */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Data Pribadi</h2>
              <p className="text-gray-600">Masukkan data pribadi Anda</p>
            </div>
            
            <div className="space-y-4">
              <FloatingInput
                label="Nama Lengkap"
                type="text"
                name="nama"
                value={formData.nama}
                onChange={handleChange}
                required
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
              />
              
              <FloatingInput
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                }
              />
              
              <FloatingInput
                label="No. Telepon"
                type="tel"
                name="no_telepon"
                value={formData.no_telepon}
                onChange={handleChange}
                required
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                }
              />
            </div>
          </div>
        )}

        {/* Step 3: Kalkulasi */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Kalkulasi Zakat</h2>
              <p className="text-gray-600">
                {formData.jenisZakat === 'fitrah' && 'Masukkan jumlah jiwa yang akan dibayarkan zakatnya'}
                {formData.jenisZakat === 'maal' && 'Masukkan total harta yang Anda miliki'}
                {formData.jenisZakat === 'profesi' && 'Masukkan gaji kotor bulanan Anda'}
              </p>
            </div>
            
            <div className="space-y-4">
              {formData.jenisZakat === 'fitrah' && (
                <div>
                  <FloatingInput
                    label="Jumlah Jiwa"
                    type="number"
                    name="jumlah_jiwa"
                    value={formData.jumlah_jiwa}
                    onChange={handleChange}
                    required
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    }
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    Tarif per jiwa: {formatCurrency(zakatSettings.fitrah)}
                  </p>
                </div>
              )}

              {formData.jenisZakat === 'maal' && (
                <div>
                  <FloatingInput
                    label="Total Harta"
                    type="currency"
                    name="total_harta"
                    value={formData.total_harta}
                    onChange={handleChange}
                    required
                    icon="Rp"
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    Nisab (minimal harta): {formatCurrency(zakatSettings.nisab_perak * zakatSettings.harga_perak)}
                  </p>
                </div>
              )}

              {formData.jenisZakat === 'profesi' && (
                <div>
                  <FloatingInput
                    label="Gaji Kotor Bulanan"
                    type="currency"
                    name="gaji_kotor"
                    value={formData.gaji_kotor}
                    onChange={handleChange}
                    required
                    icon="Rp"
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    Kebutuhan pokok: {formatCurrency(zakatSettings.kebutuhan_pokok)}
                  </p>
                </div>
              )}

              {/* Hasil Kalkulasi */}
              {formData.nominal_zakat > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 mb-2">Hasil Kalkulasi</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Nominal Zakat:</span>
                      <span className="font-semibold">{formatCurrency(formData.nominal_zakat)}</span>
                    </div>
                  </div>
                </div>
              )}

              {formData.jenisZakat === 'maal' && formData.total_harta && 
               parseFloat(formData.total_harta.replace(/,/g, '')) < (zakatSettings.nisab_perak * zakatSettings.harga_perak) && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm">
                    ⚠️ Harta Anda belum mencapai nisab. Zakat maal tidak wajib, namun Anda tetap bisa bersedekah.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Metode Pembayaran */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Pilih Metode Pembayaran</h2>
              <p className="text-gray-600">Pilih cara pembayaran yang Anda inginkan</p>
            </div>
            
            <div className="space-y-4">
              {Object.entries(metodePembayaran).map(([key, method]) => (
                <label
                  key={key}
                  className={`block p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    formData.metodePembayaran === key
                      ? 'border-green-500 bg-green-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="metodePembayaran"
                    value={key}
                    checked={formData.metodePembayaran === key}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    <span className="text-2xl mr-4">{method.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold">{method.label}</h3>
                      <p className="text-gray-600 text-sm">{method.description}</p>
                    </div>
                    {formData.metodePembayaran === key && (
                      <span className="text-green-500 ml-2">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Konfirmasi & Upload */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Konfirmasi Pembayaran</h2>
              <p className="text-gray-600">Periksa kembali data Anda dan upload bukti pembayaran</p>
            </div>

            {/* Informasi Pembayaran */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-3">Detail Pembayaran</h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Nama:</span>
                  <span className="font-medium">{formData.nama}</span>
                </div>
                <div className="flex justify-between">
                  <span>Jenis Zakat:</span>
                  <span className="font-medium capitalize">{formData.jenisZakat}</span>
                </div>
                <div className="flex justify-between">
                  <span>Nominal Zakat:</span>
                  <span className="font-medium">{formatCurrency(formData.nominal_zakat)}</span>
                </div>
                
                {/* ✅ FIX: Kode unik section */}
                {isLoadingKode ? (
                  <div className="flex justify-center items-center py-4">
                    <svg className="animate-spin h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-blue-600">Generating kode unik...</span>
                  </div>
                ) : formData.kode_unik ? (
                  <>
                    <div className="flex justify-between">
                      <span>Kode Unik:</span>
                      <span className="font-medium text-orange-600">+{formData.kode_unik}</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total Bayar:</span>
                      <span className="text-green-600">{formatCurrency(formData.total_bayar)}</span>
                    </div>
                    
                    {/* Info tentang kode unik */}
                    <div className="bg-orange-50 border border-orange-200 rounded p-3 mt-3">
                      <p className="text-sm text-orange-800">
                        <span className="font-medium">💡 Kode Unik:</span><br />
                        Kode unik {formData.kode_unik} ditambahkan untuk memudahkan verifikasi pembayaran Anda.
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-2">
                    <button 
                      onClick={generateKodeUnikFromBackend}
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Generate Kode Unik
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Info Metode Pembayaran */}
            {formData.metodePembayaran && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold mb-2">
                  Informasi {metodePembayaran[formData.metodePembayaran].label}
                </h4>
                
                {formData.metodePembayaran === 'transfer' && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Bank:</span>
                      <span className="font-medium">{metodePembayaran.transfer.info.bank}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>No. Rekening:</span>
                      <span className="font-mono font-medium">{metodePembayaran.transfer.info.norek}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Atas Nama:</span>
                      <span className="font-medium">{metodePembayaran.transfer.info.atas_nama}</span>
                    </div>
                    
                    {/* ✅ NEW: Tampilkan total yang harus dibayar */}
                    {formData.total_bayar && (
                      <div className="bg-green-50 border border-green-200 rounded p-3 mt-3">
                        <p className="text-sm text-green-800 font-medium">
                          💰 Transfer sebesar: {formatCurrency(formData.total_bayar)}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {formData.metodePembayaran === 'qris' && (
                  <div className="text-center">
                    <p className="text-sm mb-3">{metodePembayaran.qris.info.description}</p>
                    <div className="inline-block p-4 bg-white rounded-lg border">
                      <div className="w-48 h-48 bg-gray-100 rounded flex items-center justify-center text-gray-500">
                        QR Code Masjid
                      </div>
                    </div>
                    
                    {/* ✅ NEW: Tampilkan total yang harus dibayar */}
                    {formData.total_bayar && (
                      <div className="bg-green-50 border border-green-200 rounded p-3 mt-3">
                        <p className="text-sm text-green-800 font-medium">
                          💰 Scan & bayar sebesar: {formatCurrency(formData.total_bayar)}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {formData.metodePembayaran === 'cash' && (
                  <div className="text-center">
                    <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-3">
                      <p className="text-sm text-yellow-800">
                        <strong>Alamat Masjid:</strong><br />
                        Jl. Contoh No. 123, Kota, Provinsi<br />
                        <strong>Waktu:</strong> 08:00 - 20:00 WIB
                      </p>
                      
                      {/* ✅ NEW: Tampilkan total yang harus dibayar */}
                      {formData.total_bayar && (
                        <p className="text-sm font-medium mt-2 text-green-800">
                          💰 Bayar tunai sebesar: {formatCurrency(formData.total_bayar)}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Upload Bukti */}
            <div>
              <label className="block mb-2 font-medium">
                Upload Bukti Pembayaran
                {formData.metodePembayaran === 'cash' && (
                  <span className="text-sm text-gray-500 font-normal"> (opsional)</span>
                )}
              </label>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  name="bukti"
                  accept="image/*"
                  onChange={handleChange}
                  required={formData.metodePembayaran !== 'cash'}
                  className="hidden"
                  id="bukti-upload"
                />
                
                <label htmlFor="bukti-upload" className="cursor-pointer">
                  {formData.bukti ? (
                    <div className="text-green-600">
                      <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <p className="font-medium">File berhasil dipilih</p>
                      <p className="text-sm">{formData.bukti.name}</p>
                    </div>
                  ) : (
                    <div className="text-gray-500">
                      <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p>Klik untuk upload bukti pembayaran</p>
                      <p className="text-sm">PNG, JPG, JPEG (Max. 5MB)</p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              currentStep === 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            }`}
          >
            ← Sebelumnya
          </button>

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={!isStepValid()}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                !isStepValid()
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              Selanjutnya →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isStepValid() || isLoading}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                !isStepValid() || isLoading
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isLoading ? 'Mengirim...' : 'Kirim Data'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ZakatForm;