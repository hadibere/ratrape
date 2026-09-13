/** Résultat d'une action sur la page de gestion d'une annonce. */
export type ManageState =
  | { status: "idle" }
  | { status: "saved" }
  | { status: "taken" }
  | { status: "removed" }
  | { status: "error"; message: string };
