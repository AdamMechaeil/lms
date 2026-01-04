import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = "assets";
    if (file.fieldname === "profilePicture") {
      uploadPath = path.join("assets", "profilePicture");
    } else if (file.fieldname === "files" || file.fieldname === "materials") {
      uploadPath = path.join("assets", "materials");
    } else if (file.fieldname === "chatMedia") {
      uploadPath = path.join("assets", "chat");
    }

    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

export const upload = multer({ storage: storage });
