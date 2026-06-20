const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const processProductImage = async (file) => {
  if (!file || !file.mimetype.startsWith('image/')) return null;

  const uploadDir = process.env.UPLOAD_PATH || 'uploads';
  const subDir = 'products';
  const targetDir = path.join(uploadDir, subDir);
  
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const filename = `${path.parse(file.filename).name}.webp`;
  const outputPath = path.join(targetDir, filename);

  const fileBuffer = fs.readFileSync(file.path);

  await sharp(fileBuffer)
    .resize(1200, 1200, {
      fit: 'cover',
      position: 'center'
    })
    .toFormat('webp')
    .toFile(outputPath);

  // Delete original file
  if (fs.existsSync(file.path)) {
    fs.unlinkSync(file.path);
  }

  return `/uploads/${subDir}/${filename}`;
};

module.exports = { processProductImage };
