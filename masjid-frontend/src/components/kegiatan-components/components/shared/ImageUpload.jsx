import React, { useRef } from 'react';
import { formatFileSize } from '../../utils';

const ImageUpload = ({ foto, onFileChange }) => {
  const fileInputRef = useRef(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex justify-center items-center bg-gray-50 border border-gray-300 rounded-md px-2 py-3.5">
        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      
      <div className="flex-1">
        <input
          id="foto-input"
          type="file"
          name="foto"
          onChange={onFileChange}
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
        />
        
        <button
          type="button"
          onClick={handleClick}
          className={`w-full py-4 px-3 border rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            foto 
              ? 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100' 
              : 'border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
        >
          {foto ? `✓ ${foto.name} (${formatFileSize(foto.size)} KB)` : 'Pilih Foto'}
        </button>
      </div>
    </div>
  );
};

export default ImageUpload;