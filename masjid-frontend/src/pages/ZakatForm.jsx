import React, { useState } from 'react';
import FloatingInput from '../components/form/FloatingInput';

const ZakatForm = () => {
  const [formData, setFormData] = useState({
    nama: '',
    nominal: '',
    jenisZakat: '',
    bukti: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  // data metode pembayaran
  const metodePembayaran ={
    transfer_bank: {
      label: 'Transfer Bank',
      icon: '🏦',
      description: 'Transfer melalui bank ke rekening masjid.',
      info: {
        bank: 'Bank Syariah Indonesia',
        norek: '123-456-7890',
        atas_nama: 'Masjid Al-Muhajirin',
      }
    },
    qris: {
      label: 'QRIS',
      icon: '📱',
      info: {
        qrisCode: 'https://example.com/qris-code.png',
        description: 'Gunakan QR Code untuk pembayaran zakat.',
      }
    },
    cash: {
      label: 'Tunai',
      icon: '💵',
      description: 'Bayar langsung di masjid.',
    }
  }

  const isFormValid = () => {
    return(
      formData.nama.trim() !== '' &&
      formData.nominal.trim() !== '' &&
      formData.jenisZakat !== '' &&
      formData.metodePembayaran !== '' &&
      formData.jenisZakat !== null
    )
  }

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'bukti') {
      setFormData({ ...formData, bukti: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const data = new FormData();
    data.append('nama', formData.nama);
    data.append('nominal', formData.nominal);
    data.append('jenisZakat', formData.jenisZakat);
    data.append('metodePembayaran', formData.metodePembayaran);
    if (formData.bukti) {
      data.append('bukti', formData.bukti);
    }

    try {
      const response = await fetch('http://localhost:5000/api/zakat', {
        method: 'POST',
        body: data,
      });

      const result = await response.json();
      
      if (response.ok) {
        alert(result.message);
        // Reset form setelah berhasil
        setFormData({
          nama: '',
          nominal: '',
          jenisZakat: '',
          metodePembayaran: '',
          bukti: null,
        });
        // Reset file input
        document.querySelector('input[type="file"]').value = '';
      } else {
        alert(result.message || 'Terjadi kesalahan saat mengirim data.');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat mengirim data.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedMethod = metodePembayaran[formData.metodePembayaran];

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded shadow mt-10">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-700">Form Pembayaran Zakat</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
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
        </div>
        <div>
          <FloatingInput
            label="Nominal Zakat"
            type="text"
            name="nominal"
            value={formData.nominal}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              setFormData({ ...formData, nominal: value });
            }}
            required
            icon="Rp"
          />
        </div>
        <div className="relative w-full">
          <select
            name="jenisZakat"
            id="jenisZakat"
            value={formData.jenisZakat}
            onChange={handleChange}
            className="peer w-full border rounded px-3 pt-4 pb-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
          >
            <option value="" disabled>-- Pilih Jenis Zakat --</option>
            <option value="fitrah">Zakat Fitrah</option>
            <option value="maal">Zakat Maal</option>
            <option value="profesi">Zakat Profesi</option>
          </select>
          <label
            htmlFor="jenisZakat"
            className="absolute left-3 -top-2.5 bg-white px-1 text-gray-500 text-sm transition-all  
            peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base 
            peer-placeholder-shown:text-gray-400 peer-placeholder-shown:bg-transparent
            peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-teal-600 peer-focus:bg-white"
          >
            Jenis Zakat
          </label>
        </div>

        <div>
          <label className="block mb-2 font-semibold text-gray-700">Metode Pembayaran</label>
          <div className="grid gap-3">
            {Object.entries(metodePembayaran).map(([key, method]) => (
              <label
                key={key}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                  formData.metodePembayaran === key
                    ? 'border-teal-500 bg-teal-50'
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
                <span className="text-2xl mr-3">{method.icon}</span>
                <span className="font-medium">{method.label}</span>
                {formData.metodePembayaran === key && (
                  <span className="ml-auto text-teal-500">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Informasi Pembayaran */}
        {selectedMethod && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">
              Informasi {selectedMethod.label}
            </h4>
            
            {formData.metodePembayaran === 'transfer_bank' && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Bank:</span>
                  <span className="font-medium">{selectedMethod.info.bank}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">No. Rekening:</span>
                  <span className="font-medium font-mono">{selectedMethod.info.norek}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Atas Nama:</span>
                  <span className="font-medium">{selectedMethod.info.atas_nama}</span>
                </div>
              </div>
            )}

            {formData.metodePembayaran === 'qris' && (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">{selectedMethod.info.description}</p>
                <div className="inline-block p-4 bg-white rounded-lg shadow">
                  <img 
                    src={selectedMethod.info.qr_image} 
                    alt="QR Code QRIS"
                    className="w-48 h-48 mx-auto"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkdRUiBDb2RlIE1hc2ppZDwvdGV4dD48L3N2Zz4=';
                    }}
                  />
                </div>
              </div>
            )}

            {formData.metodePembayaran === 'cash' && (
              <div className="text-center">
                <p className="text-sm text-gray-600">{selectedMethod.description}</p>
                <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    <strong>Alamat Masjid:</strong><br />
                    Jl. Contoh No. 123, Kota, Provinsi<br />
                    <strong>Waktu Operasional:</strong> 08:00 - 20:00 WIB
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

       <div>
          <label className="block mb-1 font-semibold">
            Upload Bukti Transfer
            {formData.metodePembayaran === 'cash' && (
              <span className="text-sm text-gray-500 font-normal"> (opsional untuk pembayaran tunai)</span>
            )}
          </label>
          <input
            type="file"
            name="bukti"
            accept="image/*"
            onChange={handleChange}
            required={formData.metodePembayaran !== 'cash'}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.metodePembayaran === 'cash' 
              ? 'Opsional: Upload foto bukti jika ada'
              : 'Upload screenshot bukti transfer/pembayaran'
            }
          </p>
          
          {/* Progress indicator */}
          {formData.bukti && (
            <div className="mt-2 text-sm text-green-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              File berhasil dipilih: {formData.bukti.name}
            </div>
          )}
        </div>

        {/* Form Progress Indicator */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Kelengkapan Form:</span>
            <span className="text-sm text-gray-600">
              {Object.values({
                nama: formData.nama.trim() !== '',
                nominal: formData.nominal.trim() !== '',
                jenisZakat: formData.jenisZakat !== '',
                metodePembayaran: formData.metodePembayaran !== '',
                bukti: formData.bukti !== null || formData.metodePembayaran === 'cash'
              }).filter(Boolean).length}/5
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-teal-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${(Object.values({
                  nama: formData.nama.trim() !== '',
                  nominal: formData.nominal.trim() !== '',
                  jenisZakat: formData.jenisZakat !== '',
                  metodePembayaran: formData.metodePembayaran !== '',
                  bukti: formData.bukti !== null || formData.metodePembayaran === 'cash'
                }).filter(Boolean).length / 5) * 100}%`
              }}
            ></div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !isFormValid()}
          className={`w-full font-semibold py-3 rounded transition-all duration-300 ${
            isLoading || !isFormValid()
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
              : 'bg-teal-600 hover:bg-teal-700 text-white hover:shadow-lg transform hover:-translate-y-0.5'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Mengirim...
            </div>
          ) : !isFormValid() ? (
            'Lengkapi Form Dulu'
          ) : (
            'Kirim Zakat'
          )}
        </button>
      </form>
    </div>
  );
};

export default ZakatForm;