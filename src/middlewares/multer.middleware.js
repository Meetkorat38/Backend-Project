import multer from "multer";

const storage = multer.diskStorage({
  // destination: Specifies the directory where uploaded files will be stored. In this case, it's set to "/public/temp".
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },

  // filename: Specifies the name of the uploaded file. Here, it uses the original name of the file.
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

export { upload };
