import { z } from "zod";
import { CATEGORIES, CONDITIONS, PICKUP_CHOICES } from "@/lib/types";

/** Champs du formulaire de dépôt, validés côté serveur. */
export const depositSchema = z.object({
  category: z.enum(CATEGORIES),
  condition: z.enum(CONDITIONS),
  address: z.string().trim().min(3, "Adresse trop courte").max(120),
  spot: z.string().trim().max(120).default(""),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  pickup: z.enum(PICKUP_CHOICES),
  rule: z.literal("on", { message: "La case de dépôt autorisé est obligatoire" }),
});

export type DepositInput = z.infer<typeof depositSchema>;

/** Résultat d'une tentative de publication, renvoyé au formulaire. */
export type DepositState = { error?: string };

/** Le jeton de gestion transite par un cookie court plutôt que par l'URL. */
export const MANAGE_COOKIE = "kilajete_manage";
