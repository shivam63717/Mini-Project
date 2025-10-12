
import nodemailer from 'nodemailer';

export interface EmailPayload {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  return transporter;
}

export async function sendEmail(payload: EmailPayload) {
  const tx = getTransporter();
  return tx.sendMail({
    from: process.env.EMAIL_FROM,
    ...payload
  });
}