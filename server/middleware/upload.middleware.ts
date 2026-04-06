import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Tạo thư mục uploads nếu chưa có
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình storage cho multer (cho media upload)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filter file types
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = {
    image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    audio: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/aac'],
    video: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm']
  };

  const isAllowed = Object.values(allowedTypes).flat().includes(file.mimetype);

  if (isAllowed) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} không được hỗ trợ!`), false);
  }
};

// Cấu hình multer cho media upload
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // Giới hạn 10MB
  }
});

// Cấu hình multer cho memory storage (cho pronunciation assessment)
export const uploadMemory = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req: any, file: any, cb: any) => {
    const allowedAudioTypes = [
      'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/aac',
      'audio/webm', 'audio/ogg', 'audio/opus', 'video/webm'
    ];
    if (allowedAudioTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} không được hỗ trợ cho audio!`), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // Giới hạn 10MB
  }
});

// Middleware xử lý lỗi upload
export const handleUploadError = (err: any, req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File quá lớn. Giới hạn 10MB'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Quá nhiều file. Giới hạn 1 file'
      });
    }
  }

  if (err.message.includes('không được hỗ trợ')) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  next(err);
};

// Thêm vào cuối file hiện tại

// Cấu hình multer cho document upload (Excel/CSV)
export const uploadDocument = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      const docDir = 'uploads/documents';
      if (!fs.existsSync(docDir)) {
        fs.mkdirSync(docDir, { recursive: true });
      }
      cb(null, docDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  fileFilter: (req: any, file: any, cb: any) => {
    const allowedDocTypes = [
      'application/vnd.ms-excel',                                    // .xls
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'text/csv',                                                   // .csv
      'application/csv'                                            // .csv
    ];

    if (allowedDocTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} không được hỗ trợ cho import! Chỉ hỗ trợ Excel (.xlsx, .xls) và CSV (.csv)`), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // Giới hạn 10MB
  }
});

// Middleware xử lý lỗi upload documents
export const handleDocumentUploadError = (err: any, req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File quá lớn. Giới hạn 10MB'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Quá nhiều file. Giới hạn 1 file'
      });
    }
  }

  if (err.message.includes('không được hỗ trợ cho import')) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  next(err);
};

// Cấu hình multer cho subtitle upload (.srt files)
export const uploadSubtitle = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      const subtitleDir = 'uploads/subtitles';
      if (!fs.existsSync(subtitleDir)) {
        fs.mkdirSync(subtitleDir, { recursive: true });
      }
      cb(null, subtitleDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'subtitle-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  fileFilter: (req: any, file: any, cb: any) => {
    // Accept .srt files
    if (file.originalname.toLowerCase().endsWith('.srt') || file.mimetype === 'text/plain' || file.mimetype === 'application/x-subrip') {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file .srt cho subtitle!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // Giới hạn 5MB cho subtitle files
  }
});

