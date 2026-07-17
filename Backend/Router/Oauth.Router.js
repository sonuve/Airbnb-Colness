// import express from "express";
// import passport from "passport";

// const router = express.Router();

// router.get("/google",
//     passport.authenticate("google", { scope: ["profile", "email"] })
// );

// router.get("/google/callback",
//     passport.authenticate("google", { session: false }),
//     (req, res) => {

//         const { token, user } = req.user;

//         // 🍪 Set cookie (same as your login)
//         res.cookie("token", token, {
//             httpOnly: true,
//             secure: false,
//             sameSite: "lax",
//             maxAge: 24 * 60 * 60 * 1000,
//         });

//         // 👉 Redirect to frontend
//         res.redirect("http://localhost:5173");
//     }
// );

// export default router;