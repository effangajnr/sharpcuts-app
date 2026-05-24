const multer = require('multer');
const path = require('path');
const fs = require('fs');

/* ───────── STORAGE ───────── */
const storage = multer.diskStorage({

  destination: (req, file, cb) => {

    const folder = req.uploadFolder || 'general';

    const uploadPath = path.join(
      __dirname,
      '..',
      '..',
      'uploads',
      folder
    );

    /* CREATE FOLDER IF NOT EXISTS */
    fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {

    const uniqueName =
      Date.now() +
      '-' +
      Math.round(Math.random() * 1E9);

    cb(
      null,
      uniqueName + path.extname(file.originalname)
    );
  }
});

/* ───────── FILE FILTER ───────── */
const fileFilter = (req, file, cb) => {

  const allowed = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/jpg'
  ];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

/* ───────── MULTER ───────── */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

module.exports = upload;