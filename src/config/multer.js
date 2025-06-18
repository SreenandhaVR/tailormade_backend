const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('./config');

// Ensure upload directories exist
const createUploadDirs = () => {
  const dirs = [
    path.join(config.upload.uploadPath, 'orders'),
    path.join(config.upload.uploadPath, 'shops'),
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createUploadDirs();

// Configure storage for different upload types
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = config.upload.uploadPath;
    
    // Determine upload directory based on route
    if (req.baseUrl.includes('order')) {
      uploadPath = path.join(uploadPath, 'orders');
    } else if (req.baseUrl.includes('shop')) {
      uploadPath = path.join(uploadPath, 'shops');
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, PDFs, and documents are allowed.'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: config.upload.maxFileSize // 5MB default
  },
  fileFilter: fileFilter
});

// Specific upload configurations
const uploadSingle = upload.single('file');
const uploadMultiple = upload.array('files', 5); // Max 5 files
const uploadFields = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'documents', maxCount: 3 }
]);

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadFields
}; 