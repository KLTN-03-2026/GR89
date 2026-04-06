const multer = require('multer');
const path = require('path');

// Cấu hình storage cho multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filter để kiểm tra loại file
const fileFilter = (req, file, cb) => {
  // Cho phép video files
  if (file.fieldname === 'video') {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file video'));
    }
  }
  // Cho phép subtitle files (.srt)
  else if (file.fieldname === 'subtitle') {
    if (file.originalname.toLowerCase().endsWith('.srt')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file .srt cho subtitle'));
    }
  }
  // Cho phép raw files (cho subtitle)
  else if (file.fieldname === 'raw') {
    cb(null, true);
  }
  // Cho phép image files
  else if (file.fieldname === 'image') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file hình ảnh'));
    }
  }
  else {
    cb(new Error('Loại file không được hỗ trợ'));
  }
};

// Cấu hình multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  }
});

// Middleware xử lý lỗi multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File quá lớn. Kích thước tối đa là 100MB'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Quá nhiều file. Chỉ được upload 1 file mỗi loại'
      });
    }
  }

  if (error.message) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  next(error);
};

module.exports = { upload, handleMulterError };
