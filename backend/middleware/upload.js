const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Unique filename: timestamp + random alphanumeric + sanitized original extension
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${cleanBase}-${uniqueSuffix}${ext}`);
  },
});

// Allowed file extensions
const ALLOWED_EXTENSIONS = ['.txt', '.md', '.json'];

// File filter
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_EXTENSIONS.includes(ext)) {
    cb(null, true);
  } else {
    req.fileValidationError = `Unsupported file type '${ext}'. Allowed document formats are: ${ALLOWED_EXTENSIONS.join(', ')}`;
    cb(null, false);
  }
};

const maxFileSizeMB = parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10);

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxFileSizeMB * 1024 * 1024, // 10MB limit
  },
});

module.exports = {
  upload,
  ALLOWED_EXTENSIONS,
  uploadDir,
};
