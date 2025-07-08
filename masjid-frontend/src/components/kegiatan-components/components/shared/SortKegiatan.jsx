import React, { useState } from 'react';
import { getSortLabel } from '../../utils';

const SortKegiatan = ({ sortOrder, onSort }) => {
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const handleSort = (order) => {
    onSort(order);
    setShowSortDropdown(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowSortDropdown(!showSortDropdown)}
        className="flex items-center gap-2 px-3 py-1 border rounded hover:bg-gray-50 focus:outline-none"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
        </svg>
        <span className="text-sm">{getSortLabel(sortOrder)}</span>
        <svg 
          className={`w-4 h-4 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {showSortDropdown && (
        <div className="absolute right-0 mt-1 w-48 bg-white border rounded-md shadow-lg z-10">
          <div className="py-1">
            <button
              onClick={() => handleSort('desc')}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2 ${
                sortOrder === 'desc' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
              </svg>
              Terbaru
              {sortOrder === 'desc' && (
                <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
            <button
              onClick={() => handleSort('asc')}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2 ${
                sortOrder === 'asc' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" transform="rotate(180 12 12)" />
              </svg>
              Terlama
              {sortOrder === 'asc' && (
                <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}
      
      {/* Backdrop */}
      {showSortDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowSortDropdown(false)}
        ></div>
      )}
    </div>
  );
};

export default SortKegiatan;