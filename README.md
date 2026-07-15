# MasjidHub

MasjidHub adalah aplikasi web untuk pengelolaan informasi dan keuangan masjid. Aplikasi ini terdiri dari backend API berbasis Node.js/Express dan frontend SPA berbasis React/Vite.

Fokus utama codebase saat ini adalah pengelolaan kegiatan masjid, zakat, crowdfunding/pengadaan barang, kas masjid, verifikasi transaksi, transparansi dana, dan manajemen akses pengurus.

## Fitur

- **Autentikasi dan akses**
  - Login/register berbasis email dan password.
  - JWT access token disimpan di frontend dan dikirim sebagai `Authorization: Bearer`.
  - Role: `jamaah`, `dkm`, dan `admin`.
  - Jabatan DKM: `ketua_dkm`, `bendahara`, `sekretaris`, `anggota_dkm`.
  - Beberapa aksi sensitif dibatasi berdasarkan jabatan, misalnya approval void kas dan approval transparansi.

- **Manajemen user**
  - Admin/DKM dapat melihat user.
  - Admin dan `ketua_dkm` dapat mengatur akses sesuai batas kewenangan.
  - Reset password, ubah status user, hapus/nonaktifkan user.
  - Audit log untuk perubahan akses, status, password, dan penghapusan akun.

- **Kegiatan masjid**
  - Public dapat melihat daftar kegiatan.
  - Admin/DKM dapat membuat, mengubah, dan menghapus kegiatan.
  - Upload gambar kegiatan menggunakan Cloudinary.
  - Kategori kegiatan tersedia lewat endpoint kategori.

- **Zakat**
  - User/public dapat membuat pembayaran zakat.
  - Sistem membuat kode unik dan total transfer.
  - Upload bukti transfer.
  - Admin/DKM memverifikasi zakat pending.
  - Zakat yang disetujui otomatis masuk ke buku besar kas.

- **Pengadaan dan crowdfunding**
  - Admin/DKM membuat program pengadaan barang.
  - Public/user dapat berdonasi ke program aktif.
  - Sistem membuat kode unik dan total transfer.
  - Upload bukti transfer.
  - Admin/DKM memverifikasi donasi pending.
  - Donasi yang disetujui otomatis masuk ke buku besar kas dan memperbarui dana terkumpul program.

- **Kas masjid**
  - Ringkasan saldo, pemasukan, pengeluaran, kategori, dan statistik kode unik.
  - Riwayat transaksi kas dari zakat, donasi pengadaan, realisasi transparansi, dan input manual.
  - Input manual pemasukan/pengeluaran.
  - Void transaksi dengan alur request, approve, dan reject.
  - Export riwayat kas ke CSV/XLSX.
  - Generate laporan PDF kas.

- **Transparansi dana**
  - Public dapat melihat ringkasan zakat terkumpul, tersalurkan, dan sisa amanah.
  - Public dapat melihat transparansi realisasi program pengadaan.
  - Admin/DKM dapat membuat realisasi/penyaluran, lalu approver menyetujui atau menolak.
  - Approval transparansi membuat transaksi pengeluaran di buku besar kas.
  - PDF transparansi zakat dan program pengadaan.

- **Halaman public**
  - Homepage masjid.
  - About, contact, crowdfunding, zakat, dan transparansi.
  - Jadwal sholat diambil dari Aladhan API.

## Tech Stack

**Backend**

- Node.js
- Express
- Sequelize
- MySQL/MariaDB
- JWT (`jsonwebtoken`)
- Bcrypt.js
- Multer + `multer-storage-cloudinary`
- Cloudinary
- ExcelJS
- PDFKit/jsPDF
- Dotenv
- CORS

**Frontend**

- React
- Vite
- React Router DOM
- Axios
- Tailwind CSS v4
- shadcn-style UI primitives/Radix UI
- Lucide React
- React Hot Toast
- SweetAlert2
- Recharts
- Sentry optional

**Infrastructure**

- Docker Compose untuk MariaDB, backend, dan Cloudflare Tunnel.
- Vercel rewrite config untuk SPA frontend.

## Struktur Repo

```text
.
├── docker-compose.yml
├── db_masjidhub.sql
├── masjid-backend/
│   ├── server.js
│   ├── config/
│   │   ├── db.js
│   │   └── cloudinary.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── user.js
│   │   ├── kegiatan.js
│   │   ├── kategori-kegiatan.js
│   │   ├── zakat.js
│   │   ├── pengadaan.js
│   │   ├── kas.js
│   │   ├── kontribusi.js
│   │   └── transparansi.js
│   ├── models/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   └── *Models.js
│   └── services/
└── masjid-frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── main.jsx
    │   ├── config/api.js
    │   ├── auth/
    │   ├── pages/
    │   ├── hooks/
    │   ├── services/
    │   └── components/
    ├── vite.config.js
    └── vercel.json
```

