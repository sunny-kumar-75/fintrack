import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

import fs from 'fs';
import path from 'path';

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

let storage;

if (process.env.CLOUDINARY_CLOUD_NAME) {
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'fintrack/receipts',
      allowedFormats: ['jpg', 'png', 'jpeg', 'webp', 'pdf', 'doc', 'docx'],
      resource_type: 'auto',
    },
  });
} else {
  
  storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });
}

const upload = multer({ storage: storage });

export default upload;
