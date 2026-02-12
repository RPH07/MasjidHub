const User = require('../UserModels');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    try {
        const user = await User.findOne({
            where: {
                email: req.body.email
            }
        });

        if (!user) return res.status(404).json({ message: "User tidak dapat ditemukan" });

        const match = await bcrypt.compare(req.body.password, user.password);
        if (!match) return res.status(400).json({ message: "Password yang dimasukkan salah" });

        // Generate Token
        const userId = user.id;
        const nama = user.nama;
        const email = user.email;
        const role = user.role;

        const accessToken = jwt.sign({ userId, nama, email, role }, process.env.JWT_SECRET, {
            expiresIn: '1d'
        });

        res.json({ accessToken });

    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

exports.registerUser = async (req, res) => {
    const { nama, email, password, confirmPassword } = req.body;

    if(!email || !password) return res.status(400).json({msg: "Email dan Password wajib diisi"});

    if (password !== confirmPassword) {
        return res.status(400).json({ message: "Password dan Confirm Password tidak cocok" });
    }

    try {
        // Cek duplikat
        const exist = await User.findOne({ where: { email: email } });
        if (exist) return res.status(400).json({ message: "Email sudah terdaftar" });

        const salt = await bcrypt.genSalt();
        const hashPassword = await bcrypt.hash(password, salt);

        await User.create({
            nama: nama,
            email: email,
            password: hashPassword,
            role: 'jamaah'
        });

        res.json({ message: "Registrasi Akun Jamaah Berhasil" });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

exports.registerDkm = async (req, res) => {
    const {nama, email, password, confirmPassword, secret} = req.body;
    if (password !== confirmPassword) {
        return res.status(400).json({ message: "Password dan Confirm Password tidak cocok" });
    }

    if (secret !== process.env.ADMIN_SECRET) {
        return res.status(403).json({message: "Kode rahasia DKM Salah!"});
    }
    try {
        const salt = await bcrypt.genSalt();
        const hashPassword = await bcrypt.hash(password, salt);
        const exist = await User.findOne({where: {email: email}});
        if(exist) {
            return res.status(400).json({message: "email sudah terdaftar"});
        }

        await User.create({
            nama: nama,
            email: email,
            password: hashPassword,
            role: 'dkm'
        });

        res.json({ message: "Registrasi Akun DKM Berhasil"});
    } catch (error) {
        // Handle email duplikat
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: "Email sudah terdaftar" });
        }
        res.status(500).json({ msg: error.message});
    }
}