## Backend API

Backend entry point: `masjid-backend/server.js`

Base URL default: `http://localhost:5000/api`

Route utama:

- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/register-dkm`
- `GET /api/user/me`
- `GET /api/user`
- `GET /api/kegiatan`
- `POST /api/kegiatan`
- `GET /api/kategori-kegiatan`
- `GET /api/kas/summary`
- `GET /api/kas/transactions`
- `GET /api/kas/history`
- `POST /api/kas`
- `POST /api/kas/:id/void/request`
- `POST /api/kas/:id/void/approve`
- `POST /api/zakat`
- `PATCH /api/zakat/:id/upload`
- `PUT /api/zakat/:id/validate`
- `GET /api/pengadaan`
- `POST /api/pengadaan`
- `POST /api/pengadaan/donasi`
- `PUT /api/pengadaan/donasi/:id/validate`
- `GET /api/transparansi/zakat`
- `GET /api/transparansi/pengadaan/:programId`
- `GET /api/kontribusi/history`
- `GET /api/kontribusi/summary`

## Frontend Routes

Public:

- `/`
- `/about`
- `/contact`
- `/transparansi`
- `/zakat`
- `/crowdfunding`
- `/login`
- `/signup`
- `/admin/signup`

Dashboard jamaah:

- `/dashboard`
- `/dashboard/zakat`
- `/dashboard/crowdfunding`
- `/dashboard/kegiatan`
- `/dashboard/kontribusi-history`

Dashboard pengurus/admin:

- `/admin`
- `/admin/kegiatan`
- `/admin/kas`
- `/admin/verifikasi-transaksi`
- `/admin/transparansi`
- `/admin/donasi`
- `/admin/users`

## Environment Variables

Root `.env` dipakai oleh Docker Compose. Untuk menjalankan backend dan database lewat Docker, isi minimalnya seperti ini:

```env
PORT=5000
DB_HOST=db
DB_USER=masjidhub
DB_PASSWORD=password
DB_NAME=masjidhub
JWT_SECRET=change-me
ADMIN_SECRET=change-me
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
TUNNEL_TOKEN=
```

Catatan:

- `DB_HOST=db` mengikuti nama service database di `docker-compose.yml`.
- `docker-compose.yml` membaca `DB_PASSWORD` lalu meneruskannya ke container backend sebagai `DB_PASS`.
- `TUNNEL_TOKEN` hanya dibutuhkan kalau service Cloudflare Tunnel dipakai.

Frontend membutuhkan file env di folder `masjid-frontend` jika API URL tidak memakai default:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SENTRY_DSN=
VITE_MAINTENANCE_ZAKAT=false
```

## Menjalankan Dengan Docker Compose

Backend dan database dijalankan lewat Docker. Tidak perlu menjalankan `npm run dev` manual untuk backend.

Jalankan dari root repo:

```bash
docker compose up -d --build
```

Service yang dijalankan:

- `db`: MariaDB 10.11.
- `backend`: Express API, exposed ke `http://localhost:${PORT}`.
- `cloudflare-tunnel`: Cloudflare tunnel untuk expose backend jika `TUNNEL_TOKEN` tersedia.

Command yang sering dipakai:

```bash
docker compose logs -f backend
docker compose logs -f db
docker compose restart backend
docker compose down
```

Backend container memakai `npm run dev` secara internal lewat `docker-compose.yml`, jadi perubahan source backend tetap reload dengan `nodemon`, tapi developer cukup menjalankan command Docker.

### Database Seed/Import

Jika perlu import SQL manual ke database container:

```bash
docker compose exec -T db mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < db_masjidhub.sql
```

Catatan: pastikan schema SQL sudah sesuai dengan model Sequelize terbaru sebelum dipakai untuk setup fresh.

## Menjalankan Frontend

Frontend belum didefinisikan sebagai service Docker di `docker-compose.yml`. Jalankan Vite dari folder frontend:

```bash
cd masjid-frontend
npm install
npm run dev
```

Frontend Vite berjalan di `http://localhost:5173`.

## Menjalankan Backend Tanpa Docker

Ini hanya opsi fallback untuk development manual. Untuk flow normal project ini, gunakan Docker Compose.

```bash
cd masjid-backend
npm install
npm run dev
```

## Pola Data Keuangan

Tabel penting untuk keuangan adalah `kas_buku_besar`. Transaksi yang disetujui dari zakat, donasi pengadaan, input manual, distribusi zakat, dan realisasi pengadaan akan direkam ke tabel ini.

Laporan kas dan transparansi membaca data dari ledger tersebut dengan mengabaikan transaksi yang sudah `deleted_at` atau void approved.

## Scripts

Backend:

```bash
npm run dev
npm start
```

Frontend:

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## License

ISC
