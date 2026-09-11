# Ratrape

Un habitant dépose un encombrant sur le trottoir pour la collecte municipale et le signale sur la carte du quartier avec une photo. Les voisins peuvent venir le récupérer gratuitement avant le passage du camion. Aucun compte, aucune messagerie : le dépôt prend moins d'une minute, au pouce.

## Stack

| Couche          | Choix                                                        |
| --------------- | ------------------------------------------------------------ |
| Framework       | Next.js 16 (App Router) + TypeScript                         |
| Styles          | Tailwind CSS v4, tokens de design dans `src/app/globals.css` |
| Polices         | Quicksand (titres) et Nunito (texte) via `next/font/google`  |
| Icônes          | Lucide                                                       |
| Carte           | MapLibre GL + tuiles OpenFreeMap                             |
| Adresses        | API Adresse (Base Adresse Nationale)                         |
| Base de données | Postgres (Supabase) via Drizzle                              |
| Validation      | Zod                                                          |
| Hébergement     | Vercel                                                       |

## Routes

| Route                   | Écran                                 |
| ----------------------- | ------------------------------------- |
| `/`                     | Carte + liste des objets proches      |
| `/objet/[id]`           | Fiche objet                           |
| `/deposer`              | Formulaire de dépôt                   |
| `/deposer/confirmation` | Confirmation + lien de gestion        |
| `/g/[token]`            | Gestion d'une annonce via lien secret |

## Démarrer

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Puis ouvrir http://localhost:3000. Sans variables d'environnement, l'application tourne sur des données en mémoire.

## Scripts

- `pnpm dev` : serveur de développement
- `pnpm build` / `pnpm start` : build de production
- `pnpm lint` : ESLint
- `pnpm format` : Prettier
- `pnpm typecheck` : vérification TypeScript

## Design

Bascule unique mobile / desktop à 900 px. Les valeurs de couleurs, typographie, espacements et ombres viennent du handoff de design et sont déclarées comme tokens Tailwind.
