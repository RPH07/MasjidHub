const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const dotenv = require('dotenv');

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const upload = (folderName) => {
    const storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: `masjidhub/${folderName}`, 
            allowed_formats: ['jpg', 'png', 'jpeg'], 
            transformation: [{ width: 1000, crop: "limit" }]
        }
    });

    return multer({
        storage: storage,
        fileFilter: (req, file, cb) => {
            if(file.mimetype.startsWith('image/') || file.originalname.match(/\.(jpg|jpeg|png)$/)) {
                cb(null, true);
            } else {
                cb(new Error('Hanya file gambar yang diizinkan!'), false);
            }
        }
    });
}



module.exports = { cloudinary, upload };