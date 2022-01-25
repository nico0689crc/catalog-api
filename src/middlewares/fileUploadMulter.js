const fs = require("fs");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const getDefaultConfiguration = path => {
  return multer({
    limits: 500000,
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        fs.mkdirSync(path, { recursive: true });
        cb(null, path);
      },
      filename: (req, file, cb) => {
        const ext = MIME_TYPE_MAP[file.mimetype];
        cb(null, uuidv4() + "." + ext);
      },
    }),
    fileFilter: (req, file, cb) => {
      const isValid = !!MIME_TYPE_MAP[file.mimetype];
      let error = isValid ? null : new Error("Invalid mime type!");
      cb(error, isValid);
    },
  });
};

const fileUploadProducts = getDefaultConfiguration("uploads/images/products");

module.exports = { fileUploadProducts };
