const fs = require("fs");
const multer = require("multer");
const path = require("path");

const userUploadsDir = path.join(__dirname, "..", "uploads", "users");

if (!fs.existsSync(userUploadsDir)) {
  fs.mkdirSync(userUploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, userUploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, "user-" + Date.now() + path.extname(file.originalname));
  },
});

const uploadUserImage = multer({ storage });

module.exports = uploadUserImage;
