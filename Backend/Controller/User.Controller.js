import User from "../Model/User.Model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import crypto from "crypto";
import nodemailer from "nodemailer";
import client from "../Confige/Redis.js";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "User with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    const isProd = process.env.NODE_ENV === "production";

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "None" : "Lax",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      message: "User registered successfully",
      success: true,
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Signup failed",
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // 🔥 FIX: handle Google users
    if (!user.password) {
      return res.status(400).json({
        message: "Please login with Google",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    const isProd = process.env.NODE_ENV === "production";

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "None" : "Lax",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "User logged in successfully",
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);

    user.resetOtp = otp;
    user.resetOtpExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    // ✅ SEND EMAIL HERE
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      html: `
                <h2>Your OTP is: ${otp}</h2>
                <p>This OTP will expire in 10 minutes</p>
            `,
    });

    return res.status(200).json({
      message: "OTP sent successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error sending OTP",
      error: error.message,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    const user = await User.findOne({
      email,
      resetOtp: otp,
      resetOtpExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired OTP",
      });
    }

    // 🔐 Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetOtp = undefined;
    user.resetOtpExpire = undefined;

    // ✅ SAVE FIRST
    await user.save();

    // 🔥 THEN CLEAR CACHE
    await client.del(`user:profile:${user._id}`);

    return res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const logout = async (req, res) => {
  const isProd = process.env.NODE_ENV === "production";

  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: isProd ? "None" : "lax",
    path: "/",
  });

  return res.status(200).json({
    success: true,
    message: "Logout successful",
  });
};

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    //check redis
    const cacheKey = `user:profile:${userId}`;

    // Try to get profile from Redis cache
    const cachedProfile = await client.get(cacheKey);

    // If profile is in cache, return it
    if (cachedProfile) {
      console.log("Cache hit for user profile");
      return res.status(200).json({
        success: true,
        source: "cache",
        user: JSON.parse(cachedProfile),
      });
    }
    console.log("Cache miss for user profile");

    console.log(userId);

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    //Store in Redis (10 min)
    await client.setEx(cacheKey, 600, JSON.stringify(user.toObject()));

    return res.status(200).json({
      message: " User profile fetched successfully",
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch user profile",
      error: error.message,
    });
  }
};

export const profileUpdate = async (req, res) => {
  const userId = req.user._id;
  const { name, email } = req.body;

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  if (name) user.name = name;
  if (email) user.email = email;

  //profile picture add
  if (req.file) {
    user.profileImage = req.file.path;
  }

  await user.save();

  // Invalidate Redis cache
  await client.del(`user:profile:${userId}`);

  return res.status(200).json({
    message: "Profile updated successfully",
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
    },
  });
};

// savePost.controller.js
export const savePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const postId = req.params.id;
    const cacheKey = `user:savepost:${userId}`;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    const isSaved = user.savePost.includes(postId);

    if (isSaved) {
      user.savePost.pull(postId);
    } else {
      user.savePost.push(postId);
    }

    await user.save();

    // ✅ Update Redis cache correctly
    await client.setEx(cacheKey, 600, JSON.stringify(user.savePost));

    return res.json({
      success: true,
      savedPosts: user.savePost,
      message: isSaved ? "Removed from wishlist" : "Saved to wishlist",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
