import React, { Component } from 'react';
import axios from 'axios';

export class Kas extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedPeriod: 'bulan-ini',
      activeTab: 'overview',
      loading: false,
      kasData: [],
      zakatData: [],
      infaqData: [],
      lelangData: [],
      summary: {
        totalSaldo: 0,
        totalPemasukan: 0,
        totalPengeluaran: 0,
        pemasukanKategori: {
          zakat: 0,
          infaq: 0,
          lelang: 0,
          donasi: 0
        },
        pengeluaranKategori: {
          operasional: 0,
          kegiatan: 0,
          pemeliharaan: 0,
          bantuan: 0
        }
      },
      showModal: false,
      modalType: '',
      formData:{
        tanggal: '',
        keterangan: '',
        jenis: 'masuk',
        jumlah: '',
        kategori: 'operasional'
      },
      editId: null,
    };
  }

  componentDidMount() {
    this.fetchKasData();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.selectedPeriod !== this.state.selectedPeriod) {
      this.fetchKasData();
    }
  }

getPreviousPeriod = (currentPeriod) => {
  const today = new Date();
  
  switch (currentPeriod) {
    case 'hari-ini': {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      return {
        period: 'custom',
        startDate: yesterday.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
      };
    }
    
    case 'minggu-ini': {
      const lastWeekStart = new Date(today);
      lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
      const lastWeekEnd = new Date(lastWeekStart);
      lastWeekEnd.setDate(lastWeekStart.getDate() + 7);
      return {
        period: 'custom',
        startDate: lastWeekStart.toISOString().split('T')[0],
        endDate: lastWeekEnd.toISOString().split('T')[0]
      };
    }
    
    case 'bulan-ini': {
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 1);
      return {
        period: 'custom',
        startDate: lastMonth.toISOString().split('T')[0],
        endDate: lastMonthEnd.toISOString().split('T')[0]
      };
    }
    
    case 'tahun-ini': {
      const lastYear = new Date(today.getFullYear() - 1, 0, 1);
      const lastYearEnd = new Date(today.getFullYear(), 0, 1);
      return {
        period: 'custom',
        startDate: lastYear.toISOString().split('T')[0],
        endDate: lastYearEnd.toISOString().split('T')[0]
      };
    }
    
    default:
      return null;
  }
};


fetchKasData = async () => {
  this.setState({ loading: true });
  try {
    const token = localStorage.getItem('token');
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };

    // Fetch current period data
    const [kasResponse, zakatResponse, infaqResponse, lelangResponse] = await Promise.all([
      axios.get(`http://localhost:5000/api/kas?period=${this.state.selectedPeriod}`, config),
      axios.get(`http://localhost:5000/api/kas/zakat?period=${this.state.selectedPeriod}`, config),
      axios.get(`http://localhost:5000/api/kas/infaq?period=${this.state.selectedPeriod}`, config),
      axios.get(`http://localhost:5000/api/kas/lelang?period=${this.state.selectedPeriod}`, config)
    ]);

    const kasData = kasResponse.data;
    const zakatData = zakatResponse.data;
    const infaqData = infaqResponse.data;
    const lelangData = lelangResponse.data;

    // Calculate current summary
    const summary = this.calculateSummary(kasData, zakatData, infaqData, lelangData);

    // Fetch previous period data for comparison
    const previousPeriod = this.getPreviousPeriod(this.state.selectedPeriod);
    let previousSummary = { totalSaldo: 0, totalPemasukan: 0, totalPengeluaran: 0 };
    
    if (previousPeriod) {
      try {
        const [prevKasResponse, prevZakatResponse, prevInfaqResponse, prevLelangResponse] = await Promise.all([
          axios.get(`http://localhost:5000/api/kas?startDate=${previousPeriod.startDate}&endDate=${previousPeriod.endDate}`, config),
          axios.get(`http://localhost:5000/api/kas/zakat?startDate=${previousPeriod.startDate}&endDate=${previousPeriod.endDate}`, config),
          axios.get(`http://localhost:5000/api/kas/infaq?startDate=${previousPeriod.startDate}&endDate=${previousPeriod.endDate}`, config),
          axios.get(`http://localhost:5000/api/kas/lelang?startDate=${previousPeriod.startDate}&endDate=${previousPeriod.endDate}`, config)
        ]);

        previousSummary = this.calculateSummary(
          prevKasResponse.data,
          prevZakatResponse.data,
          prevInfaqResponse.data,
          prevLelangResponse.data
        );
      } catch {
        console.log('Could not fetch previous period data, using defaults');
      }
    }

    // Calculate percentage changes
    const calculatePercentageChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const percentageChanges = {
      saldo: calculatePercentageChange(summary.totalSaldo, previousSummary.totalSaldo),
      pemasukan: calculatePercentageChange(summary.totalPemasukan, previousSummary.totalPemasukan),
      pengeluaran: calculatePercentageChange(summary.totalPengeluaran, previousSummary.totalPengeluaran)
    };

    this.setState({
      kasData,
      zakatData,
      infaqData,
      lelangData,
      summary: {
        ...summary,
        percentageChanges
      },
      loading: false
    });
  } catch (error) {
    console.error('Error fetching kas data:', error);
    this.setState({ loading: false });
  }
};

