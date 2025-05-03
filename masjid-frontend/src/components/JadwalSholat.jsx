import React, { useEffect, useState } from 'react';

const JadwalSholat = () => {
  const [jadwal, setJadwal] = useState(null);

  useEffect(() => {
    fetch('https://api.aladhan.com/v1/timingsByCity?city=Tangerang&country=Indonesia&method=2')
      .then(res => res.json())
      .then(data => setJadwal(data.data.timings))
      .catch(err => console.error('Gagal memuat jadwal sholat:', err));
  }, []);

  if (!jadwal) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Memuat jadwal sholat...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
      {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((sholat) => (
        <div key={sholat} className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">{sholat}</h3>
          <p className="text-teal-600 font-bold">{jadwal[sholat]}</p>
        </div>
      ))}
    </div>
  );
};

export default JadwalSholat;
