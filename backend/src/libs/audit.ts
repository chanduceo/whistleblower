import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function audit(complaintId: string, actorId: string, action: string, note?: string) {
  await prisma.auditEvent.create({ data: { complaintId, actorId, action, note } });
}