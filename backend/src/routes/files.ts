import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { CONFIG } from "../config";
import { requireAuth } from "../middlewares/auth";
import { PrismaClient } from "@prisma/client";
import { encrypt } from "../libs/crypto";

const upload = multer({ dest: CONFIG.fileDir });
const prisma = new PrismaClient();
export const files = Router();

// Attach file to a complaint (only complainant at creation time or authorized official during review)
files.post("/:complaintId", requireAuth, upload.single("file"), async (req, res) => {
  const { complaintId } = req.params;
  const complaint = await prisma.complaint.findUnique({ where: { id: complaintId } });
  if (!complaint) return res.status(404).json({ error: "Complaint not found" });

  // Allow complainant or privileged roles
  const me = (req as any).user;
  if (!(me.id === complaint.complainantId || ["OFFICIAL","ACO","ADMIN"].includes(me.role))) return res.status(403).json({ error: "Forbidden" });

  const file = req.file!;
  // (Hook) virus scan here
  const enc = encrypt(JSON.stringify({ original: file.originalname }));
  await prisma.attachment.create({ data: { complaintId, filename: path.basename(file.path), mimeType: file.mimetype, size: file.size, metaCipher: enc.cipherText, metaIv: enc.iv } });
  res.json({ ok: true });
});

files.get("/download/:id", requireAuth, async (req, res) => {
  const att = await prisma.attachment.findUnique({ where: { id: req.params.id }, include: { complaint: { include: { accused: true } } } });
  if (!att) return res.status(404).json({ error: "Not found" });

  const me = await prisma.user.findUnique({ where: { id: (req as any).user.id } });
  if (!me) return res.status(401).json({ error: "Unauth" });

  // Visibility: complainant or authorized official
  if (!(me.id === att.complaint.complainantId || (me.role !== "USER" && (me.role === "ACO" || me.role === "ADMIN" || (me.role === "OFFICIAL" && att.complaint.accused.reportsToId === me.id))))) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const filePath = path.join(CONFIG.fileDir, att.filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: "Missing" });
  res.sendFile(path.resolve(filePath));
});