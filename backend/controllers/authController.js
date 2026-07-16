const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendOtpEmail } = require("../utils/mailer");

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

const otp = null;
const otpExpiry = null;

const OTP_VALID_MINUTES = 10;

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "Please fill in all required fields." });
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: "An account with that email already exists." });
    }

    const otpExpiry = new Date(Date.now() + OTP_VALID_MINUTES * 60 * 1000);

  const user = await User.create({
  firstName,
  lastName,
  email,
  password,
  otp: null,
  otpExpiry: null,
  emailVerified: true,
});

    //const emailResult = await sendOtpEmail(user.email, user.firstName, otp);

    // No token yet — they need to verify the OTP first
const token = signToken(user._id);

res.status(201).json({
  message: "Account created successfully.",
  token,
  user,
  requiresVerification: false,
});
  } catch (err) {
    if (err.name === "ValidationError") {
      const firstError = Object.values(err.errors)[0].message;
      return res.status(400).json({ message: firstError });
    }
    console.error("Register error:", err);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

// POST /api/auth/verify-otp  { email, otp }
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Enter the code from your email." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: "Account not found." });

    if (user.emailVerified) {
      const token = signToken(user._id);
      return res.status(200).json({ message: "Already verified.", token, user });
    }

    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ message: "Incorrect code." });
    }
    if (!user.otpExpiry || user.otpExpiry.getTime() < Date.now()) {
      return res.status(400).json({ message: "That code expired. Request a new one." });
    }

    user.emailVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    const token = signToken(user._id);
    res.status(200).json({ message: "Email verified!", token, user });
  } catch (err) {
    console.error("verifyOtp error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

// POST /api/auth/resend-otp  { email }
exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required." });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: "Account not found." });
    if (user.emailVerified) return res.status(400).json({ message: "This account is already verified." });

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + OTP_VALID_MINUTES * 60 * 1000);
    await user.save();

    const emailResult = await sendOtpEmail(user.email, user.firstName, otp);
    res.status(200).json({
      message: emailResult.sent ? "A new code has been sent." : "Couldn't send the email right now — please try again in a moment.",
      emailSent: emailResult.sent,
    });
  } catch (err) {
    console.error("resendOtp error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please enter email and password." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    /*if (!user.emailVerified) {
      // Send a fresh code so they're not stuck with an expired one
      const otp = generateOtp();
      user.otp = otp;
      user.otpExpiry = new Date(Date.now() + OTP_VALID_MINUTES * 60 * 1000);
      await user.save();
      const emailResult = await sendOtpEmail(user.email, user.firstName, otp);

      return res.status(403).json({
        message: emailResult.sent
          ? "Please verify your email first — we just sent you a new code."
          : "Please verify your email first. We couldn't send a new code right now — try 'Resend code' on the next screen.",
        requiresVerification: true,
        email: user.email,
      });
    }*/

    const token = signToken(user._id);

    res.status(200).json({
      message: "Logged in successfully.",
      token,
      user,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

// GET /api/auth/me  (protected - requires valid token)
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found." });
    res.status(200).json({ user });
  } catch (err) {
    console.error("GetMe error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};
