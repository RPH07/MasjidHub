import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  LelangPublicList,
  LelangPublicDetail,
  UserBidHistory
} from '../../components/lelang-public-components'

const UserDashboard = () => {
  const [activeView, setActiveView] = useState('list') // list, detail, history
  const [selectedLelangId, setSelectedLelangId] = useState(null)
  const navigate = useNavigate()

  // Handle card click dari LelangPublicList
  const handleCardClick = (lelang) => {
    setSelectedLelangId(lelang.id)
    setActiveView('detail')
  }

  // Handle back dari detail
  const handleBackToList = () => {
    setActiveView('list')
    setSelectedLelangId(null)
  }

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Title */}
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                🕌 MasjidHub
              </h1>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <button
                onClick={() => setActiveView('list')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeView === 'list'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                🔥 Lelang Aktif
              </button>
              <button
                onClick={() => setActiveView('history')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeView === 'history'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                📝 History Bid
              </button>
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, User!
              </span>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-4 py-3">
            <button
              onClick={() => setActiveView('list')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium text-center transition-colors ${
                activeView === 'list'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🔥 Lelang
            </button>
            <button
              onClick={() => setActiveView('history')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium text-center transition-colors ${
                activeView === 'history'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📝 History
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="py-8">
        {/* Lelang List View */}
        {activeView === 'list' && (
          <LelangPublicList
            onCardClick={handleCardClick}
            autoRefresh={true}
            showSearch={true}
            showSort={true}
            gridColumns={3}
            cardVariant="default"
            className="px-4 sm:px-6 lg:px-8"
          />
        )}

        {/* Lelang Detail View */}
        {activeView === 'detail' && selectedLelangId && (
          <LelangPublicDetail
            lelangId={selectedLelangId}
            onBack={handleBackToList}
            autoRefresh={true}
            showBidForm={true}
            className="px-4 sm:px-6 lg:px-8"
          />
        )}

        {/* User Bid History View */}
        {activeView === 'history' && (
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  📝 History Bid Saya
                </h2>
                <p className="text-gray-600">
                  Lihat semua bid yang pernah Anda submit
                </p>
              </div>
              
              {/* Temporary message karena UserBidHistory belum selesai */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                <div className="text-4xl mb-4">🚧</div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Feature Coming Soon
                </h3>
                <p className="text-blue-700 mb-4">
                  Fitur User Bid History sedang dalam pengembangan.
                </p>
                <button
                  onClick={() => setActiveView('list')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Lihat Lelang Aktif
                </button>
              </div>
        {/* {activeView === 'history' && (
        <div className="px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                    <UserBidHistory />
            </div>
            </div>
        </div>
        )} */}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 text-sm">
            © 2024 MasjidHub. Sistem Lelang Masjid.
          </div>
        </div>
      </footer>
    </div>
  )
}

export default UserDashboard