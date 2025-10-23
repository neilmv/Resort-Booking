const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const fs = require("fs");
const path = require("path");

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, phone } = req.body;

    // Check if user exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create user
    await User.create({ name, email, password, phone });
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profile_picture: user.profile_picture,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, phone } = req.body;
    const userId = req.user.id;

    // Prepare update data
    const updateData = { name, phone };

    // Handle file upload if exists
    if (req.file) {
      // Generate unique filename
      const fileExtension = path.extname(req.file.originalname);
      const fileName = `profile_${userId}_${Date.now()}${fileExtension}`;
      const filePath = path.join("uploads", "profiles", fileName);

      // Save file
      fs.writeFileSync(path.join(__dirname, "..", filePath), req.file.buffer);

      // Add profile picture path to update data
      updateData.profile_picture = `/uploads/profiles/${fileName}`;
    }

    // Update user profile
    await User.updateProfile(userId, updateData);

    // Get updated user data
    const updatedUser = await User.findById(userId);

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const updatePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    console.log("Password update request:", {
      userId,
      hasCurrentPassword: !!currentPassword,
      hasNewPassword: !!newPassword,
    });

    // Get user with password
    const user = await User.findByEmail(req.user.email);
    if (!user) {
      console.log("User not found for email:", req.user.email);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("User found:", { id: user.id, email: user.email });

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    console.log("Password match result:", isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Update password
    const updateResult = await User.updatePassword(userId, newPassword);
    console.log("Password update database result:", updateResult);

    if (updateResult.affectedRows === 0) {
      return res.status(400).json({ message: "Failed to update password" });
    }

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Password update error:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

module.exports = { register, login, getProfile, updateProfile, updatePassword };
