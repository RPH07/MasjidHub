import React from 'react';

const BuktiModal = ({ isOpen, onClose, buktiTransfer, transactionInfo }) => {
  if (!isOpen) return null;

  // UPDATE: Buat URL function yang lebih simple karena URL sudah dibuat di parent
  const getImageUrl = (urlOrFilename) => {
    if (!urlOrFilename) return null;
    
    // Jika sudah berupa URL lengkap, langsung return
    if (urlOrFilename.startsWith('http')) {
      return urlOrFilename;
    }
    
    // Fallback jika masih berupa filename saja
    return `http://localhost:5000/uploads/bukti-donasi/${urlOrFilename}`;
  };

  const imageUrl = getImageUrl(buktiTransfer);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            Bukti Transfer
            {transactionInfo && (
              <span className="text-sm text-gray-600 ml-2">
                - {transactionInfo.type?.toUpperCase() || 'Unknown'}
              </span>
            )}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        
        <div className="p-6">
          {transactionInfo && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                {transactionInfo.nama_pemberi && (
                  <div>
                    <span className="font-medium text-gray-600">Nama:</span>
                    <p className="text-gray-900">{transactionInfo.nama_pemberi}</p>
                  </div>
                )}
                {transactionInfo.jumlah && (
                  <div>
                    <span className="font-medium text-gray-600">Nominal:</span>
                    <p className="text-gray-900 font-bold">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                      }).format(transactionInfo.jumlah)}
                    </p>
                  </div>
                )}
                {transactionInfo.kode_unik && (
                  <div>
                    <span className="font-medium text-gray-600">Kode Unik:</span>
                    <p className="text-gray-900 font-mono">+{transactionInfo.kode_unik.toLocaleString('id-ID')}</p>
                  </div>
                )}
                {transactionInfo.total_transfer && (
                  <div>
                    <span className="font-medium text-gray-600">Total Transfer:</span>
                    <p className="text-gray-900 font-bold text-purple-600">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                      }).format(transactionInfo.total_transfer)}
                    </p>
                  </div>
                )}
                {transactionInfo.metode_pembayaran && (
                  <div>
                    <span className="font-medium text-gray-600">Metode:</span>
                    <p className="text-gray-900 capitalize">
                      {transactionInfo.metode_pembayaran.replace('_', ' ')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="text-center">
            {imageUrl ? (
              <div>
                <img
                  src={imageUrl}
                  alt="Bukti Transfer"
                  className="max-w-full h-auto mx-auto rounded-lg shadow-lg"
                  style={{ maxHeight: '70vh' }}
                  onError={(e) => {
                    console.error('Error loading image:', imageUrl);
                    e.target.src = 'https://via.placeholder.com/400x300?text=Gambar+Tidak+Ditemukan';
                    e.target.alt = 'Gambar tidak dapat dimuat';
                    
                    // Show error details
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'mt-2 p-2 bg-red-100 text-red-700 text-xs rounded';
                    errorDiv.innerHTML = `
                      <strong>Error loading image:</strong><br>
                      URL: ${imageUrl}<br>
                      Pastikan file ada di folder yang benar
                    `;
                    if (!e.target.parentNode.querySelector('.error-detail')) {
                      errorDiv.classList.add('error-detail');
                      e.target.parentNode.appendChild(errorDiv);
                    }
                  }}
                  onLoad={() => {
                    console.log('✅ Image loaded successfully:', imageUrl);
                  }}
                />
                
                <div className="mt-4 flex justify-center gap-3">
                  <a
                    href={imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    🔗 Buka di Tab Baru
                  </a>
                  
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(imageUrl);
                      alert('URL gambar disalin ke clipboard!');
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    📋 Copy URL
                  </button>
                </div>
                
                <div className="mt-2 text-xs text-gray-500">
                  URL: {imageUrl}
                </div>
              </div>
            ) : (
              <div className="py-12">
                <div className="text-gray-500 text-lg mb-2">❌ Bukti transfer tidak tersedia</div>
                <div className="text-gray-400 text-sm">File: {buktiTransfer || 'tidak ada'}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuktiModal;