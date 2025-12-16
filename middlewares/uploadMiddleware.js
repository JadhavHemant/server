const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/users"); // user images go here
  },
  filename: (req, file, cb) => {
    cb(null, "user-" + Date.now() + path.extname(file.originalname));
  },
});

const uploadUserImage = multer({ storage });

module.exports = uploadUserImage;
