import React, { useEffect, useState } from 'react';

const PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

const toMinutes = (t) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

function getActivePrayer(jadwal) {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const sorted = PRAYERS
    .map((name) => ({ name, minutes: toMinutes(jadwal[name]) }))
    .sort((a, b) => a.minutes - b.minutes);

  let active = sorted[sorted.length - 1].name; // default: Isha kalau udah lewat semua
  for (let i = 0; i < sorted.length; i++) {
    const next = sorted[i + 1];
    if (nowMinutes >= sorted[i].minutes && (!next || nowMinutes < next.minutes)) {
      active = sorted[i].name;
      break;
    }
  }
  return active;
}

const formattedDate = new Date().toLocaleDateString('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const JadwalSholat = () => {
  const [jadwal, setJadwal] = useState(null);
  const [error, setError] = useState(false);
  const [activePrayer, setActivePrayer] = useState(null);

  useEffect(() => {
    fetch('https://api.aladhan.com/v1/timingsByCity?city=Tangerang&country=Indonesia&method=2')
      .then((res) => res.json())
      .then((data) => {
        if (!data?.data?.timings) {
          throw new Error('Format jadwal sholat tidak valid');
        }
        setJadwal(data.data.timings);
      })
      .catch((err) => {
        console.error('Gagal memuat jadwal sholat:', err);
        setError(true);
      });
  }, []);

  // update highlight tiap menit biar auto-geser pas waktu sholat berganti
  useEffect(() => {
    if (!jadwal) return;

    setActivePrayer(getActivePrayer(jadwal));
    const interval = setInterval(() => {
      setActivePrayer(getActivePrayer(jadwal));
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, [jadwal]);

  if (error) {
    return (
      <div className="text-center py-10 border border-dashed border-[#1c2620]/30 bg-[#f3efe4]">
        <p className="text-[#5c6b5f] text-sm">Jadwal sholat belum bisa dimuat.</p>
      </div>
    );
  }

  if (!jadwal) {
    return (
      <div className="text-center py-10 bg-[#f3efe4]">
        <p className="text-[#5c6b5f] text-sm">Memuat jadwal sholat...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#f3efe4] px-4 py-10 sm:px-8">
      <div className="text-center mb-7">
        <p className="text-[11px] tracking-[0.14em] text-[#1f4d3a] font-medium mb-1.5">
          WAKTU IBADAH
        </p>
        <h2 className="font-serif text-3xl text-[#1c2620] mb-1.5">Jadwal sholat</h2>
        <p className="text-sm text-[#5c6b5f]">
          Wilayah Tangerang &middot; {formattedDate}
        </p>
      </div>

      <div className="max-w-3xl mx-auto border border-[#1c2620] bg-[#f3efe4] flex flex-wrap sm:flex-nowrap">
        {PRAYERS.map((sholat, i) => {
          const isActive = sholat === activePrayer;
          return (
            <div
              key={sholat}
              className={`flex-1 min-w-[20%] text-center py-4 px-2 ${
                i !== PRAYERS.length - 1 ? 'border-r border-dashed border-[#1c2620]/40' : ''
              } ${isActive ? 'bg-[#1f4d3a]' : ''}`}
            >
              <p
                className={`text-[10px] tracking-widest mb-1.5 ${
                  isActive ? 'text-[#e8ede8]' : 'text-[#5c6b5f]'
                }`}
              >
                {sholat.toUpperCase()}
                {isActive && ' \u00B7 SEKARANG'}
              </p>
              <p
                className={`font-mono text-[17px] ${
                  isActive ? 'text-[#f3efe4] font-medium' : 'text-[#1c2620]'
                }`}
              >
                {jadwal[sholat]}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default JadwalSholat;