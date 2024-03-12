import { Router } from "express";
import { login, logout, register } from "../controllers/register.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/register").post(
  // Using the 'upload' middleware to handle file uploads
  upload.fields([
    {
      name: "avatar", // Specifying the field name for the avatar file
      maxCount: 1, // Allowing only one file to be uploaded for the avatar
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),

  // Handling the registration process by invoking the 'register' controller
  register
);

router.route("/login").post(login);

// SECURED ROUTES

router.route("/logout").post(verifyJWT, logout);
export default router;
