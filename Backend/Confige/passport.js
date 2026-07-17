import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../Model/User.Model.js";
import jwt from "jsonwebtoken";

passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/api/users/google/callback"
    },
    async(accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails[0].value;

            // 🔍 Check if user already exists
            let user = await User.findOne({ email });

            if (!user) {
                // 👉 Create new user
                user = await User.create({
                    name: profile.displayName,
                    email,
                    googleId: profile.id,
                });
            }

            // 🎯 Generate SAME JWT like your login
            const token = jwt.sign({ id: user._id },
                process.env.JWT_SECRET, { expiresIn: "1d" }
            );

            return done(null, { user, token });

        } catch (error) {
            return done(error, null);
        }
    }));