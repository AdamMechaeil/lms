// import multer from "multer";
// import path from "path";
// import fs from "fs";

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     let uploadPath = "assets";
//     if (file.fieldname === "profilePicture") {
//       uploadPath = path.join("assets", "profilePicture");
//     } else if (file.fieldname === "files" || file.fieldname === "materials") {
//       uploadPath = path.join("assets", "materials");
//     } else if (file.fieldname === "chatMedia") {
//       uploadPath = path.join("assets", "chat");
//     }

//     // Ensure directory exists
//     if (!fs.existsSync(uploadPath)) {
//       fs.mkdirSync(uploadPath, { recursive: true });
//     }

//     cb(null, uploadPath);
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, uniqueSuffix + path.extname(file.originalname));
//   },
// });

// export const upload = multer({ storage: storage });

import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";
import path from "path";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

const storage = multerS3({
  s3: s3,
  bucket: process.env.AWS_BUCKET_NAME as string,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  metadata: function (req, file, cb) {
    cb(null, { fieldName: file.fieldname });
  },
  key: function (req, file, cb) {
    // Organize files into folders in the bucket
    let folder = "misc";
    if (file.fieldname === "profilePicture") folder = "profile-pictures";
    else if (file.fieldname === "files" || file.fieldname === "materials")
      folder = "materials";
    else if (file.fieldname === "chatMedia") folder = "chat";

    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${folder}/${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

export const upload = multer({ storage: storage });
