/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.16-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: masjid_db_mariadb
-- ------------------------------------------------------
-- Server version	10.11.16-MariaDB-ubu2204

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `bank_masjid`
--

DROP TABLE IF EXISTS `bank_masjid`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `bank_masjid` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nama_bank` varchar(50) NOT NULL,
  `no_rekening` varchar(50) NOT NULL,
  `atas_nama` varchar(100) NOT NULL,
  `jenis` enum('bank','ewallet','qris') DEFAULT 'bank',
  `is_active` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bank_masjid`
--

LOCK TABLES `bank_masjid` WRITE;
/*!40000 ALTER TABLE `bank_masjid` DISABLE KEYS */;
INSERT INTO `bank_masjid` VALUES
(1,'BSI','7123456789','Masjid Nurul Ilmi','bank',1),
(2,'BCA','1230009876','DKM Nurul Ilmi','bank',1),
(3,'GOPAY/QRIS','https://res.cloudinary.com/dummy/qris.jpg','Masjid Nurul Ilmi','qris',1);
/*!40000 ALTER TABLE `bank_masjid` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `barang_pengadaan`
--

DROP TABLE IF EXISTS `barang_pengadaan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `barang_pengadaan` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
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
  `dana_donasi` decimal(15,2) DEFAULT 0.00 COMMENT 'Dana yang terkumpul dari donasi',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `barang_pengadaan`
--

LOCK TABLES `barang_pengadaan` WRITE;
/*!40000 ALTER TABLE `barang_pengadaan` DISABLE KEYS */;
INSERT INTO `barang_pengadaan` VALUES
(12,'Pintu masjid','SADsddadasADs',5000000.00,1200000.00,0,'belum_terpenuhi','program-1751312335437.jpg','2025-06-30 19:38:57','batal','furniture','2025-08-04',NULL,'2025-07-01 04:28:49',200000.00,1000000.00),
(13,'sound system','adasdsadadas',10000000.00,21200000.00,0,'terpenuhi','program-1751345390983.jpg','2025-07-01 04:49:51','selesai','elektronik','2025-09-30','2025-07-01 04:56:41','2025-07-01 04:56:41',1200000.00,20000000.00),
(14,'renovasi bangunan','asdasda',20000000.00,20000000.00,0,'terpenuhi',NULL,'2025-07-01 05:00:42','selesai','furniture','2025-09-30','2025-07-01 05:44:24','2025-07-01 05:44:24',11200000.00,8800000.00),
(15,'renovasi bangunan','asdsdasdas',20000000.00,13200000.00,0,'belum_terpenuhi',NULL,'2025-07-01 05:36:43','selesai','furniture','2025-09-30','2025-07-01 08:27:39','2025-07-01 08:27:39',12200000.00,1000000.00),
(16,'sound system','sdadasda',50000000.00,25950000.00,0,'belum_terpenuhi','program-1751633836185.jpg','2025-07-04 12:57:16','aktif','elektronik','2025-09-02',NULL,'2025-07-04 13:00:16',24950000.00,1000000.00);
/*!40000 ALTER TABLE `barang_pengadaan` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `tr_barang_pengadaan_before_insert` BEFORE INSERT ON `barang_pengadaan` FOR EACH ROW BEGIN
    SET NEW.dana_terkumpul = COALESCE(NEW.dana_awal_kas, 0) + COALESCE(NEW.dana_donasi, 0);
    IF (NEW.target_dana - NEW.dana_terkumpul) <= 0 THEN
        SET NEW.status_pengadaan = 'terpenuhi';
    ELSE
        SET NEW.status_pengadaan = 'belum_terpenuhi';
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `tr_barang_pengadaan_before_update` BEFORE UPDATE ON `barang_pengadaan` FOR EACH ROW BEGIN
    SET NEW.dana_terkumpul = COALESCE(NEW.dana_awal_kas, 0) + COALESCE(NEW.dana_donasi, 0);
    IF (NEW.target_dana - NEW.dana_terkumpul) <= 0 THEN
        SET NEW.status_pengadaan = 'terpenuhi';
    ELSE
        SET NEW.status_pengadaan = 'belum_terpenuhi';
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `donasi_pengadaan`
--

DROP TABLE IF EXISTS `donasi_pengadaan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `donasi_pengadaan` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
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
  `total_transfer` decimal(12,2) DEFAULT 0.00,
  PRIMARY KEY (`id`),
  KEY `barang_id` (`barang_id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `donasi_pengadaan_ibfk_1` FOREIGN KEY (`barang_id`) REFERENCES `barang_pengadaan` (`id`),
  CONSTRAINT `donasi_pengadaan_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `donasi_pengadaan`
--

LOCK TABLES `donasi_pengadaan` WRITE;
/*!40000 ALTER TABLE `donasi_pengadaan` DISABLE KEYS */;
INSERT INTO `donasi_pengadaan` VALUES
(1,12,NULL,'Hamba Allah',1000000.00,NULL,'transfer_bank','bukti-1751343805424.jpg','approved',NULL,NULL,'2025-07-01 04:23:44','2025-07-01 04:23:25','2025-07-01 04:23:44',NULL,NULL,NULL,339,1000339.00),
(2,13,NULL,'Rey',10000000.00,NULL,'transfer_bank','bukti-1751345442319.jpg','approved',NULL,NULL,'2025-07-01 04:50:57','2025-07-01 04:50:42','2025-07-01 04:50:57',NULL,NULL,NULL,345,10000345.00),
(3,14,NULL,'Rey',1000000.00,NULL,'transfer_bank','bukti-1751348100425.jpg','approved',NULL,NULL,'2025-07-01 05:35:23','2025-07-01 05:35:00','2025-07-01 05:35:23',NULL,NULL,NULL,389,1000389.00),
(4,14,NULL,'Rey',7800000.00,NULL,'transfer_bank','bukti-1751348610175.jpg','rejected','double transaksi\n',NULL,'2025-07-01 05:43:53','2025-07-01 05:43:31','2025-07-01 05:43:53',NULL,NULL,'Semoga bermanfaat',336,7800336.00),
(5,14,NULL,'Rey',7800000.00,NULL,'transfer_bank','bukti-1751348611409.jpg','approved',NULL,NULL,'2025-07-01 05:43:57','2025-07-01 05:43:31','2025-07-01 05:43:57',NULL,NULL,'Semoga bermanfaat',336,7800336.00),
(6,15,21,'reynaldi putra hasli',1000000.00,NULL,'transfer_bank','bukti-1751358248790.jpg','approved',NULL,NULL,'2025-07-01 08:25:04','2025-07-01 08:24:09','2025-07-01 08:25:04',NULL,NULL,NULL,380,1000380.00),
(7,16,NULL,'reynaldi putra hasli',1000000.00,NULL,'transfer_bank','bukti-1751633976188.jpg','approved',NULL,NULL,'2025-07-04 13:00:16','2025-07-04 12:59:36','2025-07-04 13:00:16',NULL,NULL,'ssas',354,1000354.00);
/*!40000 ALTER TABLE `donasi_pengadaan` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `after_donasi_status_change_fixed` AFTER UPDATE ON `donasi_pengadaan` FOR EACH ROW BEGIN
    IF NEW.status != OLD.status THEN
        
        
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
        
        
        IF OLD.status = 'approved' AND NEW.status IN ('rejected', 'pending') THEN
            UPDATE kas_buku_besar 
            SET deleted_at = NOW() 
            WHERE source_table = 'donasi_pengadaan' 
            AND source_id = NEW.id 
            AND deleted_at IS NULL;
        END IF;
        
        
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
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `infaq`
--

DROP TABLE IF EXISTS `infaq`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `infaq` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
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
  `validated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_infaq_status` (`status`,`tanggal`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `infaq`
--

LOCK TABLES `infaq` WRITE;
/*!40000 ALTER TABLE `infaq` DISABLE KEYS */;
/*!40000 ALTER TABLE `infaq` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `after_infaq_insert` AFTER INSERT ON `infaq` FOR EACH ROW BEGIN
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
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `kas_buku_besar`
--

DROP TABLE IF EXISTS `kas_buku_besar`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `kas_buku_besar` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
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
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_tanggal` (`tanggal`),
  KEY `idx_jenis` (`jenis`),
  KEY `idx_kategori` (`kategori`),
  KEY `idx_source` (`source_table`,`source_id`),
  KEY `idx_periode` (`tanggal`,`jenis`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kas_buku_besar`
--

LOCK TABLES `kas_buku_besar` WRITE;
/*!40000 ALTER TABLE `kas_buku_besar` DISABLE KEYS */;
INSERT INTO `kas_buku_besar` VALUES
(1,'2025-07-01','masuk','zakat_fitrah','Zakat FITRAH - Reynaldi Putra Hasli',200000,218,'zakat',1,'online','transfer_bank','zakat-1751309058350-86174107.jpg','Reynaldi Putra Hasli','2025-06-30 18:44:18','2025-07-04 04:32:25',NULL),
(2,'2025-07-01','masuk','donasi_pengadaan','Donasi Hamba Allah - Program Pengadaan',1000000,339,'donasi_pengadaan',1,'online','transfer_bank','bukti-1751343805424.jpg','Hamba Allah','2025-07-01 04:23:44','2025-07-01 04:55:20',NULL),
(3,'2025-07-01','masuk','donasi_pengadaan','Donasi Rey - Program Pengadaan',10000000,345,'donasi_pengadaan',2,'online','transfer_bank','bukti-1751345442319.jpg','Rey','2025-07-01 04:50:57','2025-07-01 04:55:20',NULL),
(5,'2025-07-01','masuk','donasi','Donasi untuk program: renovasi bangunan',1000000,389,'donasi_pengadaan',3,'online','transfer_bank','bukti-1751348100425.jpg','Rey','2025-07-01 05:35:23','2025-07-01 05:35:23',NULL),
(6,'2025-07-01','masuk','donasi','Donasi untuk program: renovasi bangunan',7800000,336,'donasi_pengadaan',5,'online','transfer_bank','bukti-1751348611409.jpg','Rey','2025-07-01 05:43:57','2025-07-01 05:43:57',NULL),
(7,'2025-07-01','masuk','donasi','Donasi untuk program: renovasi bangunan',1000000,380,'donasi_pengadaan',6,'online','transfer_bank','bukti-1751358248790.jpg','reynaldi putra hasli','2025-07-01 08:25:04','2025-07-01 08:25:04',NULL),
(8,'2025-07-04','masuk','zakat_profesi','Zakat PROFESI - Reynaldi Putra Hasli',62500,283,'zakat',2,'online','transfer','zakat-1751602652900-97898546.jpg','Reynaldi Putra Hasli','2025-07-04 04:17:34','2025-07-04 04:32:25',NULL),
(9,'2025-07-04','masuk','zakat_maal','Zakat MAAL - Reynaldi Putra Hasli',250000,212,'zakat',3,'online','transfer','zakat-1751603874113-11342103.jpg','Reynaldi Putra Hasli','2025-07-04 04:37:54','2025-07-04 04:37:54',NULL),
(10,'2025-07-04','masuk','zakat_maal','Zakat MAAL - Reynaldi Putra Hasli',250000,239,'zakat',4,'online','transfer','zakat-1751604234997-493332763.jpg','Reynaldi Putra Hasli','2025-07-04 04:43:55','2025-07-04 04:43:55',NULL),
(11,'2025-07-04','masuk','zakat_profesi','Zakat PROFESI - Reynaldi Putra Hasli',62500,216,'zakat',5,'online','transfer','zakat-1751604377925-281336563.jpg','Reynaldi Putra Hasli','2025-07-04 04:46:17','2025-07-04 04:46:17',NULL),
(12,'2025-06-30','masuk','zakat_fitrah','Zakat FITRAH - Reynaldi Putra Hasli',200000,218,'zakat',1,'online','transfer_bank','zakat-1751309058350-86174107.jpg','Reynaldi Putra Hasli','2025-07-04 12:53:49','2025-07-04 12:53:49',NULL),
(13,'2025-07-04','masuk','zakat_profesi','Zakat PROFESI - Reynaldi Putra Hasli',62500,283,'zakat',2,'online','transfer','zakat-1751602652900-97898546.jpg','Reynaldi Putra Hasli','2025-07-04 12:53:49','2025-07-04 12:53:49',NULL),
(14,'2025-07-04','masuk','zakat_maal','Zakat MAAL - Reynaldi Putra Hasli',250000,212,'zakat',3,'online','transfer','zakat-1751603874113-11342103.jpg','Reynaldi Putra Hasli','2025-07-04 12:53:49','2025-07-04 12:53:49',NULL),
(15,'2025-07-04','masuk','zakat_maal','Zakat MAAL - Reynaldi Putra Hasli',250000,239,'zakat',4,'online','transfer','zakat-1751604234997-493332763.jpg','Reynaldi Putra Hasli','2025-07-04 12:53:49','2025-07-04 12:53:49',NULL),
(16,'2025-07-04','masuk','zakat_profesi','Zakat PROFESI - Reynaldi Putra Hasli',62500,216,'zakat',5,'online','transfer','zakat-1751604377925-281336563.jpg','Reynaldi Putra Hasli','2025-07-04 12:53:49','2025-07-04 12:53:49',NULL),
(17,'2025-07-04','masuk','zakat_maal','Zakat MAAL - Reynaldi Putra Hasli',2500000,230,'zakat',6,'online','transfer','zakat-1751633683532-391783019.jpg','Reynaldi Putra Hasli','2025-07-04 12:54:43','2025-07-04 12:54:43',NULL),
(18,'2025-07-04','masuk','donasi','Donasi untuk program: sound system',1000000,354,'donasi_pengadaan',7,'online','transfer_bank','bukti-1751633976188.jpg','reynaldi putra hasli','2025-07-04 13:00:16','2025-07-04 13:00:16',NULL),
(19,'2025-07-04','masuk','infaq_jumat','kdadsdwasd',2000000,NULL,'manual',1,'manual',NULL,NULL,NULL,'2025-07-04 13:06:35','2025-07-04 13:06:35',NULL),
(20,'2025-07-04','masuk','zakat_profesi','Zakat PROFESI - Reynaldi Putra Hasli',50000,217,'zakat',7,'online','transfer','zakat-1751645141536-578670350.jpg','Reynaldi Putra Hasli','2025-07-04 16:05:43','2025-07-04 16:05:43',NULL),
(21,'2025-07-04','masuk','zakat_fitrah','Zakat FITRAH - Reynaldi Putra Hasli',140000,246,'zakat',8,'online','transfer','zakat-1751646636517-278728114.jpg','Reynaldi Putra Hasli','2025-07-04 16:30:38','2025-07-04 16:30:38',NULL),
(22,'2025-07-04','masuk','zakat_profesi','Zakat PROFESI - nenci windi pramestia',51750,219,'zakat',9,'online','transfer','zakat-1751646771883-311598309.jpg','nenci windi pramestia','2025-07-04 16:32:52','2025-07-04 16:32:52',NULL),
(23,'2025-07-07','masuk','donasi_pembangunan','lorem2',20000000,NULL,'manual',2,'manual',NULL,NULL,NULL,'2025-07-07 10:18:20','2025-07-07 10:19:01','2025-07-07 10:19:01');
/*!40000 ALTER TABLE `kas_buku_besar` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kas_manual`
--

DROP TABLE IF EXISTS `kas_manual`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `kas_manual` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tanggal` date NOT NULL,
  `keterangan` varchar(255) DEFAULT NULL,
  `jenis` enum('masuk','keluar') NOT NULL,
  `jumlah` int(11) NOT NULL,
  `kategori` varchar(50) DEFAULT 'operasional',
  `kategori_pemasukan` varchar(50) DEFAULT 'donasi_umum',
  `nama_pemberi` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kas_manual`
--

LOCK TABLES `kas_manual` WRITE;
/*!40000 ALTER TABLE `kas_manual` DISABLE KEYS */;
INSERT INTO `kas_manual` VALUES
(1,'2025-07-04','kdadsdwasd','masuk',2000000,'operasional','infaq_jumat',NULL,'2025-07-04 13:06:35',NULL),
(2,'2025-07-07','lorem2','masuk',20000000,'donasi_pembangunan','donasi_pembangunan',NULL,'2025-07-07 10:18:20','2025-07-07 10:19:01');
/*!40000 ALTER TABLE `kas_manual` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `after_kas_manual_insert` AFTER INSERT ON `kas_manual` FOR EACH ROW BEGIN
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
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `after_kas_manual_update` AFTER UPDATE ON `kas_manual` FOR EACH ROW BEGIN
  UPDATE kas_buku_besar SET 
    tanggal = NEW.tanggal,
    deskripsi = NEW.keterangan,
    jenis = NEW.jenis,
    jumlah = NEW.jumlah,
    kategori = NEW.kategori,
    updated_at = NOW()
  WHERE source_table = 'manual' AND source_id = NEW.id;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `after_kas_manual_delete` AFTER DELETE ON `kas_manual` FOR EACH ROW BEGIN
    UPDATE kas_buku_besar 
    SET deleted_at = NOW()
    WHERE source_table = 'manual' AND source_id = OLD.id;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `kategori_kegiatan`
--

DROP TABLE IF EXISTS `kategori_kegiatan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `kategori_kegiatan` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nama_kategori` varchar(50) NOT NULL,
  `icon` varchar(10) DEFAULT '?',
  `warna` varchar(20) DEFAULT 'blue',
  `deskripsi` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `nama_kategori` (`nama_kategori`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kategori_kegiatan`
--

LOCK TABLES `kategori_kegiatan` WRITE;
/*!40000 ALTER TABLE `kategori_kegiatan` DISABLE KEYS */;
INSERT INTO `kategori_kegiatan` VALUES
(1,'pengajian','📖','blue','Kegiatan pengajian dan kajian agama',1,'2025-07-01 09:50:35','2025-07-01 09:50:35'),
(2,'baksos','🤝','green','Bakti sosial dan kegiatan kemanusiaan',1,'2025-07-01 09:50:35','2025-07-01 09:50:35'),
(3,'qurban','🐄','red','Kegiatan qurban dan hari raya',1,'2025-07-01 09:50:35','2025-07-01 09:50:35'),
(4,'tarawih','🌙','purple','Shalat tarawih dan kegiatan ramadan',1,'2025-07-01 09:50:35','2025-07-01 09:50:35'),
(5,'jumat','🕌','indigo','Shalat jumat dan khutbah',1,'2025-07-01 09:50:35','2025-07-01 09:50:35'),
(6,'hari_raya','🎉','yellow','Perayaan hari besar Islam',1,'2025-07-01 09:50:35','2025-07-01 09:50:35'),
(7,'kajian','📚','orange','Kajian dan diskusi keagamaan',1,'2025-07-01 09:50:35','2025-07-01 09:50:35'),
(8,'sosial','👥','pink','Kegiatan sosial masyarakat',1,'2025-07-01 09:50:35','2025-07-01 09:50:35'),
(9,'renovasi','🔨','gray','Renovasi dan pembangunan masjid',1,'2025-07-01 09:50:35','2025-07-01 09:50:35'),
(10,'lainnya','📋','slate','Kegiatan lainnya',1,'2025-07-01 09:50:35','2025-07-01 09:50:35'),
(11,'Jumat Berkah','?','blue',NULL,1,'2026-02-12 07:45:20','2026-02-12 07:45:20');
/*!40000 ALTER TABLE `kategori_kegiatan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kegiatan`
--

DROP TABLE IF EXISTS `kegiatan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `kegiatan` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `judul` varchar(255) NOT NULL,
  `tanggal` date NOT NULL,
  `jam` time NOT NULL,
  `lokasi` varchar(100) NOT NULL,
  `kategori_id` int(11) DEFAULT NULL,
  `deskripsi` text DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kegiatan`
--

LOCK TABLES `kegiatan` WRITE;
/*!40000 ALTER TABLE `kegiatan` DISABLE KEYS */;
INSERT INTO `kegiatan` VALUES
(31,'pengajian','2025-07-08','00:00:00','jlj',NULL,'Lorem ipsum dolor sit amet','1750398061090-950712701.jpg',0),
(33,'tadarus','2025-07-16','00:00:00','Jl. lorem ipsum',NULL,'sdadsadasdsda','1751647428915-690311301.jpg',0),
(34,'Kajian Akbar Ramadhan','2026-03-10','18:30:00','masjid lantai 1',NULL,'Bersama Ustadz Fulan',NULL,30),
(35,'Kajian Akbar Ramadhan','2026-03-10','18:30:00','masjid lantai 1',NULL,'Bersama Ustadz Fulan','https://res.cloudinary.com/ddcoyppww/image/upload/v1770877859/masjidhub/kegiatan/hbatonhnba988cfop8mt.jpg',30);
/*!40000 ALTER TABLE `kegiatan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nama` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','jamaah','dkm') NOT NULL DEFAULT 'jamaah',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `status` enum('active','deletion_requested') DEFAULT 'active',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
(21,'Reynaldi Putra Hasli','rey@gmail.com','$2a$10$SFbNxMeJ0.Y0vK0BcDQYL.ec5kJtWMolnJBaiEYCPHEReaSUcge76','jamaah','2025-05-22 17:21:11','deletion_requested'),
(23,'Reynaldi Putra Hasli','renaldyputrahasli@gmail.com','$2a$10$1E7FydqLZJFj5k8zbryFUeLzhlUIJDGm77nB9hfxBhEcqLODURLaC','admin','2025-05-22 17:22:33','active'),
(25,'nenci windi pramestia','nenci123@gmail.com','$2a$10$KKW1gDn0uCR3MXE8iZjoeuD1d5kPEOpHIqcsqPC6EYeFlmrQf9FMu','jamaah','2025-06-25 19:27:24','active'),
(26,'Reynaldi','rey@contoh.com','$2a$10$XZl4kIOQGcnoOaKMa.j62OVfTo3nISPg5UQLx15pb9xQmdMYfA/Hi','jamaah','2026-02-11 11:02:43','active'),
(27,'rey','reynaldi@contoh.com','$2a$10$NgEU9KBxVpP3YYaw7fPnBuPTJWr4cK9teLN/e8lpxurVez05dCbd2','dkm','2026-02-11 11:18:40','active'),
(28,'Dkm2','dkm@contoh.com','$2a$10$L0YCiGoC3qshpJgVTSFiA.w1v8nZtDELxHO73TgCZ6VLK5csPx32W','dkm','2026-02-11 18:16:12','active'),
(29,'nama','dkm3@contoh.com','$2a$10$iv9UpNrXu07/9Zat7yDT0.L62WAf4/MVmmN6vBvJ6IyLw4LGGOoz2','dkm','2026-02-11 18:44:19','active'),
(30,'uke','uke@contoh.com','$2a$10$0vAROfuKV8Y4URMYeX7VvO8IziyyyODyaT2ACwK4m9K0gXW45ketS','dkm','2026-02-12 04:27:28','active');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary table structure for view `v_kas_balance`
--

DROP TABLE IF EXISTS `v_kas_balance`;
/*!50001 DROP VIEW IF EXISTS `v_kas_balance`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_kas_balance` AS SELECT
 1 AS `tanggal`,
  1 AS `pemasukan_hari`,
  1 AS `pengeluaran_hari`,
  1 AS `saldo_perubahan` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_kas_summary`
--

DROP TABLE IF EXISTS `v_kas_summary`;
/*!50001 DROP VIEW IF EXISTS `v_kas_summary`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_kas_summary` AS SELECT
 1 AS `periode_bulan`,
  1 AS `periode_tahun`,
  1 AS `jenis`,
  1 AS `kategori`,
  1 AS `source_table`,
  1 AS `metode_input`,
  1 AS `jumlah_transaksi`,
  1 AS `total_jumlah`,
  1 AS `tanggal_awal`,
  1 AS `tanggal_akhir` */;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `zakat`
