import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { z } from "zod";
import { signToken } from "../middlewares/auth";

const prisma = new PrismaClient();
export const auth = Router();

const regSchema = z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(8) });

auth.post("/register", async (req, res) => {
  const parsed = regSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { name, email, password } = parsed.data;
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ error: "Email exists" });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { name, email, passwordHash, role: "USER" } });
  const token = signToken({ id: user.id, role: user.role });
  res.cookie("token", token, { httpOnly: true, sameSite: "lax" });
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

const loginSchema = z.object({ email: z.string().email(), password: z.string() });

auth.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: "Invalid" });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid" });
  const token = signToken({ id: user.id, role: user.role });
  res.cookie("token", token, { httpOnly: true, sameSite: "lax" });
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

auth.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ ok: true });
});