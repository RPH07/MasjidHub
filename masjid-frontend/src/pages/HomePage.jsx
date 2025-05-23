import React, { Component, useState, useEffect } from 'react';
import Navbar from '../components/nav';
import JadwalSholat from '../components/JadwalSholat';
import Footer from '../components/footer';
import { Button } from "@/components/ui/button"
import axios from 'axios';


const HomePage = () => {
  const [kegiatan, setKegiatan] = useState([]);

useEffect(() => {
    const fetchKegiatan = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/kegiatan');
        // Sort by date (newest first)
        const sortedKegiatan = res.data.sort((a, b) => {
          return new Date(b.tanggal) - new Date(a.tanggal);
        });
        setKegiatan(sortedKegiatan);
      } catch (err) {
        console.error('Gagal mengambil data kegiatan:', err);
      }
    };

    fetchKegiatan();
  }, []);
  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section
        className="bg-cover bg-center text-white py-24 text-center"
        style={{
          backgroundImage:
              "url('https://images.unsplash.com/photo-1590092794015-bce5431c83f4?q=80&w=1411&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
          }}
        >
          <div className="bg-black/60 p-10 rounded-md max-w-5xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Selamat Datang di Sistem Informasi Masjid Jami At-Taubah
            </h1>
            <p className="mb-6 text-lg">
              Pusat Informasi, Ibadah, dan Kegiatan Sosial Umat
            </p>
            <Button >
              Lihat Jadwal Sholat
            </Button>
          </div>
        </section>


        {/* Tentang Masjid */}
        <section className="py-16 px-4 md:px-12 bg-white">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          {/* <img src="/assets/about_img.png" alt="Masjid" className="rounded-lg shadow" /> */}
          <img src="https://images.unsplash.com/photo-1512970648279-ff3398568f77?q=80&w=1476&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Masjid" className='rounded-lg shadow'/>
            <div>
              <h2 className="text-3xl font-bold mb-4">Tentang Masjid</h2>
              <p className="text-gray-700 leading-relaxed">
                Masjid Al-Ikhlas telah berdiri sejak tahun 1985. Masjid ini menjadi pusat ibadah dan kegiatan keislaman
                bagi masyarakat sekitar.
              </p>
            </div>
          </div>
        </section>

        {/* Jadwal Sholat */}
        <section className="py-16 px-4 md:px-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-center">Jadwal Sholat Hari Ini</h2>
          <JadwalSholat />
        </div>
        </section>

        {/* Kegiatan Masjid */}
        <section className="py-16 px-4 md:px-12 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">Kegiatan Masjid</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {kegiatan.slice(0, 3).map((item) => (
                <div key={item.id} className="bg-gray-100 p-6 rounded shadow">
                  {item.foto && (
                    <img
                      src={`http://localhost:5000/uploads/${item.foto}`}
                      alt={item.nama_kegiatan}
                      className="w-full h-48 object-cover rounded mb-4"
                    />
                  )}
                  <h3 className="text-xl font-semibold mb-2">{item.nama_kegiatan}</h3>
                  <p className="text-sm text-gray-600 mb-1">
                    {new Date(item.tanggal).toLocaleDateString('id-ID')} - {item.lokasi}
                  </p>
                  <p className="text-gray-700">{item.deskripsi}</p>
                </div>
              ))}
            </div>
            {kegiatan.length > 3 && (
              <div className="text-center mt-8">
                <Button variant="outline" className="hover:bg-teal-50">
                  Lihat Semua Kegiatan
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Donasi */}
        <section className="bg-teal-600 text-white py-16 px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Dukung Kegiatan Masjid</h2>
          <p className="mb-6">Bantu operasional dan program sosial kami melalui donasi Anda.</p>
          <button className="bg-white text-teal-600 font-semibold px-6 py-2 rounded hover:bg-gray-100">
            Donasi Sekarang
          </button>
        </section>

        <Footer />
    </>
    );
  }

export default HomePage;
