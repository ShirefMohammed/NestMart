import dotenv from "dotenv";
import { Transporter, createTransport } from "nodemailer";
import { SentMessageInfo } from "nodemailer/lib/smtp-transport";

dotenv.config();

const transporter: Transporter = createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_SERVICE_USER as string,
    pass: process.env.EMAIL_SERVICE_PASSWORD as string,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export const sendVerificationEmail = async (
  destEmail: string,
  verificationToken: string,
): Promise<void> => {
  const verificationLink = `${process.env.SERVER_URL}/api/v1/auth/verifyAccount?verificationToken=${verificationToken}`;

  const mailOptions = {
    from: process.env.EMAIL_SERVICE_USER,
    to: destEmail,
    subject: "NestMart Account Verification",
    html: `
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
        }
        .container {
          max-width: 600px;
          margin: auto;
          padding: 20px;
          border: 1px solid #ccc;
          border-radius: 5px;
        }
        .button {
          display: inline-block;
          padding: 10px 20px;
          background-color: #007bff;
          color: #fff !important;
          text-decoration: none;
          border-radius: 5px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <p>Hi there,</p>
        <p>Please verify your account by clicking on the following link:</p>
        <a href="${verificationLink}" class="button">Verify Account</a>
        <p>Note: this link will be expired after 15 minutes</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Thanks,</p>
        <p>NestMart</p>
      </div>
    </body>
  </html>`,
  };

  try {
    const info: SentMessageInfo = await transporter.sendMail(mailOptions);
    console.log("Verification Email sent: " + info.response);
  } catch (error) {
    console.error("Error sending verification email:", error);
  }
};
