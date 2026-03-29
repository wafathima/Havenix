const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../uploads/tracking");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true, mode: 0o755 });
  console.log('✅ Tracking uploads directory created at:', uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("Saving file to:", uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    
    let prefix = 'media-';
    if (file.mimetype.startsWith('image/')) {
      prefix = 'image-';
    } else if (file.mimetype.startsWith('video/')) {
      prefix = 'video-';
    }
    
    const filename = prefix + uniqueSuffix + ext;
    console.log("Generated filename:", filename);
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  console.log("Received file:", file.originalname, "MIME type:", file.mimetype);
  
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedVideoTypes = /mp4|mov|avi|mkv|webm/;
  
  const extname = path.extname(file.originalname).toLowerCase();
  const isImage = allowedImageTypes.test(extname) || file.mimetype.startsWith('image/');
  const isVideo = allowedVideoTypes.test(extname) || file.mimetype.startsWith('video/');
  
  if (isImage || isVideo) {
    cb(null, true);
  } else {
    cb(new Error("Only image and video files are allowed"));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, 
  },
  fileFilter: fileFilter,
});

module.exports = upload;