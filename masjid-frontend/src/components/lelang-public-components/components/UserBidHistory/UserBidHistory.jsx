import React, { useState, useEffect } from 'react'
import { useLelangPublic } from '../../hooks'
import { formatRupiah, formatDateTimeIndonesian } from '../../utils'

const UserBidHistory = () => {
  const [namaBidder, setNamaBidder] = useState('')
  const [userBids, setUserBids] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const { lelangList, fetchLelangAktif } = useLelangPublic()

  useEffect(() => {
    fetchLelangAktif()
  }, [fetchLelangAktif])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!namaBidder.trim()) return
    setLoading(true)
    setSearched(true)
    let allUserBids = []

    // Loop semua lelang, ambil bid history, filter by namaBidder
    for (const lelang of lelangList) {
      try {
        const res = await fetch(
          `/api/lelang/${lelang.id}/bids?public_view=true`
        )
        const data = await res.json()
        if (data.success && Array.isArray(data.data)) {
          const userBidsInLelang = data.data
            .filter(bid => bid.nama_bidder?.toLowerCase() === namaBidder.trim().toLowerCase())
            .map(bid => ({
              ...bid,
              lelangId: lelang.id,
              nama_barang: lelang.nama_barang
            }))
          allUserBids = allUserBids.concat(userBidsInLelang)
        }
      } catch (err) {
        console.log(err);
      }
    }

    // Sort by tanggal_bid desc
    allUserBids.sort((a, b) => new Date(b.tanggal_bid) - new Date(a.tanggal_bid))
    setUserBids(allUserBids)
    setLoading(false)
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-4">📝 History Bid Saya</h2>
      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <input
          type="text"
          className="border rounded px-3 py-2 flex-1"
          placeholder="Masukkan nama bidder kamu"
          value={namaBidder}
          onChange={e => setNamaBidder(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? 'Mencari...' : 'Cari'}
        </button>
      </form>

      {searched && !loading && userBids.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          Tidak ada bid ditemukan untuk nama <b>{namaBidder}</b>
        </div>
      )}

      {userBids.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-3 py-2 border">Barang</th>
                <th className="px-3 py-2 border">Jumlah Bid</th>
                <th className="px-3 py-2 border">Tanggal Bid</th>
                <th className="px-3 py-2 border">Urutan</th>
              </tr>
            </thead>
            <tbody>
              {userBids.map((bid, idx) => (
                <tr key={idx}>
                  <td className="px-3 py-2 border">{bid.nama_barang}</td>
                  <td className="px-3 py-2 border">{formatRupiah(bid.jumlah_bid)}</td>
                  <td className="px-3 py-2 border">{formatDateTimeIndonesian(bid.tanggal_bid)}</td>
                  <td className="px-3 py-2 border text-center">{bid.urutan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default UserBidHistory