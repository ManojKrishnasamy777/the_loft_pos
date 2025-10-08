const nodemailer = require("nodemailer");

async function testEmail() {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "krishmanoj766@gmail.com",        // your Gmail
        pass: "ferozrehpiyjlzwg",       // 16-digit App Password
      },
    });

    const info = await transporter.sendMail({
      from: "krishmanoj766@gmail.com",
      to: "iammanojkrish766@gmail.com",            // test by sending to yourself
      subject: "SMTP Test",
      text: "This is a test email from Node.js",
    });

    console.log("✅ Email sent:", info.response);
  } catch (err) {
    console.error("❌ Error sending email:", err);
  }
}

testEmail();
