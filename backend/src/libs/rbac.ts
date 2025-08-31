import type { Role, User } from "@prisma/client";

export const Roles = {
  USER: "USER",
  OFFICIAL: "OFFICIAL",
  ACO: "ACO",
  ADMIN: "ADMIN"
} as const;

export function canViewComplaint(actor: User & { reportsToId: string | null }, accused: User & { reportsToId: string | null }) {
  // 1) ACO & ADMIN can view everything
  if (actor.role === "ACO" || actor.role === "ADMIN") return true;
  // 2) Direct supervisor (one‑level‑up): actor must be the accused.reportsToId
  if (actor.role === "OFFICIAL" && accused.reportsToId && accused.reportsToId === actor.id) return true;
  // Otherwise, deny
  return false;
}

export function canEditStatus(actor: User) {
  return actor.role === "OFFICIAL" || actor.role === "ACO" || actor.role === "ADMIN";
}