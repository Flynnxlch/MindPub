const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadDirs = {
  books: 'uploads/books',
  covers: 'uploads/covers',
  avatars: 'uploads/avatars',
  temp: 'uploads/temp'
};

Object.values(uploadDirs).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage configuration untuk books (EPUB/PDF)
const bookStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirs.books);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'book-' + uniqueSuffix + ext);
  }
});

// Storage configuration untuk cover images
const coverStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirs.covers);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'cover-' + uniqueSuffix + ext);
  }
});

// Storage configuration untuk avatars
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirs.avatars);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'avatar-' + uniqueSuffix + ext);
  }
});

// File filter untuk books (hanya EPUB dan PDF)
const bookFileFilter = (req, file, cb) => {
  const allowedTypes = ['.epub', '.pdf'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only EPUB and PDF files are allowed'), false);
  }
};

// File filter untuk images - support berbagai format gambar
const imageFileFilter = (req, file, cb) => {
  const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg', '.tiff', '.tif', '.ico', '.img'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Only image files are allowed. Supported formats: ${allowedTypes.join(', ')}`), false);
  }
};

// Multer configurations
const uploadBook = multer({
  storage: bookStorage,
  fileFilter: bookFileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max
  }
});

const uploadCover = multer({
  storage: coverStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  }
});

const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB max
  }
});

// Combined upload untuk book + cover
const uploadBookWithCover = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === 'book') {
        cb(null, uploadDirs.books);
      } else if (file.fieldname === 'cover') {
        cb(null, uploadDirs.covers);
      } else {
        cb(null, uploadDirs.temp);
      }
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      const prefix = file.fieldname === 'book' ? 'book-' : 'cover-';
      cb(null, prefix + uniqueSuffix + ext);
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'book') {
      bookFileFilter(req, file, cb);
    } else if (file.fieldname === 'cover') {
      imageFileFilter(req, file, cb);
    } else {
      cb(null, true);
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max
  }
}).fields([
  { name: 'book', maxCount: 1 },
  { name: 'cover', maxCount: 1 }
]);

module.exports = {
  uploadBook: uploadBook.single('book'),
  uploadCover: uploadCover.single('cover'),
  uploadAvatar: uploadAvatar.single('avatar'),
  uploadBookWithCover,
  uploadDirs
};

