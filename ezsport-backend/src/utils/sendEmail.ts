import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const emailUser = process.env.EMAIL_USER;
const emailPassword = process.env.EMAIL_PASSWORD?.replace(/\s/g, "");

let transporter: nodemailer.Transporter | null = null;

if (!emailUser || !emailPassword) {
  console.warn("WARNING: Missing EMAIL_USER or EMAIL_PASSWORD environment variables for email transport. Email sending is disabled.");
} else {
  transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // SSL
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
  });
}

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: {
    filename: string;
    content: Buffer;
    contentType?: string;
  }[];
}

export const sendEmail = async (options: EmailOptions) => {
  if (!transporter) {
    console.warn(`[SMTP Disabled] Would send email to: ${options.to}\nSubject: ${options.subject}\nContent: ${options.text || options.html}`);
    return;
  }
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments,
    });

    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Lỗi gửi email:", error);
    throw error;
  }
};

export const sendResetPasswordEmail = async (
  to: string,
  resetLink: string
) => {
  return sendEmail({
    to,
    subject: "Đặt lại mật khẩu",
    html: `
      <p>Bạn đã yêu cầu đặt lại mật khẩu.</p>
      <p>Link có hiệu lực trong <b>1 giờ</b>.</p>
      <p><a href="${resetLink}">Nhấp để đổi mật khẩu</a></p>
      <p>Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
    `,
  });
};
