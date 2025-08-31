import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth } from "../middlewares/auth";
import { z } from "zod";
import { encrypt, decrypt } from "../libs/crypto";
import { audit } from "../libs/audit";
import { categorize, scorePriority } from "../libs/ai";
import { canEditStatus, canViewComplaint } from "../libs/rbac";

const prisma = new PrismaClient();
export const complaints = Router();

const createSchema = z.object({ title: z.string().min(5), body: z.string().min(20), accusedId: z.string().cuid() });

// Create complaint (complainant is the authenticated user)
complaints.post("/", requireAuth, async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { title, body, accusedId } = parsed.data;

  const accused = await prisma.user.findUnique({ where: { id: accusedId } });
  if (!accused) return res.status(404).json({ error: "Accused not found" });

  const enc = encrypt(body);
  const category = categorize(`${title} ${body}`);
  const priority = scorePriority(`${title} ${body}`);

  const created = await prisma.complaint.create({
    data: {
      title,
      bodyCipher: enc.cipherText,
      bodyIv: enc.iv,
      complainantId: (req as any).user.id,
      accusedId,
      category,
      priority,
    },
    select: { id: true, title: true, category: true, priority: true, status: true }
  });

  await audit(created.id, (req as any).user.id, "CREATE_COMPLAINT");
  res.json(created);
});

// My complaints (complainant can see their own, but body is decrypted for them only)
complaints.get("/mine", requireAuth, async (req, res) => {
  const list = await prisma.complaint.findMany({ where: { complainantId: (req as any).user.id }, orderBy: { createdAt: "desc" } });
  const result = list.map(c => ({
    id: c.id,
    title: c.title,
    body: decrypt(c.bodyCipher, c.bodyIv),
    status: c.status,
    category: c.category,
    priority: c.priority,
    accusedId: c.accusedId,
    createdAt: c.createdAt
  }));
  res.json(result);
});

// Officials/ACO/Admin inbox – one‑level‑up or higher only; accused cannot see
complaints.get("/inbox", requireAuth, async (req, res) => {
  const actor = await prisma.user.findUnique({ where: { id: (req as any).user.id } });
  if (!actor) return res.status(401).json({ error: "No actor" });

  // Fetch complaints whose accused is directly reporting to actor, or actor is ACO/ADMIN
  let list;
  if (actor.role === "ACO" || actor.role === "ADMIN") {
    list = await prisma.complaint.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  } else if (actor.role === "OFFICIAL") {
    list = await prisma.complaint.findMany({ where: { accused: { reportsToId: actor.id } }, orderBy: { createdAt: "desc" } });
  } else {
    return res.status(403).json({ error: "Forbidden" });
  }

  // Redact body; provide preview only
  res.json(list.map(c => ({ id: c.id, title: c.title, status: c.status, category: c.category, priority: c.priority, createdAt: c.createdAt })));
});

// Read a complaint – enforce visibility at fetch time
complaints.get(":id", requireAuth, async (req, res) => {
  const id = req.params.id;
  const actor = await prisma.user.findUnique({ where: { id: (req as any).user.id } });
  const c = await prisma.complaint.findUnique({ where: { id }, include: { accused: true } });
  if (!c || !actor) return res.status(404).json({ error: "Not found" });

  if ((req as any).user.id === c.complainantId) {
    await audit(c.id, actor.id, "READ_COMPLAINT_SELF");
    return res.json({ ...c, body: decrypt(c.bodyCipher, c.bodyIv) });
  }

  if (!canViewComplaint(actor, c.accused)) return res.status(403).json({ error: "Forbidden" });

  await audit(c.id, actor.id, "READ_COMPLAINT_BY_OFFICIAL");
  return res.json({ id: c.id, title: c.title, body: decrypt(c.bodyCipher, c.bodyIv), status: c.status, category: c.category, priority: c.priority, accusedId: c.accusedId, complainantId: c.complainantId, createdAt: c.createdAt });
});

// Update status – officials/ACO/Admin only
const statusSchema = z.object({ status: z.enum(["OPEN","UNDER_REVIEW","ESCALATED","RESOLVED","REJECTED"]) });
complaints.patch(":id/status", requireAuth, async (req, res) => {
  const id = req.params.id;
  const actor = await prisma.user.findUnique({ where: { id: (req as any).user.id } });
  if (!actor) return res.status(401).json({ error: "No actor" });
  if (!canEditStatus(actor)) return res.status(403).json({ error: "Forbidden" });
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const updated = await prisma.complaint.update({ where: { id }, data: { status: parsed.data.status } });
  await audit(id, actor.id, "UPDATE_STATUS", `→ ${parsed.data.status}`);
  res.json({ ok: true });
});