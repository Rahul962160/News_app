const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
// const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
require("dotenv").config();

// Nodemailer transporter setup

const transporter = nodemailer.createTransport({
  host: process.env.HOST, // Keep as provided
  service: process.env.SERVICE, // Keep as provided
  port: Number(process.env.EMAIL_PORT), // Keep as provided
  secure: process.env.SECURE === "true", // Correct Boolean conversion
  auth: {
    user: process.env.USER, // Keep as provided
    pass: process.env.PASS, // Keep as provided
  },
});

// Debugging: Ensure environment variables are loaded
// console.log("SMTP Host:", process.env.HOST);
// console.log("SMTP User:", process.env.USER);

// transporter.verify((error, success) => {
//   if (error) {
//     console.log("Error with SMTP:", error);
//   } else {
//     console.log("SMTP connected successfully!");
//   }
// });
// dotenv.config();
const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:3002", credentials: true }));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: String,
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
});

const User = mongoose.model("User", UserSchema);

// Signup Route
app.post("/api/auth/signup", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      verificationToken,
      isVerified: false,
    });

    await newUser.save();

    // Send verification email
    const verificationLink = `http://localhost:5000/api/auth/verify/${verificationToken}`;
    await transporter.sendMail({
      from: process.env.USER,
      to: email,
      subject: "Verify Your Email",
      html: `<h2>Click the link below to verify your email:</h2>
             <a href="${verificationLink}">Verify Email</a>`,
    });

    res.json({ message: "User registered. Please verify your email." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.get("/api/auth/verify/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.redirect("http://localhost:3002/login?verified=false");
    }

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    // Redirect to login page with success message
    res.redirect("http://localhost:3002/login?verified=true");
  } catch (err) {
    console.error(err);
    res.redirect("http://localhost:3002/login?verified=false");
  }
});

// Login Route
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(400).json({ error: "Invalid credentials" });

  if (!user.isVerified)
    return res.status(403).json({ error: "Please verify your email first" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.json({ token });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
