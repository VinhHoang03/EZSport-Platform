import express from "express";
import { register } from "../controllers/auth.controller";
import { login } from "../controllers/auth.controller";
import { logoutController } from "../controllers/auth.controller";
import { googleLogin } from "../controllers/auth.controller";
import {
  forgotPassword,
  resetPassword
} from "../controllers/auth.controller";


const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google-login", googleLogin);
router.post("/logout", logoutController);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);


export default router;

