import express from "express";
import {
  forgotPassword,
  getUserProfile,
  login,
  logout,
  profileUpdate,
  resetPassword,
  savePost,
  signup,
} from "../Controller/User.Controller.js";
import { authenticateUser } from "../MiddleWare/userAutho.js";
import upload from "../Utile/Multer.js";
import apiLimite from "../MiddleWare/rateLimites.js";
import passport from "passport";

const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    accessType: "offline",
    prompt: "consent",
  }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    console.log("Google callback hit");
    console.log("User:", req.user);

    const { token } = req.user;

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
    });

        res.redirect(`https://airbnb-colness-frontend.onrender.com/oauth-success?token=${token}`);
    }

    res.redirect(
      `https://airbnb-colness-frontend.onrender.com/oauth-success?token=${token}`,
    );
  },
);

router.post("/signup", apiLimite, signup);
router.post("/login", apiLimite, login);
router.get("/logout", logout);
router.get("/profile", authenticateUser, getUserProfile);
router.post(
  "/profile/update",
  authenticateUser,
  upload.single("profileImage"),
  profileUpdate,
);
router.post("/save/:id", authenticateUser, savePost);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);


export default router;
