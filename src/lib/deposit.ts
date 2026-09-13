import { z } from "zod";
import { ZONES } from "@/lib/collection";
import { CATEGORIES, CONDITIONS } from "@/lib/types";

/** Champs du formulaire de dépôt, validés côté serveur. */
export const depositSchema = z.object({
  category: z.enum(CATEGORIES),
  condition: z.enum(CONDITIONS),
  address: z.string().trim().min(3, "Adresse trop courte").max(120),
  spot: z.string().trim().max(120).default(""),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  zone: z.enum(ZONES),
  rule: z.literal("on", { message: "La case de dépôt autorisé est obligatoire" }),
});

export type DepositInput = z.infer<typeof depositSchema>;

/** Résultat d'une tentative de publication, renvoyé au formulaire. */
export type DepositState = { error?: string };

/** Le jeton de gestion transite par un cookie court plutôt que par l'URL. */
export const MANAGE_COOKIE = "ratrape_manage";

/** Résultat d'une déclaration « je l'ai pris ». */
export type TakenState =
  | { status: "idle" }
  | { status: "taken" }
  /** Quelqu'un d'autre l'avait déjà déclaré, ou le camion est passé. */
  | { status: "already" }
  | { status: "error"; message: string };

/** Cookie court signalant que la photo n'a pas pu être enregistrée. */
export const PHOTO_FAILED_COOKIE = "ratrape_photo";
