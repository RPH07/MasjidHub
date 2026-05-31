const barangPengadaanService = require("../../services/barangPengadaanService");

const validateCreatePayload = (payload) => {
    if (!payload.nama_barang) return "Nama barang wajib diisi";
    if (!payload.target_dana) return "Target dana wajib diisi";
    if (!payload.kategori_barang) return "Kategori barang wajib diisi";
    return null;
};

exports.createBarangPengadaan = async (req, res, next) => {
    try {
        const validationError = validateCreatePayload(req.body);
        if (validationError) {
            return res.status(400).json({
                success: false,
                msg: validationError,
            });
        }

        const data = await barangPengadaanService.createBarangPengadaan({
            ...req.body,
            foto_barang: req.file?.path || req.body.foto_barang || null,
        });
        res.status(201).json({
            success: true,
            msg: "Program Pengadaan berhasil dibuat",
            data,
        });
    } catch (error) {
        res.status(error.status || 500).json({
            success: false,
            msg: "Gagal membuat Program Pengadaan",
            error: error.message,
        });
    }
};

exports.updateProgramPengadaan = async (req, res) => {
    try {
        const data = await barangPengadaanService.updateProgramPengadaan(
            req.params.id,
            {
                ...req.body,
                foto_barang: req.file?.path || req.body.foto_barang,
            },
        );
        res.json({
            success: true,
            msg: "Program Pengadaan berhasil diperbarui",
            data,
        });
    } catch (error) {
        res.status(error.status || 500).json({
            success: false,
            msg: "Gagal memperbarui Program Pengadaan",
            error: error.message,
        });
    }
};

exports.changeProgramStatus = async(req, res) => {
    try {
        const data = await barangPengadaanService.changeProgramStatus(
            req.params.id, 
            req.body.status
        );
        res.json({
            success: true, 
            msg: "Status Program Pengadaan berhasil diubah",
            data,
        });
    } catch (error) {
        res.status(error.status || 500).json({
            success: false,
            msg: "Gagal mengubah status Program Pengadaan",
            error: error.message,
        })
    }
};

exports.getProgramPengadaanList = async(req, res) => {
    try {
        const data = await barangPengadaanService.getProgramPengadaanList(req.query);
        res.json({
            success: true,
            msg: "Daftar Program Pengadaan berhasil diambil",
            data,
        });
    } catch (error) {
        res.status(error.status || 500).json({
            success: false,
            msg: "Gagal mengambil daftar Program Pengadaan",
            error: error.message,
        });
    }
};

exports.getProgramPengadaanById = async(req, res) => {
    try {
        const data = await barangPengadaanService.getProgramPengadaanById(req.params.id);

        res.json({
            success: true,
            msg: "Program Pengadaan berhasil diambil",
            data,
        });
    } catch (error) {
        res.status(error.status || 500).json({
            success: false,
            msg: "Gagal mengambil Program Pengadaan",
            error: error.message,
        });
    }
};