// Method untuk render percentage badge
renderPercentageBadge = (percentage) => {
  const isPositive = percentage >= 0;
  const absPercentage = Math.abs(percentage);
  
  if (absPercentage === 0) {
    return (
      <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full text-xs font-medium">
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
        No change
      </span>
    );
  }
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
      isPositive 
        ? 'bg-green-100 text-green-800' 
        : 'bg-red-100 text-red-800'
    }`}>
<svg
        className={`w-3 h-3 ${isPositive ? 'rotate-0' : 'rotate-180'}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"
        />
      </svg>
      {isPositive ? '+' : ''}{percentage.toFixed(1)}% from last {this.getPeriodText()}
    </span>
  );
};

// Helper method untuk text periode
getPeriodText = () => {
  const periodTexts = {
    'hari-ini': 'day',
    'minggu-ini': 'week', 
    'bulan-ini': 'month',
    'tahun-ini': 'year'
  };
  return periodTexts[this.state.selectedPeriod] || 'period';
};

  calculateSummary = (kasData, zakatData, infaqData, lelangData) => {
    // Calculate totals from kas table
    const totalPemasukan = kasData
      .filter(item => item.jenis === 'masuk')
      .reduce((sum, item) => sum + item.jumlah, 0);
    
    const totalPengeluaran = kasData
      .filter(item => item.jenis === 'keluar')
      .reduce((sum, item) => sum + item.jumlah, 0);

    // Calculate income from zakat, infaq, lelang
    const zakatTotal = zakatData.reduce((sum, item) => sum + item.jumlah, 0);
    const infaqTotal = infaqData.reduce((sum, item) => sum + item.jumlah, 0);
    const lelangTotal = lelangData.reduce((sum, item) => sum + item.harga_akhir || 0, 0);

    // Calculate expenses by category (you may need to add category field to kas table)
    const pengeluaranKategori = {
      operasional: kasData
        .filter(item => item.jenis === 'keluar' && item.kategori === 'operasional')
        .reduce((sum, item) => sum + item.jumlah, 0),
      kegiatan: kasData
        .filter(item => item.jenis === 'keluar' && item.kategori === 'kegiatan')
        .reduce((sum, item) => sum + item.jumlah, 0),
      pemeliharaan: kasData
        .filter(item => item.jenis === 'keluar' && item.kategori === 'pemeliharaan')
        .reduce((sum, item) => sum + item.jumlah, 0),
      bantuan: kasData
        .filter(item => item.jenis === 'keluar' && item.kategori === 'bantuan')
        .reduce((sum, item) => sum + item.jumlah, 0)
    };

    return {
      totalSaldo: totalPemasukan - totalPengeluaran + zakatTotal + infaqTotal + lelangTotal,
      totalPemasukan: totalPemasukan + zakatTotal + infaqTotal + lelangTotal,
      totalPengeluaran,
      pemasukanKategori: {
        zakat: zakatTotal,
        infaq: infaqTotal,
        lelang: lelangTotal,
        donasi: totalPemasukan
      },
      pengeluaranKategori
    };
  };

  formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  getPeriodLabel = () => {
    const labels = {
      'hari-ini': 'Hari Ini',
      'minggu-ini': 'Minggu Ini',
      'bulan-ini': 'Bulan Ini',
      'tahun-ini': 'Tahun Ini'
    };
    return labels[this.state.selectedPeriod];
  };

  openModal = (type, data = null) =>{
      if(data) {
        this.setState({
          showModal: true,
          modalType: type,
          editId: data.id,
          formData: {
            tanggal: data.tanggal,
            keterangan: data.keterangan,
            jenis: data.jenis,
            jumlah: data.jumlah,
            kategori: data.kategori || 'operasional'
          }
        });
      } else {
        this.setState({
          showModal: true,
          modalType: type,
          editId: null,
          formData: {
            tanggal: new Date().toISOString().split('T')[0],
            keterangan: '',
            jenis: type === 'add-pemasukan' ? 'masuk' : 'keluar',
            jumlah: '',
            kategori: 'operasional'
          }
        });
      }
    }

    closeModal = () => {
      this.setState({
        showModal: false,
        modalType: '',
        editId: null,
        formData: {
          tanggal: '',
          keterangan: '',
          jenis: 'masuk',
          jumlah: '',
          kategori: 'operasional'
        }
      });
    }

  handleInputChange = (e) => {
    const { name, value } = e.target;
    this.setState(prevState => ({
      formData: {
        ...prevState.formData,
        [name]: value
      }
    }));
  }


  // crud
  handleSubmit = async (e) => {
    e.preventDefault();
    const { formData, editId } = this.state;

    if (!formData.tanggal || !formData.keterangan || !formData.jenis || !formData.jumlah) {
      alert('Semua field wajib diisi');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      if (editId) {
        // Update existing entry
        await axios.put(`http://localhost:5000/api/kas/${editId}`, formData, config);
      } else {
        // Create new entry
        await axios.post('http://localhost:5000/api/kas', formData, config);
      }

      this.closeModal();
      this.fetchKasData();
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Terjadi kesalahan saat menyimpan data');
    }
  }
  handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) return;

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.delete(`http://localhost:5000/api/kas/${id}`, config);
      this.fetchKasData();
    } catch (error) {
      console.error('Error deleting data:', error);
      alert('Terjadi kesalahan saat menghapus data');
    }
  }

  render() {
    const { loading, summary, kasData, zakatData, infaqData, showModal, modalType, formData } = this.state;

    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Manajemen Kas</h2>
        <div className="flex gap-2">
          <select 
            className="border rounded-md px-3 py-2"
            value={this.state.selectedPeriod}
            onChange={(e) => this.setState({selectedPeriod: e.target.value})}
          >
            <option value="hari-ini">Hari Ini</option>
            <option value="minggu-ini">Minggu Ini</option>
            <option value="bulan-ini">Bulan Ini</option>
            <option value="tahun-ini">Tahun Ini</option>
          </select>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Laporan PDF
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['overview', 'pemasukan', 'pengeluaran', 'riwayat'].map((tab) => (
            <button
              key={tab}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                this.state.activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => this.setState({activeTab: tab})}
            >
              {tab === 'overview' && 'Ringkasan'}
              {tab === 'pemasukan' && 'Pemasukan'}
              {tab === 'pengeluaran' && 'Pengeluaran'}
              {tab === 'riwayat' && 'Riwayat Transaksi'}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {this.state.activeTab === 'overview' && (
  <div className="space-y-6">
    {/* Saldo Cards */}
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-lg border bg-gradient-to-r from-green-500 to-green-600 text-white p-6 shadow-sm">
        <div className="text-sm opacity-90">Saldo Saat Ini</div>
        <div className="mt-2 text-3xl font-bold">{this.formatCurrency(summary.totalSaldo)}</div>
        <div className="mt-2">
          {summary.percentageChanges && this.renderPercentageBadge(summary.percentageChanges.saldo)}
        </div>
      </div>
      
      <div className="rounded-lg border bg-blue-50 p-6 shadow-sm">
        <div className="text-sm text-blue-600">Total Pemasukan</div>
        <div className="mt-2 text-2xl font-bold text-blue-700">{this.formatCurrency(summary.totalPemasukan)}</div>
        <div className="mt-2">
          {summary.percentageChanges && this.renderPercentageBadge(summary.percentageChanges.pemasukan)}
        </div>
      </div>
      
      <div className="rounded-lg border bg-red-50 p-6 shadow-sm">
        <div className="text-sm text-red-600">Total Pengeluaran</div>
        <div className="mt-2 text-2xl font-bold text-red-700">{this.formatCurrency(summary.totalPengeluaran)}</div>
        <div className="mt-2">
          {summary.percentageChanges && this.renderPercentageBadge(summary.percentageChanges.pengeluaran)}
        </div>
      </div>
    </div>

          {/* Breakdown by Category */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border bg-white p-4 shadow-sm">
              <h3 className="text-lg font-medium mb-4">Pemasukan per Kategori</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Zakat</span>
                  <span className="font-medium text-green-600">{this.formatCurrency(summary.pemasukanKategori.zakat)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Infaq</span>
                  <span className="font-medium text-green-600">{this.formatCurrency(summary.pemasukanKategori.infaq)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Lelang</span>
                  <span className="font-medium text-green-600">{this.formatCurrency(summary.pemasukanKategori.lelang)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Donasi Lainnya</span>
                  <span className="font-medium text-green-600">{this.formatCurrency(summary.pemasukanKategori.donasi)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-white p-4 shadow-sm">
              <h3 className="text-lg font-medium mb-4">Pengeluaran per Kategori</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Operasional Masjid</span>
                  <span className="font-medium text-red-600">{this.formatCurrency(summary.pengeluaranKategori.operasional)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Kegiatan Masjid</span>
                  <span className="font-medium text-red-600">{this.formatCurrency(summary.pengeluaranKategori.kegiatan)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Pemeliharaan</span>
                  <span className="font-medium text-red-600">{this.formatCurrency(summary.pengeluaranKategori.pemeliharaan)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Bantuan Sosial</span>
                  <span className="font-medium text-red-600">{this.formatCurrency(summary.pengeluaranKategori.bantuan)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pemasukan Tab */}
      {this.state.activeTab === 'pemasukan' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Data Pemasukan</h3>
            <button
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              onClick={() => this.openModal('add-pemasukan')}
            >
              + Tambah Pemasukan
            </button>
          </div>
          
          <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deskripsi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {/* Data Zakat */}
                {zakatData.map((item) => (
                  <tr key={`zakat-${item.id}`}>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(item.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">Zakat {item.jenis_zakat}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.nama}</td>
                    <td className="px-6 py-4 text-sm font-medium text-green-600">{this.formatCurrency(item.jumlah)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">Auto</td>
                  </tr>
                ))}
                {/* Data Infaq */}
                {infaqData.map((item) => (
                  <tr key={`infaq-${item.id}`}>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(item.tanggal).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">Infaq</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.keterangan || item.nama_pemberi}</td>
                    <td className="px-6 py-4 text-sm font-medium text-green-600">{this.formatCurrency(item.jumlah)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">Auto</td>
                  </tr>
                ))}
                {/* Data Kas Masuk - Only these can be edited */}
                {kasData.filter(item => item.jenis === 'masuk').map((item) => (
                  <tr key={`kas-${item.id}`}>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(item.tanggal).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">Donasi</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.keterangan}</td>
                    <td className="px-6 py-4 text-sm font-medium text-green-600">{this.formatCurrency(item.jumlah)}</td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => this.openModal('edit', item)}
                          className="text-blue-600 hover:text-blue-900 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => this.handleDelete(item.id)}
                          className="text-red-600 hover:text-red-900 text-sm"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pengeluaran Tab */}
      {this.state.activeTab === 'pengeluaran' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Data Pengeluaran</h3>
            <button 
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              onClick={() => this.openModal('add-pengeluaran')}
            >
              + Tambah Pengeluaran
            </button>
          </div>
          
          <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deskripsi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {kasData.filter(item => item.jenis === 'keluar').map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(item.tanggal).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.kategori || 'Operasional'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.keterangan}</td>
                    <td className="px-6 py-4 text-sm font-medium text-red-600">{this.formatCurrency(item.jumlah)}</td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => this.openModal('edit', item)}
                          className="text-blue-600 hover:text-blue-900 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => this.handleDelete(item.id)}
                          className="text-red-600 hover:text-red-900 text-sm"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal for Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {modalType === 'edit' ? 'Edit Transaksi' :
                 modalType === 'add-pemasukan' ? 'Tambah Pemasukan' : 'Tambah Pengeluaran'}
              </h3>
              
              <form onSubmit={this.handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tanggal</label>
                  <input
                    type="date"
                    name="tanggal"
                    value={formData.tanggal}
                    onChange={this.handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Keterangan</label>
                  <input
                    type="text"
                    name="keterangan"
                    value={formData.keterangan}
                    onChange={this.handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Deskripsi transaksi"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Jumlah (Rp)</label>
                  <input
                    type="number"
                    name="jumlah"
                    value={formData.jumlah}
                    onChange={this.handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="0"
                    required
                  />
                </div>

                {formData.jenis === 'keluar' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Kategori</label>
                    <select
                      name="kategori"
                      value={formData.kategori}
                      onChange={this.handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="operasional">Operasional</option>
                      <option value="kegiatan">Kegiatan</option>
                      <option value="pemeliharaan">Pemeliharaan</option>
                      <option value="bantuan">Bantuan Sosial</option>
                    </select>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={this.closeModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    {modalType === 'edit' ? 'Update' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Riwayat Tab */}
      {this.state.activeTab === 'riwayat' && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Riwayat Semua Transaksi</h3>
          <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deskripsi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {/* Combine all transactions and sort by date */}
                {[
                  ...kasData.map(item => ({...item, type: item.jenis, source: 'kas'})),
                  ...zakatData.map(item => ({...item, type: 'masuk', source: 'zakat', tanggal: item.created_at})),
                  ...infaqData.map(item => ({...item, type: 'masuk', source: 'infaq'}))
                ]
                .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
                .map((item, index) => (
                  <tr key={`${item.source}-${item.id}-${index}`}>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(item.tanggal).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        item.type === 'masuk' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.type === 'masuk' ? 'Pemasukan' : 'Pengeluaran'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.source === 'zakat' ? `Zakat ${item.jenis_zakat}` :
                       item.source === 'infaq' ? 'Infaq' :
                       item.kategori || 'Operasional'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.keterangan || item.nama || item.nama_pemberi}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <span className={item.type === 'masuk' ? 'text-green-600' : 'text-red-600'}>
                        {item.type === 'masuk' ? '+' : '-'}{this.formatCurrency(item.jumlah)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
  }


export default Kas;