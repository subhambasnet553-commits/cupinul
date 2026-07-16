const nodemailer = require("nodemailer");

function getTransporter() {
  return nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.BREVO_LOGIN,
      pass: process.env.BREVO_SMTP_KEY,
    },
  });
}

async function sendOtpEmail(toEmail, firstName, otp) {
  // If email isn't configured, don't crash signup — just log it so local dev keeps working.
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn(`EMAIL_USER/EMAIL_PASS not set — would have emailed OTP ${otp} to ${toEmail}`);
    return { sent: false };
  }

  try {
    const transporter = getTransporter();
     await transporter.verify();
      console.log("SMTP connection successful");
    await transporter.sendMail({
     from: `"Cupinul" <YOUR_VERIFIED_EMAIL>`,
      to: toEmail,
      subject: "Your Cupinul verification code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 30px; text-align: center;">
          <h2 style="color: #e6437e;">Cupinul 💕</h2>
          <p>Hi ${firstName || "there"},</p>
          <p>Here's your verification code:</p>
          <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #9c1155; margin: 20px 0;">${otp}</p>
          <p style="font-size: 13px; color: #888;">This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
        </div>
      `,
    });
    return { sent: true };
  } catch (err) {
    // IMPORTANT: never let an email failure block account creation or login.
    // Log it clearly (visible in Render's logs) and let the caller decide what to do.
    
    console.error("EMAIL ERROR:", err);
    console.error(`Fallback — the OTP for ${toEmail} is: ${otp}`);
    return { sent: false, error: err.message };
  }
}

module.exports = { sendOtpEmail };
