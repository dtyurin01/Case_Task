import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

(async () => {
  try {
    const ok = await transporter.verify();
    console.log("SMTP connected:", ok);
  } catch (err) {
    console.error("SMTP connection error:", err);
  }
})();
