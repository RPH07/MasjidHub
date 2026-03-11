-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jul 07, 2025 at 11:40 AM
-- Server version: 11.8.2-MariaDB-log
-- PHP Version: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `masjid_db_mariadb`
--

-- --------------------------------------------------------

--
-- Table structure for table `barang_pengadaan`
--

CREATE TABLE `barang_pengadaan` (
  `id` int(11) NOT NULL,
  `nama_barang` varchar(255) NOT NULL,
  `deskripsi` text DEFAULT NULL,
  `target_dana` decimal(15,2) NOT NULL,
  `dana_terkumpul` decimal(15,2) DEFAULT 0.00,
  `total_donatur` int(11) DEFAULT 0,
  `status_pengadaan` enum('belum_terpenuhi','terpenuhi') DEFAULT 'belum_terpenuhi',
  `foto_barang` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `status` enum('draft','aktif','selesai','batal') DEFAULT 'draft',
  `kategori_barang` enum('furniture','elektronik','konstruksi','peralatan','renovasi','pembangunan','lainnya') NOT NULL,
  `deadline` date DEFAULT NULL,
  `tanggal_selesai` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `dana_awal_kas` decimal(15,2) DEFAULT 0.00 COMMENT 'Dana awal dari kas saat program dibuat',
  `dana_donasi` decimal(15,2) DEFAULT 0.00 COMMENT 'Dana yang terkumpul dari donasi'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `barang_pengadaan`
--

INSERT INTO `barang_pengadaan` (`id`, `nama_barang`, `deskripsi`, `target_dana`, `dana_terkumpul`, `total_donatur`, `status_pengadaan`, `foto_barang`, `created_at`, `status`, `kategori_barang`, `deadline`, `tanggal_selesai`, `updated_at`, `dana_awal_kas`, `dana_donasi`) VALUES
(12, 'Pintu masjid', 'SADsddadasADs', '5000000.00', '1200000.00', 0, 'belum_terpenuhi', 'program-1751312335437.jpg', '2025-06-30 19:38:57', 'batal', 'furniture', '2025-08-04', NULL, '2025-07-01 04:28:49', '200000.00', '1000000.00'),
(13, 'sound system', 'adasdsadadas', '10000000.00', '21200000.00', 0, 'terpenuhi', 'program-1751345390983.jpg', '2025-07-01 04:49:51', 'selesai', 'elektronik', '2025-09-30', '2025-07-01 04:56:41', '2025-07-01 04:56:41', '1200000.00', '20000000.00'),
(14, 'renovasi bangunan', 'asdasda', '20000000.00', '20000000.00', 0, 'terpenuhi', NULL, '2025-07-01 05:00:42', 'selesai', 'furniture', '2025-09-30', '2025-07-01 05:44:24', '2025-07-01 05:44:24', '11200000.00', '8800000.00'),
(15, 'renovasi bangunan', 'asdsdasdas', '20000000.00', '13200000.00', 0, 'belum_terpenuhi', NULL, '2025-07-01 05:36:43', 'selesai', 'furniture', '2025-09-30', '2025-07-01 08:27:39', '2025-07-01 08:27:39', '12200000.00', '1000000.00'),
(16, 'sound system', 'sdadasda', '50000000.00', '25950000.00', 0, 'belum_terpenuhi', 'program-1751633836185.jpg', '2025-07-04 12:57:16', 'aktif', 'elektronik', '2025-09-02', NULL, '2025-07-04 13:00:16', '24950000.00', '1000000.00');

--
-- Triggers `barang_pengadaan`
--
DELIMITER $$
CREATE TRIGGER `tr_barang_pengadaan_before_insert` BEFORE INSERT ON `barang_pengadaan` FOR EACH ROW BEGIN
    SET NEW.dana_terkumpul = COALESCE(NEW.dana_awal_kas, 0) + COALESCE(NEW.dana_donasi, 0);
    IF (NEW.target_dana - NEW.dana_terkumpul) <= 0 THEN
        SET NEW.status_pengadaan = 'terpenuhi';
    ELSE
        SET NEW.status_pengadaan = 'belum_terpenuhi';
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `tr_barang_pengadaan_before_update` BEFORE UPDATE ON `barang_pengadaan` FOR EACH ROW BEGIN
    SET NEW.dana_terkumpul = COALESCE(NEW.dana_awal_kas, 0) + COALESCE(NEW.dana_donasi, 0);
    IF (NEW.target_dana - NEW.dana_terkumpul) <= 0 THEN
        SET NEW.status_pengadaan = 'terpenuhi';
    ELSE
        SET NEW.status_pengadaan = 'belum_terpenuhi';
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `donasi_pengadaan`
--

CREATE TABLE `donasi_pengadaan` (
  `id` int(11) NOT NULL,
  `barang_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `nama_donatur` varchar(255) NOT NULL,
  `nominal` decimal(15,2) NOT NULL,
  `nominal_asli` decimal(15,2) DEFAULT NULL COMMENT 'Nominal donasi tanpa kode unik',
  `metode_pembayaran` enum('transfer_bank','qris','tunai','cash') NOT NULL,
  `bukti_transfer` varchar(255) DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `reject_reason` text DEFAULT NULL,
  `validated_by` int(11) DEFAULT NULL,
  `validated_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `kontak_donatur` varchar(20) DEFAULT NULL,
  `catatan` text DEFAULT NULL,
  `kode_unik` int(11) DEFAULT 0,
  `total_transfer` decimal(12,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `donasi_pengadaan`
--

INSERT INTO `donasi_pengadaan` (`id`, `barang_id`, `user_id`, `nama_donatur`, `nominal`, `nominal_asli`, `metode_pembayaran`, `bukti_transfer`, `status`, `reject_reason`, `validated_by`, `validated_at`, `created_at`, `updated_at`, `deleted_at`, `kontak_donatur`, `catatan`, `kode_unik`, `total_transfer`) VALUES
(1, 12, NULL, 'Hamba Allah', '1000000.00', NULL, 'transfer_bank', 'bukti-1751343805424.jpg', 'approved', NULL, NULL, '2025-07-01 04:23:44', '2025-07-01 04:23:25', '2025-07-01 04:23:44', NULL, NULL, NULL, 339, '1000339.00'),
(2, 13, NULL, 'Rey', '10000000.00', NULL, 'transfer_bank', 'bukti-1751345442319.jpg', 'approved', NULL, NULL, '2025-07-01 04:50:57', '2025-07-01 04:50:42', '2025-07-01 04:50:57', NULL, NULL, NULL, 345, '10000345.00'),
(3, 14, NULL, 'Rey', '1000000.00', NULL, 'transfer_bank', 'bukti-1751348100425.jpg', 'approved', NULL, NULL, '2025-07-01 05:35:23', '2025-07-01 05:35:00', '2025-07-01 05:35:23', NULL, NULL, NULL, 389, '1000389.00'),
(4, 14, NULL, 'Rey', '7800000.00', NULL, 'transfer_bank', 'bukti-1751348610175.jpg', 'rejected', 'double transaksi\n', NULL, '2025-07-01 05:43:53', '2025-07-01 05:43:31', '2025-07-01 05:43:53', NULL, NULL, 'Semoga bermanfaat', 336, '7800336.00'),
(5, 14, NULL, 'Rey', '7800000.00', NULL, 'transfer_bank', 'bukti-1751348611409.jpg', 'approved', NULL, NULL, '2025-07-01 05:43:57', '2025-07-01 05:43:31', '2025-07-01 05:43:57', NULL, NULL, 'Semoga bermanfaat', 336, '7800336.00'),
(6, 15, 21, 'reynaldi putra hasli', '1000000.00', NULL, 'transfer_bank', 'bukti-1751358248790.jpg', 'approved', NULL, NULL, '2025-07-01 08:25:04', '2025-07-01 08:24:09', '2025-07-01 08:25:04', NULL, NULL, NULL, 380, '1000380.00'),
(7, 16, NULL, 'reynaldi putra hasli', '1000000.00', NULL, 'transfer_bank', 'bukti-1751633976188.jpg', 'approved', NULL, NULL, '2025-07-04 13:00:16', '2025-07-04 12:59:36', '2025-07-04 13:00:16', NULL, NULL, 'ssas', 354, '1000354.00');

--
-- Triggers `donasi_pengadaan`
--
DELIMITER $$
CREATE TRIGGER `after_donasi_status_change_fixed` AFTER UPDATE ON `donasi_pengadaan` FOR EACH ROW BEGIN
    IF NEW.status != OLD.status THEN
        
        -- Jika status berubah menjadi approved
        IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
            INSERT INTO kas_buku_besar (
                tanggal, 
                deskripsi, 
                jenis, 
                jumlah, 
                kategori, 
                source_table, 
                source_id,
                kode_unik,
                nama_pemberi,
                metode_pembayaran,
                bukti_transfer,
                metode_input,
                created_at
            ) VALUES (
                CURDATE(),
                CONCAT('Donasi untuk program: ', (SELECT nama_barang FROM barang_pengadaan WHERE id = NEW.barang_id)),
                'masuk',
                NEW.nominal,
                'donasi',
                'donasi_pengadaan',
                NEW.id,
                NEW.kode_unik,
                NEW.nama_donatur,
                NEW.metode_pembayaran,
                NEW.bukti_transfer,
                'online',
                NOW()
            );
        END IF;
        
        -- Jika status berubah dari approved ke rejected/pending
        IF OLD.status = 'approved' AND NEW.status IN ('rejected', 'pending') THEN
            UPDATE kas_buku_besar 
            SET deleted_at = NOW() 
            WHERE source_table = 'donasi_pengadaan' 
            AND source_id = NEW.id 
            AND deleted_at IS NULL;
        END IF;
        
        -- Update dana_terkumpul di barang_pengadaan
        UPDATE barang_pengadaan 
        SET 
            dana_donasi = (
                SELECT COALESCE(SUM(d.nominal), 0)
                FROM donasi_pengadaan d
                INNER JOIN kas_buku_besar k ON k.source_table = 'donasi_pengadaan' AND k.source_id = d.id
                WHERE d.barang_id = NEW.barang_id 
                AND d.status = 'approved'
                AND k.deleted_at IS NULL
            ),
            dana_terkumpul = COALESCE(dana_awal_kas, 0) + (
                SELECT COALESCE(SUM(d.nominal), 0)
                FROM donasi_pengadaan d
                INNER JOIN kas_buku_besar k ON k.source_table = 'donasi_pengadaan' AND k.source_id = d.id
                WHERE d.barang_id = NEW.barang_id 
                AND d.status = 'approved'
                AND k.deleted_at IS NULL
            ),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.barang_id;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `infaq`
--

CREATE TABLE `infaq` (
  `id` int(11) NOT NULL,
  `nama_pemberi` varchar(100) NOT NULL,
  `jumlah` int(11) NOT NULL,
  `nominal_asli` decimal(15,2) DEFAULT NULL COMMENT 'Nominal infaq tanpa kode unik',
  `keterangan` varchar(255) DEFAULT NULL,
  `kategori_infaq` varchar(50) DEFAULT 'umum',
  `metode_pembayaran` varchar(50) DEFAULT 'tunai',
  `bukti_transfer` varchar(255) DEFAULT NULL,
  `metode_input` enum('online','manual') DEFAULT 'online',
  `status` enum('pending','approved','rejected') DEFAULT 'approved',
  `reject_reason` text DEFAULT NULL,
  `validated_by` int(11) DEFAULT NULL,
  `tanggal` timestamp NULL DEFAULT current_timestamp(),
  `validated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `infaq`
--
DELIMITER $$
CREATE TRIGGER `after_infaq_insert` AFTER INSERT ON `infaq` FOR EACH ROW BEGIN
  INSERT INTO kas_buku_besar (
    tanggal, jenis, kategori, deskripsi, jumlah,
    source_table, source_id, metode_input, metode_pembayaran,
    bukti_transfer, nama_pemberi
  ) VALUES (
    DATE(NEW.tanggal), 'masuk', 
    CONCAT('infaq_', COALESCE(NEW.kategori_infaq, 'umum')),
    CONCAT('Infaq ', UPPER(COALESCE(NEW.kategori_infaq, 'umum')), ' - ', COALESCE(NEW.keterangan, NEW.nama_pemberi)),
    NEW.jumlah, 'infaq', NEW.id, COALESCE(NEW.metode_input, 'online'),
    NEW.metode_pembayaran, NEW.bukti_transfer, NEW.nama_pemberi
  );
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `kas_buku_besar`
--

CREATE TABLE `kas_buku_besar` (
  `id` int(11) NOT NULL,
  `tanggal` date NOT NULL,
  `jenis` enum('masuk','keluar') NOT NULL,
  `kategori` varchar(50) NOT NULL,
  `deskripsi` text NOT NULL,
  `jumlah` int(11) NOT NULL,
  `kode_unik` int(11) DEFAULT NULL,
  `source_table` varchar(20) NOT NULL COMMENT 'Sumber data: zakat, infaq, lelang, manual',
  `source_id` int(11) DEFAULT NULL COMMENT 'ID dari tabel sumber',
  `metode_input` enum('online','manual') DEFAULT 'manual',
  `metode_pembayaran` varchar(50) DEFAULT NULL,
  `bukti_transfer` varchar(255) DEFAULT NULL,
  `nama_pemberi` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `kas_buku_besar`
--

INSERT INTO `kas_buku_besar` (`id`, `tanggal`, `jenis`, `kategori`, `deskripsi`, `jumlah`, `kode_unik`, `source_table`, `source_id`, `metode_input`, `metode_pembayaran`, `bukti_transfer`, `nama_pemberi`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, '2025-07-01', 'masuk', 'zakat_fitrah', 'Zakat FITRAH - Reynaldi Putra Hasli', 200000, 218, 'zakat', 1, 'online', 'transfer_bank', 'zakat-1751309058350-86174107.jpg', 'Reynaldi Putra Hasli', '2025-06-30 18:44:18', '2025-07-04 04:32:25', NULL),
(2, '2025-07-01', 'masuk', 'donasi_pengadaan', 'Donasi Hamba Allah - Program Pengadaan', 1000000, 339, 'donasi_pengadaan', 1, 'online', 'transfer_bank', 'bukti-1751343805424.jpg', 'Hamba Allah', '2025-07-01 04:23:44', '2025-07-01 04:55:20', NULL),
(3, '2025-07-01', 'masuk', 'donasi_pengadaan', 'Donasi Rey - Program Pengadaan', 10000000, 345, 'donasi_pengadaan', 2, 'online', 'transfer_bank', 'bukti-1751345442319.jpg', 'Rey', '2025-07-01 04:50:57', '2025-07-01 04:55:20', NULL),
(5, '2025-07-01', 'masuk', 'donasi', 'Donasi untuk program: renovasi bangunan', 1000000, 389, 'donasi_pengadaan', 3, 'online', 'transfer_bank', 'bukti-1751348100425.jpg', 'Rey', '2025-07-01 05:35:23', '2025-07-01 05:35:23', NULL),
(6, '2025-07-01', 'masuk', 'donasi', 'Donasi untuk program: renovasi bangunan', 7800000, 336, 'donasi_pengadaan', 5, 'online', 'transfer_bank', 'bukti-1751348611409.jpg', 'Rey', '2025-07-01 05:43:57', '2025-07-01 05:43:57', NULL),
(7, '2025-07-01', 'masuk', 'donasi', 'Donasi untuk program: renovasi bangunan', 1000000, 380, 'donasi_pengadaan', 6, 'online', 'transfer_bank', 'bukti-1751358248790.jpg', 'reynaldi putra hasli', '2025-07-01 08:25:04', '2025-07-01 08:25:04', NULL),
(8, '2025-07-04', 'masuk', 'zakat_profesi', 'Zakat PROFESI - Reynaldi Putra Hasli', 62500, 283, 'zakat', 2, 'online', 'transfer', 'zakat-1751602652900-97898546.jpg', 'Reynaldi Putra Hasli', '2025-07-04 04:17:34', '2025-07-04 04:32:25', NULL),
(9, '2025-07-04', 'masuk', 'zakat_maal', 'Zakat MAAL - Reynaldi Putra Hasli', 250000, 212, 'zakat', 3, 'online', 'transfer', 'zakat-1751603874113-11342103.jpg', 'Reynaldi Putra Hasli', '2025-07-04 04:37:54', '2025-07-04 04:37:54', NULL),
(10, '2025-07-04', 'masuk', 'zakat_maal', 'Zakat MAAL - Reynaldi Putra Hasli', 250000, 239, 'zakat', 4, 'online', 'transfer', 'zakat-1751604234997-493332763.jpg', 'Reynaldi Putra Hasli', '2025-07-04 04:43:55', '2025-07-04 04:43:55', NULL),
(11, '2025-07-04', 'masuk', 'zakat_profesi', 'Zakat PROFESI - Reynaldi Putra Hasli', 62500, 216, 'zakat', 5, 'online', 'transfer', 'zakat-1751604377925-281336563.jpg', 'Reynaldi Putra Hasli', '2025-07-04 04:46:17', '2025-07-04 04:46:17', NULL),
(12, '2025-06-30', 'masuk', 'zakat_fitrah', 'Zakat FITRAH - Reynaldi Putra Hasli', 200000, 218, 'zakat', 1, 'online', 'transfer_bank', 'zakat-1751309058350-86174107.jpg', 'Reynaldi Putra Hasli', '2025-07-04 12:53:49', '2025-07-04 12:53:49', NULL),
(13, '2025-07-04', 'masuk', 'zakat_profesi', 'Zakat PROFESI - Reynaldi Putra Hasli', 62500, 283, 'zakat', 2, 'online', 'transfer', 'zakat-1751602652900-97898546.jpg', 'Reynaldi Putra Hasli', '2025-07-04 12:53:49', '2025-07-04 12:53:49', NULL),
(14, '2025-07-04', 'masuk', 'zakat_maal', 'Zakat MAAL - Reynaldi Putra Hasli', 250000, 212, 'zakat', 3, 'online', 'transfer', 'zakat-1751603874113-11342103.jpg', 'Reynaldi Putra Hasli', '2025-07-04 12:53:49', '2025-07-04 12:53:49', NULL),
(15, '2025-07-04', 'masuk', 'zakat_maal', 'Zakat MAAL - Reynaldi Putra Hasli', 250000, 239, 'zakat', 4, 'online', 'transfer', 'zakat-1751604234997-493332763.jpg', 'Reynaldi Putra Hasli', '2025-07-04 12:53:49', '2025-07-04 12:53:49', NULL),
(16, '2025-07-04', 'masuk', 'zakat_profesi', 'Zakat PROFESI - Reynaldi Putra Hasli', 62500, 216, 'zakat', 5, 'online', 'transfer', 'zakat-1751604377925-281336563.jpg', 'Reynaldi Putra Hasli', '2025-07-04 12:53:49', '2025-07-04 12:53:49', NULL),
(17, '2025-07-04', 'masuk', 'zakat_maal', 'Zakat MAAL - Reynaldi Putra Hasli', 2500000, 230, 'zakat', 6, 'online', 'transfer', 'zakat-1751633683532-391783019.jpg', 'Reynaldi Putra Hasli', '2025-07-04 12:54:43', '2025-07-04 12:54:43', NULL),
(18, '2025-07-04', 'masuk', 'donasi', 'Donasi untuk program: sound system', 1000000, 354, 'donasi_pengadaan', 7, 'online', 'transfer_bank', 'bukti-1751633976188.jpg', 'reynaldi putra hasli', '2025-07-04 13:00:16', '2025-07-04 13:00:16', NULL),
(19, '2025-07-04', 'masuk', 'infaq_jumat', 'kdadsdwasd', 2000000, NULL, 'manual', 1, 'manual', NULL, NULL, NULL, '2025-07-04 13:06:35', '2025-07-04 13:06:35', NULL),
(20, '2025-07-04', 'masuk', 'zakat_profesi', 'Zakat PROFESI - Reynaldi Putra Hasli', 50000, 217, 'zakat', 7, 'online', 'transfer', 'zakat-1751645141536-578670350.jpg', 'Reynaldi Putra Hasli', '2025-07-04 16:05:43', '2025-07-04 16:05:43', NULL),
(21, '2025-07-04', 'masuk', 'zakat_fitrah', 'Zakat FITRAH - Reynaldi Putra Hasli', 140000, 246, 'zakat', 8, 'online', 'transfer', 'zakat-1751646636517-278728114.jpg', 'Reynaldi Putra Hasli', '2025-07-04 16:30:38', '2025-07-04 16:30:38', NULL),
(22, '2025-07-04', 'masuk', 'zakat_profesi', 'Zakat PROFESI - nenci windi pramestia', 51750, 219, 'zakat', 9, 'online', 'transfer', 'zakat-1751646771883-311598309.jpg', 'nenci windi pramestia', '2025-07-04 16:32:52', '2025-07-04 16:32:52', NULL),
(23, '2025-07-07', 'masuk', 'donasi_pembangunan', 'lorem2', 20000000, NULL, 'manual', 2, 'manual', NULL, NULL, NULL, '2025-07-07 10:18:20', '2025-07-07 10:19:01', '2025-07-07 10:19:01');

-- --------------------------------------------------------

--
-- Table structure for table `kas_manual`
--

CREATE TABLE `kas_manual` (
  `id` int(11) NOT NULL,
  `tanggal` date NOT NULL,
  `keterangan` varchar(255) DEFAULT NULL,
  `jenis` enum('masuk','keluar') NOT NULL,
  `jumlah` int(11) NOT NULL,
  `kategori` varchar(50) DEFAULT 'operasional',
  `kategori_pemasukan` varchar(50) DEFAULT 'donasi_umum',
  `nama_pemberi` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `kas_manual`
--

INSERT INTO `kas_manual` (`id`, `tanggal`, `keterangan`, `jenis`, `jumlah`, `kategori`, `kategori_pemasukan`, `nama_pemberi`, `created_at`, `deleted_at`) VALUES
(1, '2025-07-04', 'kdadsdwasd', 'masuk', 2000000, 'operasional', 'infaq_jumat', NULL, '2025-07-04 13:06:35', NULL),
(2, '2025-07-07', 'lorem2', 'masuk', 20000000, 'donasi_pembangunan', 'donasi_pembangunan', NULL, '2025-07-07 10:18:20', '2025-07-07 10:19:01');

--
-- Triggers `kas_manual`
--
DELIMITER $$
CREATE TRIGGER `after_kas_manual_delete` AFTER DELETE ON `kas_manual` FOR EACH ROW BEGIN
    UPDATE kas_buku_besar 
    SET deleted_at = NOW()
    WHERE source_table = 'manual' AND source_id = OLD.id;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_kas_manual_insert` AFTER INSERT ON `kas_manual` FOR EACH ROW BEGIN
  INSERT INTO kas_buku_besar (
    tanggal, jenis, kategori, deskripsi, jumlah,
    source_table, source_id, metode_input
  ) VALUES (
    NEW.tanggal, NEW.jenis,
    CASE 
      WHEN NEW.jenis = 'masuk' THEN COALESCE(NEW.kategori_pemasukan, 'donasi_umum')
      ELSE COALESCE(NEW.kategori, 'operasional')
    END,
    NEW.keterangan, NEW.jumlah, 'manual', NEW.id, 'manual'
  );
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_kas_manual_update` AFTER UPDATE ON `kas_manual` FOR EACH ROW BEGIN
  UPDATE kas_buku_besar SET 
    tanggal = NEW.tanggal,
    deskripsi = NEW.keterangan,
    jenis = NEW.jenis,
    jumlah = NEW.jumlah,
    kategori = NEW.kategori,
    updated_at = NOW()
  WHERE source_table = 'manual' AND source_id = NEW.id;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `kategori_kegiatan`
--

CREATE TABLE `kategori_kegiatan` (
  `id` int(11) NOT NULL,
  `nama_kategori` varchar(50) NOT NULL,
  `icon` varchar(10) DEFAULT '?',
  `warna` varchar(20) DEFAULT 'blue',
  `deskripsi` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `kategori_kegiatan`
--

INSERT INTO `kategori_kegiatan` (`id`, `nama_kategori`, `icon`, `warna`, `deskripsi`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'pengajian', '📖', 'blue', 'Kegiatan pengajian dan kajian agama', 1, '2025-07-01 09:50:35', '2025-07-01 09:50:35'),
(2, 'baksos', '🤝', 'green', 'Bakti sosial dan kegiatan kemanusiaan', 1, '2025-07-01 09:50:35', '2025-07-01 09:50:35'),
(3, 'qurban', '🐄', 'red', 'Kegiatan qurban dan hari raya', 1, '2025-07-01 09:50:35', '2025-07-01 09:50:35'),
(4, 'tarawih', '🌙', 'purple', 'Shalat tarawih dan kegiatan ramadan', 1, '2025-07-01 09:50:35', '2025-07-01 09:50:35'),
(5, 'jumat', '🕌', 'indigo', 'Shalat jumat dan khutbah', 1, '2025-07-01 09:50:35', '2025-07-01 09:50:35'),
(6, 'hari_raya', '🎉', 'yellow', 'Perayaan hari besar Islam', 1, '2025-07-01 09:50:35', '2025-07-01 09:50:35'),
(7, 'kajian', '📚', 'orange', 'Kajian dan diskusi keagamaan', 1, '2025-07-01 09:50:35', '2025-07-01 09:50:35'),
(8, 'sosial', '👥', 'pink', 'Kegiatan sosial masyarakat', 1, '2025-07-01 09:50:35', '2025-07-01 09:50:35'),
(9, 'renovasi', '🔨', 'gray', 'Renovasi dan pembangunan masjid', 1, '2025-07-01 09:50:35', '2025-07-01 09:50:35'),
(10, 'lainnya', '📋', 'slate', 'Kegiatan lainnya', 1, '2025-07-01 09:50:35', '2025-07-01 09:50:35');

-- --------------------------------------------------------

--
-- Table structure for table `kegiatan`
--

CREATE TABLE `kegiatan` (
  `id` int(11) NOT NULL,
  `nama_kegiatan` varchar(100) NOT NULL,
  `tanggal` date NOT NULL,
  `lokasi` varchar(100) NOT NULL,
  `deskripsi` text DEFAULT NULL,
  `kategori` varchar(50) DEFAULT 'pengajian',
  `foto` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `kegiatan`
--

INSERT INTO `kegiatan` (`id`, `nama_kegiatan`, `tanggal`, `lokasi`, `deskripsi`, `kategori`, `foto`) VALUES
(31, 'pengajian', '2025-07-08', 'jlj', 'Lorem ipsum dolor sit amet', 'pengajian', '1750398061090-950712701.jpg'),
(33, 'tadarus', '2025-07-16', 'Jl. lorem ipsum', 'sdadsadasdsda', 'kajian', '1751647428915-690311301.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','jamaah') NOT NULL DEFAULT 'jamaah',
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `nama`, `email`, `password`, `role`, `created_at`) VALUES
(21, 'Reynaldi Putra Hasli', 'rey@gmail.com', '$2a$10$SFbNxMeJ0.Y0vK0BcDQYL.ec5kJtWMolnJBaiEYCPHEReaSUcge76', 'jamaah', '2025-05-22 17:21:11'),
(23, 'Reynaldi Putra Hasli', 'renaldyputrahasli@gmail.com', '$2a$10$1E7FydqLZJFj5k8zbryFUeLzhlUIJDGm77nB9hfxBhEcqLODURLaC', 'admin', '2025-05-22 17:22:33'),
(25, 'nenci windi pramestia', 'nenci123@gmail.com', '$2a$10$KKW1gDn0uCR3MXE8iZjoeuD1d5kPEOpHIqcsqPC6EYeFlmrQf9FMu', 'jamaah', '2025-06-25 19:27:24');

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_kas_balance`
-- (See below for the actual view)
--
CREATE TABLE `v_kas_balance` (
`tanggal` date
,`pemasukan_hari` decimal(32,0)
,`pengeluaran_hari` decimal(32,0)
,`saldo_perubahan` decimal(33,0)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_kas_summary`
-- (See below for the actual view)
--
CREATE TABLE `v_kas_summary` (
`periode_bulan` varchar(7)
,`periode_tahun` varchar(4)
,`jenis` enum('masuk','keluar')
,`kategori` varchar(50)
,`source_table` varchar(20)
,`metode_input` enum('online','manual')
,`jumlah_transaksi` bigint(21)
,`total_jumlah` decimal(32,0)
,`tanggal_awal` date
,`tanggal_akhir` date
);

-- --------------------------------------------------------

--
-- Table structure for table `zakat`
--

CREATE TABLE `zakat` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `nama` varchar(100) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `no_telepon` varchar(20) DEFAULT NULL,
  `jenis_zakat` enum('fitrah','maal','profesi') NOT NULL,
  `jumlah_jiwa` int(11) DEFAULT NULL,
  `total_harta` decimal(15,2) DEFAULT NULL,
  `gaji_kotor` decimal(15,2) DEFAULT NULL,
  `jumlah` int(11) NOT NULL,
  `kode_unik` int(11) DEFAULT NULL,
  `total_bayar` decimal(15,2) DEFAULT NULL,
  `nominal_asli` decimal(15,2) DEFAULT NULL COMMENT 'Nominal zakat tanpa kode unik',
  `bukti_transfer` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `reject_reason` text DEFAULT NULL,
  `validated_by` int(11) DEFAULT NULL,
  `metode_pembayaran` varchar(50) DEFAULT 'transfer_bank',
  `validated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `zakat`
--

INSERT INTO `zakat` (`id`, `user_id`, `nama`, `email`, `no_telepon`, `jenis_zakat`, `jumlah_jiwa`, `total_harta`, `gaji_kotor`, `jumlah`, `kode_unik`, `total_bayar`, `nominal_asli`, `bukti_transfer`, `created_at`, `status`, `reject_reason`, `validated_by`, `metode_pembayaran`, `validated_at`) VALUES
(1, NULL, 'Reynaldi Putra Hasli', NULL, NULL, 'fitrah', NULL, NULL, NULL, 200000, 218, '200218.00', NULL, 'zakat-1751309058350-86174107.jpg', '2025-06-30 18:44:18', 'approved', NULL, NULL, 'transfer_bank', '2025-06-30 18:44:35'),
(2, NULL, 'Reynaldi Putra Hasli', 'renaldyputrahasli@gmail.com', '081295730835', 'profesi', 1, '0.00', '7000000.00', 62500, 283, '62783.00', NULL, 'zakat-1751602652900-97898546.jpg', '2025-07-04 04:17:34', 'approved', NULL, NULL, 'transfer', '2025-07-04 04:18:11'),
(3, NULL, 'Reynaldi Putra Hasli', 'renaldyputrahasli@gmail.com', '081295730835', 'maal', 1, '10000000.00', '0.00', 250000, 212, '250212.00', NULL, 'zakat-1751603874113-11342103.jpg', '2025-07-04 04:37:54', 'approved', NULL, NULL, 'transfer', '2025-07-04 04:38:19'),
(4, NULL, 'Reynaldi Putra Hasli', 'renaldyputrahasli@gmail.com', '081295730835', 'maal', 1, '10000000.00', '0.00', 250000, 239, '250239.00', NULL, 'zakat-1751604234997-493332763.jpg', '2025-07-04 04:43:55', 'rejected', 'sadasdasd', NULL, 'transfer', '2025-07-07 10:19:13'),
(5, NULL, 'Reynaldi Putra Hasli', 'renaldyputrahasli@gmail.com', '081295730835', 'profesi', 1, '0.00', '7000000.00', 62500, 216, '62716.00', NULL, 'zakat-1751604377925-281336563.jpg', '2025-07-04 04:46:17', 'rejected', 'adasdad', NULL, 'transfer', '2025-07-07 10:19:11'),
(6, NULL, 'Reynaldi Putra Hasli', 'renaldyputrahasli@gmail.com', '081295730835', 'maal', 1, '100000000.00', '0.00', 2500000, 230, '2500230.00', NULL, 'zakat-1751633683532-391783019.jpg', '2025-07-04 12:54:43', 'approved', NULL, NULL, 'transfer', '2025-07-04 12:55:03'),
(7, NULL, 'Reynaldi Putra Hasli', 'renaldyputrahasli@gmail.com', '081295730835', 'profesi', 1, '0.00', '6500000.00', 50000, 217, '50217.00', NULL, 'zakat-1751645141536-578670350.jpg', '2025-07-04 16:05:43', 'approved', NULL, NULL, 'transfer', '2025-07-04 16:07:42'),
(8, 21, 'Reynaldi Putra Hasli', 'rey@gmail.com', '0895360399322', 'fitrah', 4, '0.00', '0.00', 140000, 246, '140246.00', NULL, 'zakat-1751646636517-278728114.jpg', '2025-07-04 16:30:38', 'approved', NULL, NULL, 'transfer', '2025-07-04 16:31:24'),
(9, NULL, 'nenci windi pramestia', 'nenci@gmail.com', '07685746746', 'profesi', 1, '0.00', '6570000.00', 51750, 219, '51969.00', NULL, 'zakat-1751646771883-311598309.jpg', '2025-07-04 16:32:52', 'rejected', 'dadsd', NULL, 'transfer', '2025-07-07 10:19:08');

--
-- Triggers `zakat`
--
DELIMITER $$
CREATE TRIGGER `after_zakat_insert` AFTER INSERT ON `zakat` FOR EACH ROW BEGIN
  INSERT INTO kas_buku_besar (
    tanggal, jenis, kategori, deskripsi, jumlah, 
    kode_unik, source_table, source_id, metode_input, 
    metode_pembayaran, bukti_transfer, nama_pemberi,
    created_at
  ) VALUES (
    DATE(NEW.created_at), 'masuk', 
    CONCAT('zakat_', NEW.jenis_zakat), 
    CONCAT('Zakat ', UPPER(NEW.jenis_zakat), ' - ', NEW.nama),
    NEW.jumlah, 
    NEW.kode_unik,
    'zakat', 
    NEW.id, 
    'online', 
    NEW.metode_pembayaran, 
    NEW.bukti_transfer, 
    NEW.nama,
    NOW()
  );
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Structure for view `v_kas_balance`
--
DROP TABLE IF EXISTS `v_kas_balance`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_kas_balance`  AS SELECT `kas_buku_besar`.`tanggal` AS `tanggal`, sum(case when `kas_buku_besar`.`jenis` = 'masuk' then `kas_buku_besar`.`jumlah` else 0 end) AS `pemasukan_hari`, sum(case when `kas_buku_besar`.`jenis` = 'keluar' then `kas_buku_besar`.`jumlah` else 0 end) AS `pengeluaran_hari`, sum(case when `kas_buku_besar`.`jenis` = 'masuk' then `kas_buku_besar`.`jumlah` else -`kas_buku_besar`.`jumlah` end) AS `saldo_perubahan` FROM `kas_buku_besar` GROUP BY `kas_buku_besar`.`tanggal` ORDER BY `kas_buku_besar`.`tanggal` ASC  ;

-- --------------------------------------------------------

--
-- Structure for view `v_kas_summary`
--
DROP TABLE IF EXISTS `v_kas_summary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_kas_summary`  AS SELECT date_format(`kas_buku_besar`.`tanggal`,'%Y-%m') AS `periode_bulan`, date_format(`kas_buku_besar`.`tanggal`,'%Y') AS `periode_tahun`, `kas_buku_besar`.`jenis` AS `jenis`, `kas_buku_besar`.`kategori` AS `kategori`, `kas_buku_besar`.`source_table` AS `source_table`, `kas_buku_besar`.`metode_input` AS `metode_input`, count(0) AS `jumlah_transaksi`, sum(`kas_buku_besar`.`jumlah`) AS `total_jumlah`, min(`kas_buku_besar`.`tanggal`) AS `tanggal_awal`, max(`kas_buku_besar`.`tanggal`) AS `tanggal_akhir` FROM `kas_buku_besar` GROUP BY date_format(`kas_buku_besar`.`tanggal`,'%Y-%m'), `kas_buku_besar`.`jenis`, `kas_buku_besar`.`kategori`, `kas_buku_besar`.`source_table`, `kas_buku_besar`.`metode_input`  ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `barang_pengadaan`
--
ALTER TABLE `barang_pengadaan`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `donasi_pengadaan`
--
ALTER TABLE `donasi_pengadaan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `barang_id` (`barang_id`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- Indexes for table `infaq`
--
ALTER TABLE `infaq`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_infaq_status` (`status`,`tanggal`);

--
-- Indexes for table `kas_buku_besar`
--
ALTER TABLE `kas_buku_besar`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tanggal` (`tanggal`),
  ADD KEY `idx_jenis` (`jenis`),
  ADD KEY `idx_kategori` (`kategori`),
  ADD KEY `idx_source` (`source_table`,`source_id`),
  ADD KEY `idx_periode` (`tanggal`,`jenis`);

--
-- Indexes for table `kas_manual`
--
ALTER TABLE `kas_manual`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `kategori_kegiatan`
--
ALTER TABLE `kategori_kegiatan`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nama_kategori` (`nama_kategori`);

--
-- Indexes for table `kegiatan`
--
ALTER TABLE `kegiatan`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `zakat`
--
ALTER TABLE `zakat`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_zakat_status` (`status`,`created_at`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `barang_pengadaan`
--
ALTER TABLE `barang_pengadaan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `donasi_pengadaan`
--
ALTER TABLE `donasi_pengadaan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `infaq`
--
ALTER TABLE `infaq`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `kas_buku_besar`
--
ALTER TABLE `kas_buku_besar`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `kas_manual`
--
ALTER TABLE `kas_manual`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `kategori_kegiatan`
--
ALTER TABLE `kategori_kegiatan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `kegiatan`
--
ALTER TABLE `kegiatan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `zakat`
--
ALTER TABLE `zakat`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `donasi_pengadaan`
--
ALTER TABLE `donasi_pengadaan`
  ADD CONSTRAINT `donasi_pengadaan_ibfk_1` FOREIGN KEY (`barang_id`) REFERENCES `barang_pengadaan` (`id`),
  ADD CONSTRAINT `donasi_pengadaan_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `zakat`
--
ALTER TABLE `zakat`
  ADD CONSTRAINT `fk_zakat_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
