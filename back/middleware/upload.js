const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = process.env.UPLOAD_PATH || 'uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const sub = req.uploadSubDir || 'general';
    const dir = path.join(uploadDir, sub);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random()*1e6)}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'videos') {
    const allowed = /mp4|webm|ogg|mov|avi|mkv/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = file.mimetype.startsWith('video/');
    cb(null, ext && mime);
  } else {
    const allowed = /jpeg|jpg|png|gif|webp|svg/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    cb(null, ext && mime);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 50 * 1024 * 1024 } });

module.exports = upload;
