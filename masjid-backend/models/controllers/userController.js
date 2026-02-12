const User = require('../UserModels');
const bcrypt = require('bcryptjs');

exports.getUser = async (req, res) => {
    try {
        const user = await User.findAll({
            attributes: ['id', 'nama', 'email', 'role', 'status']
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
            attributes: ['id', 'nama', 'email', 'role', 'status']
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