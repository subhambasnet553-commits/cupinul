const axios = require("axios");

async function sendOtpEmail(toEmail, firstName, otp) {
  console.log("Sending OTP to:", toEmail);

  if (!process.env.BREVO_API_KEY) {
    console.warn("BREVO_API_KEY not set");
    return { sent: false };
  }

  try {
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "Cupinul",
          email: "cupinul0@gmail.com"
        },
        to: [
          {
            email: toEmail,
            name: firstName || "User"
          }
        ],
        subject: "Your Cupinul verification code",
        htmlContent: `
          <div style="font-family:Arial,sans-serif;max-width:400px;margin:auto;padding:20px;text-align:center;">
            <h2 style="color:#e6437e;">Cupinul 💕</h2>
            <p>Hello ${firstName || "there"},</p>
            <p>Your verification code is:</p>

            <h1 style="letter-spacing:8px;color:#9c1155;">
              ${otp}
            </h1>

            <p>This code expires in 10 minutes.</p>
          </div>
        `
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("OTP email sent successfully");

    return { sent: true };

  } catch (err) {
    console.error(
      err.response?.data || err.message
    );

    return {
      sent: false,
      error: err.message
    };
  }
}

module.exports = { sendOtpEmail };
