const User = require('../UserModels');
const bcrypt = require('bcryptjs');
const userAuditLogService = require('../../services/userAuditLogService');

const USER_ATTRIBUTES = ['id', 'nama', 'email', 'role', 'jabatan', 'status'];
const ALLOWED_ROLES = ['admin', 'dkm', 'jamaah'];
const ALLOWED_JABATAN = ['ketua_dkm', 'bendahara', 'sekretaris', 'anggota_dkm'];
const ALLOWED_STATUS = ['active', 'deletion_requested', 'inactive'];

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
            if (user.role === 'admin' || user.jabatan === 'ketua_dkm') {
                return res.status(403).json({ msg: 'Ketua DKM tidak boleh mengubah admin atau ketua DKM lain' });
            }

            if (role === 'admin') {
                return res.status(403).json({ msg: 'Ketua DKM tidak boleh menjadikan user sebagai admin' });
            }

            if (role && !['dkm', 'jamaah'].includes(role)) {
                return res.status(403).json({ msg: 'Ketua DKM hanya boleh mengatur role DKM dan jamaah' });
            }

            if (jabatan === 'ketua_dkm') {
                return res.status(403).json({ msg: 'Jabatan ketua DKM hanya bisa diatur admin' });
            }

            const nextRole = role || user.role;
            updatePayload.role = nextRole;
            updatePayload.jabatan = nextRole === 'dkm'
                ? jabatan || user.jabatan || 'anggota_dkm'
                : null;
        } else {
            return res.status(403).json({ msg: 'Akses ditolak' });
        }

        const oldValue = {
            role: user.role,
            jabatan: user.jabatan
        };

        await user.update(updatePayload);

        await userAuditLogService.createUserAuditLog({
            actorUserId: req.userId,
            targetUserId: user.id,
            action: 'update_access',
            oldValue,
            newValue: {
                role: user.role,
                jabatan: user.jabatan
            },
            description: 'Mengubah role/jabatan user'
        });

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

exports.getUserAuditLogs = async(req, res) => {
    try {
        if (req.role !== 'admin') {
            return res.status(403).json({ msg: 'Akses Terlarang! Khusus Admin.' });
        }

        const data = await userAuditLogService.getUserAuditLogs(req.query);

        res.json({
            success: true,
            msg: 'Log aktivitas user berhasil diambil',
            data
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

exports.updateUserStatus = async (req, res) => {
    try {
        const user = await User.findOne({
            where: { id: req.params.id }
        });

        if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

        const { status } = req.body;
        if (!ALLOWED_STATUS.includes(status)) {
            return res.status(400).json({ msg: 'Status tidak valid' });
        }

        const oldValue = {
            status: user.status
        };

        if (req.role === 'admin') {
            await user.update({ status });
        } else if (req.role === 'dkm' && req.jabatan === 'ketua_dkm') {
            if (user.role !== 'dkm') {
                return res.status(403).json({ msg: 'Ketua DKM hanya boleh mengubah status sesama DKM' });
            }

            if (status === 'deletion_requested') {
                return res.status(403).json({ msg: 'Ketua DKM hanya boleh menyetujui atau menolak permintaan penghapusan' });
            }

            await user.update({ status });
        } else {
            return res.status(403).json({ msg: 'Akses ditolak' });
        }

        await userAuditLogService.createUserAuditLog({
            actorUserId: req.userId,
            targetUserId: user.id,
            action: 'update_status',
            oldValue,
            newValue: {
                status: user.status
            },
            description: 'Mengubah status user'
        });

        const updatedUser = await User.findByPk(user.id, {
            attributes: USER_ATTRIBUTES
        });

        res.json({
            success: true,
            msg: 'Status user berhasil diperbarui',
            data: updatedUser
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

exports.resetUserPassword = async (req, res) => {
    try {
        const user = await User.findOne({
            where: { id: req.params.id }
        });

        if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

        const { password, confirmPassword } = req.body;

        if (!password || password.length < 6) {
            return res.status(400).json({ msg: 'Password baru minimal 6 karakter' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ msg: 'Password dan konfirmasi password tidak cocok' });
        }

        if (req.role === 'admin') {
            // Admin boleh reset semua user.
        } else if (req.role === 'dkm' && req.jabatan === 'ketua_dkm') {
            if (user.role !== 'dkm') {
                return res.status(403).json({ msg: 'Ketua DKM hanya boleh reset password sesama DKM' });
            }
        } else {
            return res.status(403).json({ msg: 'Akses ditolak' });
        }

        const salt = await bcrypt.genSalt();
        const hashPassword = await bcrypt.hash(password, salt);

        await user.update({ password: hashPassword });

        await userAuditLogService.createUserAuditLog({
            actorUserId: req.userId,
            targetUserId: user.id,
            action: 'reset_password',
            oldValue: null,
            newValue: null,
            description: 'Reset password user'
        });

        res.json({
            success: true,
            msg: 'Password user berhasil direset'
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

exports.deleteMe = async (req, res) => {
    try {
        const user = await User.findByPk(req.userId);
        if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

        if (user.role === 'jamaah') {
            await user.destroy();
            await userAuditLogService.createUserAuditLog({
                actorUserId: req.userId,
                targetUserId: user.id,
                action: 'delete_user',
                oldValue: {
                    role: user.role,
                    jabatan: user.jabatan,
                    status: user.status
                },
                newValue: null,
                description: 'User jamaah menghapus akun sendiri'
            });
            return res.json({ success: true, msg: 'Akun jamaah berhasil dihapus' });
        }

        if (user.role === 'dkm') {
            await user.update({ status: 'deletion_requested' });
            await userAuditLogService.createUserAuditLog({
                actorUserId: req.userId,
                targetUserId: user.id,
                action: 'delete_me_request',
                oldValue: {
                    status: 'active'
                },
                newValue: {
                    status: 'deletion_requested'
                },
                description: 'Pengurus meminta penghapusan akun'
            });
            return res.json({
                success: true,
                msg: 'Permintaan penghapusan akun pengurus berhasil dikirim ke ketua DKM'
            });
        }

        return res.status(403).json({ msg: 'Admin tidak dapat menghapus akun sendiri dari endpoint ini' });
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
            if (user.role === 'jamaah') {
                const oldValue = {
                    role: user.role,
                    jabatan: user.jabatan,
                    status: user.status
                };

                await User.destroy({
                    where: { id: req.params.id }
                });

                await userAuditLogService.createUserAuditLog({
                    actorUserId: req.userId,
                    targetUserId: user.id,
                    action: 'delete_user',
                    oldValue,
                    newValue: null,
                    description: 'Admin menghapus akun jamaah'
                });

                return res.json({msg: 'User jamaah berhasil dihapus'});
            }

            const oldValue = {
                status: user.status
            };

            await User.update({status: 'inactive'}, {
                where: { id: req.params.id }
            });

            await userAuditLogService.createUserAuditLog({
                actorUserId: req.userId,
                targetUserId: user.id,
                action: 'delete_user',
                oldValue,
                newValue: {
                    status: 'inactive'
                },
                description: 'Admin menonaktifkan akun pengurus'
            });

            return res.json({msg: 'User pengurus berhasil dinonaktifkan'});
        }

        return res.status(403).json({msg: 'Hanya admin yang dapat menghapus atau menonaktifkan user lain'});
    } catch (error) {
        res.status(400).json({msg: error.message});
    }
}
