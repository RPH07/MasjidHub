import React, { useState } from 'react';
import { ExternalLink, Copy, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

const BuktiModal = ({ isOpen, onClose, buktiTransfer, transactionInfo }) => {
  const [imageError, setImageError] = useState(false);
  if (!isOpen) return null;

  const getImageUrl = (urlOrFilename) => {
    if (!urlOrFilename) return null;
    return urlOrFilename;
  };

  const imageUrl = getImageUrl(buktiTransfer);

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b flex justify-between items-center shrink-0">
          <h3 className="text-lg font-semibold">
            Bukti Transfer
            {transactionInfo && (
              <span className="text-sm text-gray-600 ml-2">
                - {transactionInfo.type?.toUpperCase() || 'Unknown'}
              </span>
            )}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 min-h-0">
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
                    <p className="text-gray-900 font-bold">
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
                  className="max-w-full max-h-[calc(90vh-260px)] object-contain mx-auto rounded-lg shadow-lg"
                  onError={() => {
                    console.error('Error loading image:', imageUrl);
                    setImageError(true);
                  }}
                />
                
                <div className="mt-4 flex justify-center gap-3">
                  <a
                    href={imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Buka di Tab Baru
                  </a>
                  
                  <button
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(imageUrl);
                        toast.success('URL Berhasil disalin!')
                      } catch (error) {
                        console.error('Gagal menyalin url: ', error);
                        toast.error('Gagal menyalin url');
                      }
                      
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    Copy URL
                  </button>
                </div>
                
                {import.meta.env.DEV === 'development' && (
                  <div className="mt-2 text-xs text-gray-500">
                    URL: {imageUrl}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12">
                <div className="text-gray-500 text-lg mb-2">Bukti transfer tidak tersedia</div>
                <div className="text-gray-400 text-sm">File: {buktiTransfer || 'tidak ada'}</div>

                {import.meta.env.DEV === 'development' && imageUrl && (
                  <div className="mt-3 p-2 bg-red-100 text-red-700 text-xs rounded break-all">
                    <strong>Error Loading Image: </strong>
                    <br />
                    URL: {imageUrl}
                    <br />
                    {imageError && <span>Pastikan file ada di folder yang benar</span>}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuktiModal;
