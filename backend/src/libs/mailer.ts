import nodemailer from "nodemailer";
import { CONFIG } from "../config";

export const mailer = nodemailer.createTransport({
  host: CONFIG.mail.host,
  port: CONFIG.mail.port,
  auth: CONFIG.mail.user ? { user: CONFIG.mail.user, pass: CONFIG.mail.pass } : undefined,
});

export async function sendMail(to: string, subject: string, text: string) {
  if (!to) return;
  try {
    await mailer.sendMail({ from: CONFIG.mail.from, to, subject, text });
  } catch (e) {
    console.error("mail error", e);
  }
}