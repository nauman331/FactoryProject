const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define the uploads directory path
const uploadDir = path.join(__dirname, '..', 'uploads');

// Ensure the upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${file.fieldname}${ext}`;
    cb(null, uniqueName);
  },
});

// Define allowed MIME types
const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'application/pdf',
  'audio/mpeg',
];

// Configure file filter
const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new multer.MulterError(
        'LIMIT_UNEXPECTED_FILE',
        `Unsupported file format. Allowed formats: JPEG, PNG, PDF, MP3.`
      ),
      false
    );
  }
};

// Configure multer upload
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

module.exports = upload;
