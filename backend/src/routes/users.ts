import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth, requireRole } from "../middlewares/auth";

const prisma = new PrismaClient();
export const users = Router();

// List employees (for selecting accused) – officials/admin only
users.get("/employees", requireAuth, requireRole("OFFICIAL", "ACO", "ADMIN"), async (_req, res) => {
  const list = await prisma.user.findMany({ where: { role: "USER" }, select: { id: true, name: true, email: true, reportsToId: true } });
  res.json(list);
});

// Me
users.get("/me", requireAuth, async (req, res) => {
  const me = await prisma.user.findUnique({ where: { id: (req as any).user.id }, select: { id: true, name: true, email: true, role: true, reportsToId: true } });
  res.json(me);
});