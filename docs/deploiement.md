# Mettre Ratrape en ligne

Hébergeur : Vercel. La base et le stockage des photos restent sur Supabase, à Paris.

## Pourquoi mettre en ligne pour tester

La géolocalisation et l'accès à l'appareil photo exigent une connexion sécurisée.
Ils fonctionnent sur `localhost`, mais pas depuis un téléphone qui viserait
l'adresse locale de l'ordinateur. Les deux fonctions centrales de Ratrape ne se
testent donc qu'une fois le site en ligne.

## Variables à renseigner dans Vercel

Les quatre variables se trouvent dans le tableau de bord Supabase, bouton
**Connect** pour les deux premières, **Project Settings › API Keys** pour les
autres. Ce sont les mêmes valeurs que dans le `.env.local`.

| Variable                   | Rôle                                                   |
| -------------------------- | ------------------------------------------------------ |
| `DATABASE_URL`             | Transaction pooler, port 6543. Utilisée à chaque page. |
| `DIRECT_URL`               | Session pooler, port 5432. Migrations uniquement.      |
| `NEXT_PUBLIC_SUPABASE_URL` | Adresse du projet, pour les photos.                    |
| `SUPABASE_SECRET_KEY`      | Clé secrète `sb_secret_…`. Ne jamais l'exposer.        |

**À ne pas reporter : `NEXT_PUBLIC_RATRAPE_ANYWHERE`.** Elle lève la restriction
de commune en développement. Elle est ignorée en production, mais elle n'a rien
à faire là.

`NEXT_PUBLIC_SITE_URL` est facultative : sans elle, le lien de gestion affiche
l'adresse réellement ouverte par le visiteur. Ne la renseigner que pour imposer
un domaine canonique, une fois un vrai nom de domaine acheté.

## Région d'exécution

`vercel.json` force la région `cdg1`, à Paris. Sans ça, Vercel exécute le code
aux États-Unis alors que la base est en France : chaque affichage ferait deux
allers-retours transatlantiques.

## Migrations

Le déploiement ne les applique pas. Après avoir changé `src/db/schema.ts` :

```bash
pnpm db:generate   # écrit la migration dans drizzle/
pnpm db:migrate    # l'applique, via DIRECT_URL
```

La base est commune au développement et à la production tant qu'un second projet
Supabase n'a pas été créé.

## Ce qui reste à reprendre avant une vraie ouverture

- **La limitation de débit compte en mémoire.** Sur Vercel, chaque requête peut
  atterrir sur une instance différente, donc elle ne limite presque rien.
  À remplacer par un compteur partagé, par exemple Upstash.
- **Une seule base pour tout.** Les essais en ligne écrivent dans la même base
  que le développement. Créer un second projet Supabase avant l'ouverture.
- **Les annonces d'exemple** sont dans la base. Les retirer avant que des
  habitants arrivent, en vidant la table.

## Vérifier après le premier déploiement

1. La carte s'affiche cadrée sur la commune, avec son contour en pointillés.
2. Une fiche objet s'ouvre depuis une pastille.
3. Depuis un téléphone **dans la commune** : le dépôt aboutit, photo comprise.
4. Depuis ailleurs : le formulaire annonce que Ratrape ne couvre que
   Maisons-Laffitte, et la publication est refusée.
5. Le lien de gestion de la confirmation ouvre bien la page de gestion.
