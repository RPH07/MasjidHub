const User = require('../UserModels');
const bcrypt = require('bcryptjs');

const USER_ATTRIBUTES = ['id', 'nama', 'email', 'role', 'jabatan', 'status'];
const ALLOWED_ROLES = ['admin', 'dkm', 'jamaah'];
const ALLOWED_JABATAN = ['ketua_dkm', 'bendahara', 'sekretaris', 'anggota_dkm'];

exports.getUser = async (req, res) => {
    try {
        const user = await User.findAll({
            attributes: USER_ATTRIBUTES
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.getMe = async(req, res) => {
    try {
        const user = await User.findOne({
            where: { id: req.userId},
            attributes: USER_ATTRIBUTES
        });
        if(!user) return res.status(404).json({ message: 'User tidak ditemukan' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.updateUser = async (req, res) => {
    const user = await User.findOne({
        where: { id: req.userId},
    });
    if(!user) return res.status(404).json({ message: 'User Tidak ditemukan'});

    const {nama, email, password, confPassword} = req.body;

    let hashPassword;
    if(password === '' || password === null) {
        hashPassword = user.password;
    } else {
        if(password !== confPassword) return res.status(400).json({ message: 'Password dan confirm password tidak cocok!'});
        const salt = await bcrypt.genSalt();
        hashPassword = await bcrypt.hash(password, salt);
    }

    try {
        await User.update({
            nama: nama,
            email: email,
            password: hashPassword
        }, {
            where: { id: req.userId}
        });
        res.json({ msg: 'User Updated' });
    } catch (error) {
        res.status(400).json({msg: error.message})
    }
}

exports.updateUserAccess = async (req, res) => {
    try {
        const user = await User.findOne({
            where: { id: req.params.id }
        });

        if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

        const { role, jabatan } = req.body;
        const updatePayload = {};

        if (role && !ALLOWED_ROLES.includes(role)) {
            return res.status(400).json({ msg: 'Role tidak valid' });
        }

        if (jabatan && !ALLOWED_JABATAN.includes(jabatan)) {
            return res.status(400).json({ msg: 'Jabatan tidak valid' });
        }

        if (req.role === 'admin') {
            if (role) updatePayload.role = role;

            const nextRole = role || user.role;
            if (nextRole === 'dkm') {
                updatePayload.jabatan = jabatan || user.jabatan || 'anggota_dkm';
            } else {
                updatePayload.jabatan = null;
            }
        } else if (req.role === 'dkm' && req.jabatan === 'ketua_dkm') {
            if (role) {
                return res.status(403).json({ msg: 'Ketua DKM tidak boleh mengubah role user' });
            }

            if (user.role !== 'dkm') {
                return res.status(403).json({ msg: 'Ketua DKM hanya boleh mengubah jabatan sesama DKM' });
            }

            if (jabatan === 'ketua_dkm') {
                return res.status(403).json({ msg: 'Jabatan ketua DKM hanya bisa diatur admin' });
            }

            updatePayload.jabatan = jabatan || 'anggota_dkm';
        } else {
            return res.status(403).json({ msg: 'Akses ditolak' });
        }

        await user.update(updatePayload);

        const updatedUser = await User.findByPk(user.id, {
            attributes: USER_ATTRIBUTES
        });

        res.json({
            success: true,
            msg: 'Akses user berhasil diperbarui',
            data: updatedUser
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

exports.deleteUser = async (req, res) => {
    const user = await User.findOne({
        where: {id: req.params.id}
    });
    if(!user) return res.status(404).json({ message: 'User tidak ditemukan'});

    try {
        if (req.role === "admin") {
            await User.destroy({
                where: { id: req.params.id }
            });
            res.json({msg: 'User Deleted'});
        }

        if (req.role === "dkm") {
            if (user.role == "admin" || user.role === "dkm") {
                return res.status(403).json({msg: "Anda tidak memiliki hak untuk menghapus sesama pengurus!"})
            }
            await User.update({status: 'deletion_requested'}, {
                where: { id: req.params.id}
            });
            res.json({ms: 'Permintaan penghapusan akun user telah dikirim ke admin.'})
        }
    } catch (error) {
        res.status(400).json({msg: error.message});
    }
}
