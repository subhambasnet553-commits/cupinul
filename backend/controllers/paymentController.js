const Razorpay = require("razorpay");
const crypto = require("crypto");
const User = require("../models/User");

const PREMIUM_PRICE_PAISE = 4000; // ₹40.00
function isCurrentlyPremium(user) {
  return !!(user.premiumExpiresAt && new Date(user.premiumExpiresAt) > new Date());
}
function getRazorpayInstance() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// POST /api/payment/create-order
exports.createOrder = async (req, res) => {
  try {
   const user = await User.findById(req.userId);
    if (isCurrentlyPremium(user)) {
      return res.status(400).json({ message: "You already have an active Premium subscription." });
    }

    const razorpay = getRazorpayInstance();
    const order = await razorpay.orders.create({
      amount: PREMIUM_PRICE_PAISE,
      currency: "INR",
     receipt: `p_${Date.now()}`
    });

    res.status(200).json({ orderId: order.id, amount: order.amount, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    console.error("createOrder error:", err);
    res.status(500).json({ message: "Could not start payment. Please try again." });
  }
};

// POST /api/payment/verify  { orderId, paymentId, signature }
exports.verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId, signature } = req.body;
    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({ message: "Missing payment details." });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    if (expectedSignature !== signature) {
      return res.status(400).json({ message: "Payment verification failed." });
    }

const user = await User.findById(req.userId);
    const now = new Date();
    // If they still have time left on an existing sub, extend from that date instead of from now
    const base = isCurrentlyPremium(user) ? new Date(user.premiumExpiresAt) : now;
    base.setDate(base.getDate() + 30);
    user.premiumExpiresAt = base;
    await user.save();

    res.status(200).json({ message: "Premium unlocked for 30 days! 🎉", isPremium: true, expiresAt: user.premiumExpiresAt });
  } catch (err) {
    console.error("verifyPayment error:", err);
    res.status(500).json({ message: "Something went wrong verifying your payment." });
  }
};

// GET /api/payment/status
exports.getStatus = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.status(200).json({ isPremium: isCurrentlyPremium(user), expiresAt: user.premiumExpiresAt });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong." });
  }
};