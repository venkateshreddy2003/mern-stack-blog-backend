const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const cloudinaryUploadImg = require("../../utils/cloudinary");
const fs = require("fs");
//storage
const multerStorage = multer.memoryStorage();

//file type checking
const multerFilter = (req, file, cb) => {
  //check file type
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    //rejected files
    cb(
      {
        message: "Unsupported file format",
      },
      false
    );
  }
};

const photoUpload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 1000000 },
});

//Image Resizing
const profilePhotoResize = async (req, res, next) => {
  //check if there is no file
  if (!req.file) return next();
  req.file.filename = `user-${Date.now()}-${req.file.originalname}`;
  console.log(req.file.filename);
  await sharp(req.file.buffer)
    .resize(250, 250)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(path.join(`${req?.file?.filename}`));
  const imgUploaded = await cloudinaryUploadImg(
    path.join(`${req?.file?.filename}`)
  );
  console.log(__dirname);
  console.log(imgUploaded?.url);
  req.imgUploadedurl = imgUploaded?.url;
  fs.unlinkSync(req?.file?.filename);
  next();
};

//Post Image Resizing
const postImgResize = async (req, res, next) => {
  //check if there is no file
  if (!req.file) return next();
  req.file.filename = `user-${Date.now()}-${req.file.originalname}`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(path.join(`${req.file.filename}`));
  console.log(__dirname);
  next();
};
module.exports = { photoUpload, profilePhotoResize, postImgResize };
