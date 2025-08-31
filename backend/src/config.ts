import "dotenv/config";

export const CONFIG = {
  port: Number(process.env.PORT || 4000),
  dbUrl: process.env.DATABASE_URL!,
  jwtSecret: process.env.JWT_SECRET!,
  csrfSecret: process.env.CSRF_SECRET!,
  encKeyB64: process.env.ENCRYPTION_MASTER_KEY_BASE64!,
  fileDir: process.env.FILE_STORAGE_DIR || "./uploads",
  allowedOrigins: (process.env.ALLOWED_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean),
  mail: {
    from: process.env.MAIL_FROM!,
    host: process.env.SMTP_HOST!,
    port: Number(process.env.SMTP_PORT || 1025),
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  }
};