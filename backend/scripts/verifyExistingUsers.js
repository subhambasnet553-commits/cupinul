// One-time fix: accounts created BEFORE email verification was added don't
// have emailVerified set, so they get silently blocked at login.
// This marks all existing users as verified so old test accounts work again.
//
// Run this once from the backend folder:  node scripts/verifyExistingUsers.js

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected. Checking for unverified accounts...");

  const result = await User.updateMany(
    { emailVerified: { $ne: true } },
    { $set: { emailVerified: true } }
  );

  console.log(`Done — updated ${result.modifiedCount} account(s) to verified.`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