--

DROP TABLE IF EXISTS `zakat`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `zakat` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
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
  `validated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_zakat_status` (`status`,`created_at`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `fk_zakat_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `zakat`
--

LOCK TABLES `zakat` WRITE;
/*!40000 ALTER TABLE `zakat` DISABLE KEYS */;
INSERT INTO `zakat` VALUES
(1,NULL,'Reynaldi Putra Hasli',NULL,NULL,'fitrah',NULL,NULL,NULL,200000,218,200218.00,NULL,'zakat-1751309058350-86174107.jpg','2025-06-30 18:44:18','approved',NULL,NULL,'transfer_bank','2025-06-30 18:44:35'),
(2,NULL,'Reynaldi Putra Hasli','renaldyputrahasli@gmail.com','081295730835','profesi',1,0.00,7000000.00,62500,283,62783.00,NULL,'zakat-1751602652900-97898546.jpg','2025-07-04 04:17:34','approved',NULL,NULL,'transfer','2025-07-04 04:18:11'),
(3,NULL,'Reynaldi Putra Hasli','renaldyputrahasli@gmail.com','081295730835','maal',1,10000000.00,0.00,250000,212,250212.00,NULL,'zakat-1751603874113-11342103.jpg','2025-07-04 04:37:54','approved',NULL,NULL,'transfer','2025-07-04 04:38:19'),
(4,NULL,'Reynaldi Putra Hasli','renaldyputrahasli@gmail.com','081295730835','maal',1,10000000.00,0.00,250000,239,250239.00,NULL,'zakat-1751604234997-493332763.jpg','2025-07-04 04:43:55','rejected','sadasdasd',NULL,'transfer','2025-07-07 10:19:13'),
(5,NULL,'Reynaldi Putra Hasli','renaldyputrahasli@gmail.com','081295730835','profesi',1,0.00,7000000.00,62500,216,62716.00,NULL,'zakat-1751604377925-281336563.jpg','2025-07-04 04:46:17','rejected','adasdad',NULL,'transfer','2025-07-07 10:19:11'),
(6,NULL,'Reynaldi Putra Hasli','renaldyputrahasli@gmail.com','081295730835','maal',1,100000000.00,0.00,2500000,230,2500230.00,NULL,'zakat-1751633683532-391783019.jpg','2025-07-04 12:54:43','approved',NULL,NULL,'transfer','2025-07-04 12:55:03'),
(7,NULL,'Reynaldi Putra Hasli','renaldyputrahasli@gmail.com','081295730835','profesi',1,0.00,6500000.00,50000,217,50217.00,NULL,'zakat-1751645141536-578670350.jpg','2025-07-04 16:05:43','approved',NULL,NULL,'transfer','2025-07-04 16:07:42'),
(8,21,'Reynaldi Putra Hasli','rey@gmail.com','0895360399322','fitrah',4,0.00,0.00,140000,246,140246.00,NULL,'zakat-1751646636517-278728114.jpg','2025-07-04 16:30:38','approved',NULL,NULL,'transfer','2025-07-04 16:31:24'),
(9,NULL,'nenci windi pramestia','nenci@gmail.com','07685746746','profesi',1,0.00,6570000.00,51750,219,51969.00,NULL,'zakat-1751646771883-311598309.jpg','2025-07-04 16:32:52','rejected','dadsd',NULL,'transfer','2025-07-07 10:19:08');
/*!40000 ALTER TABLE `zakat` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `after_zakat_insert` AFTER INSERT ON `zakat` FOR EACH ROW BEGIN
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
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Final view structure for view `v_kas_balance`
--

/*!50001 DROP VIEW IF EXISTS `v_kas_balance`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_kas_balance` AS select `kas_buku_besar`.`tanggal` AS `tanggal`,sum(case when `kas_buku_besar`.`jenis` = 'masuk' then `kas_buku_besar`.`jumlah` else 0 end) AS `pemasukan_hari`,sum(case when `kas_buku_besar`.`jenis` = 'keluar' then `kas_buku_besar`.`jumlah` else 0 end) AS `pengeluaran_hari`,sum(case when `kas_buku_besar`.`jenis` = 'masuk' then `kas_buku_besar`.`jumlah` else -`kas_buku_besar`.`jumlah` end) AS `saldo_perubahan` from `kas_buku_besar` group by `kas_buku_besar`.`tanggal` order by `kas_buku_besar`.`tanggal` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_kas_summary`
--

/*!50001 DROP VIEW IF EXISTS `v_kas_summary`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_kas_summary` AS select date_format(`kas_buku_besar`.`tanggal`,'%Y-%m') AS `periode_bulan`,date_format(`kas_buku_besar`.`tanggal`,'%Y') AS `periode_tahun`,`kas_buku_besar`.`jenis` AS `jenis`,`kas_buku_besar`.`kategori` AS `kategori`,`kas_buku_besar`.`source_table` AS `source_table`,`kas_buku_besar`.`metode_input` AS `metode_input`,count(0) AS `jumlah_transaksi`,sum(`kas_buku_besar`.`jumlah`) AS `total_jumlah`,min(`kas_buku_besar`.`tanggal`) AS `tanggal_awal`,max(`kas_buku_besar`.`tanggal`) AS `tanggal_akhir` from `kas_buku_besar` group by date_format(`kas_buku_besar`.`tanggal`,'%Y-%m'),`kas_buku_besar`.`jenis`,`kas_buku_besar`.`kategori`,`kas_buku_besar`.`source_table`,`kas_buku_besar`.`metode_input` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-11  7:34:36
