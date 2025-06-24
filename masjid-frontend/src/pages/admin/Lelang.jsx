import React, { useState } from 'react'
import{
  LelangDaftar,
  LelangTambah,
  LelangAktif,
  LelangHistory
} from '../../components/lelang-components'

const Lelang = () => {
  const [activeTab, setActiveTab] = useState('daftar')

  const tabs = [
    {key: 'daftar', label: 'Daftar Barang', icon: '📋' },
    {key: 'tambah', label: 'Tambah Barang', icon: 'U+2795' },
    {key: 'aktif', label: 'Lelang Aktif', icon: '⚡' },
    {key: 'history', label: 'History Lelang', icon: '📚' }
  ]

  return(
    <div className='p-6'>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kelola Lelang Barang Masjid</h1>
        <p className="text-gray-600">Sistem lelang barang untuk jamaah masjid</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.key === 'aktif' && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full ml-1">
                    Live
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'daftar' && <LelangDaftar />}
        {activeTab === 'tambah' && <LelangTambah />}
        {activeTab === 'aktif' && <LelangAktif />}
        {activeTab === 'history' && <LelangHistory />}
      </div>
    </div>
  )
}
export default Lelang