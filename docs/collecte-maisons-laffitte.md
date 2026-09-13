# Collecte des encombrants à Maisons-Laffitte

Ces règles sont codées en dur dans `src/lib/collection.ts`. Toute évolution du
calendrier municipal doit être reportée là, et vérifiée avec `pnpm check:collection`.

**Source** : site de la ville, rubrique Vie pratique › Gérer vos déchets › Déchets
spécifiques. Relevé le 13 septembre 2026.

## Ce que dit la ville

Les encombrants sont collectés **une fois par mois, le mercredi**, selon deux zones.

| Zone | Secteurs | Jour |
|---|---|---|
| Ville | Grand-Maisons, Longueil | 2e mercredi du mois |
| Parc | Albine-Château, Napoléon-Charlemagne | 4e mercredi du mois |

Les objets doivent être **déposés la veille au soir**.

**Acceptés** : meubles, ferraille (casseroles, poêles, ustensiles), gros objets
ménagers. Limites de 3 m³ par foyer et par mois, 50 kg par objet, 2 m de long.

**Refusés** : équipements électriques et électroniques (électroménager,
télévisions, ordinateurs) et déchets toxiques, à porter au parking de l'église
Saint-Nicolas le 3e samedi du mois ; déchets professionnels, automobiles,
amiante, gravats et matériaux de construction, palettes.

Un dépôt hors de ces règles est puni de **135 € d'amende**.

## Ce que fait l'application

- La date de collecte est calculée depuis la zone, choisie par l'habitant au dépôt.
- La catégorie « Électro » a été retirée, avec une mention renvoyant vers la
  collecte du 3e samedi.
- La case obligatoire du formulaire rappelle la veille au soir, les limites et l'amende.
- La carte annonce les deux prochaines collectes.

## Questions ouvertes

1. **Limites des quatre secteurs.** Inconnues, d'où la question posée à l'habitant.
   Avec une carte ou une liste de rues, la zone se déduirait de l'adresse et le
   champ disparaîtrait.
2. **Jours fériés.** Le calcul ne connaît aucune exception. Le 2e mercredi de
   novembre 2026 tombe le 11 novembre, jour férié : la date affichée pour la zone
   Ville sera fausse si la collecte est décalée.
3. **Horaire de passage.** Non publié. Six heures du matin est retenu par
   convention, ce qui détermine à partir de quand une annonce est considérée comme
   ramassée.

## Courrier à la mairie

> **Objet :** Ratrape — questions sur la collecte des encombrants
>
> Madame, Monsieur,
>
> Habitant de Maisons-Laffitte, je développe Ratrape, un site gratuit qui permet
> de signaler sur une carte du quartier un encombrant sorti sur le trottoir, afin
> qu'un voisin puisse le récupérer avant le passage du camion. Le service ne
> demande ni compte ni inscription, et ne concerne que les objets déposés dans le
> cadre de la collecte municipale.
>
> L'outil rappelle systématiquement les règles de la ville : dépôt la veille au
> soir, limites de volume et de poids, amende encourue, et renvoi vers la collecte
> du 3e samedi pour l'électroménager, qui n'est pas ramassé avec les encombrants.
>
> Pour afficher les bonnes dates, j'aurais besoin de trois précisions.
>
> 1. Les limites des quatre secteurs, sous forme de carte ou de liste de rues.
>    Je demande aujourd'hui à l'habitant de choisir lui-même sa zone, ce qui
>    laisse place à l'erreur.
> 2. Le calendrier des collectes et ses éventuelles exceptions. Le 2e mercredi de
>    novembre 2026 tombe le 11 novembre : la collecte de la zone Ville est-elle
>    décalée, et existe-t-il d'autres reports dans l'année ?
> 3. L'horaire approximatif de passage du camion, afin d'indiquer jusqu'à quand un
>    objet peut encore être récupéré.
>
> Je serais heureux de vous présenter l'outil, et d'étudier avec vos services la
> façon dont il pourrait accompagner la collecte plutôt que s'y substituer.
>
> Je vous remercie de votre attention et reste à votre disposition.
>
> [Nom]
> [Adresse à Maisons-Laffitte]
> [Téléphone] — [Courriel]

**Où l'envoyer** : Mairie de Maisons-Laffitte, 48 avenue Longueil, 78600
Maisons-Laffitte. Le formulaire de contact du site municipal existe aussi, mais
un courriel nominatif au service Environnement obtient souvent une réponse plus
précise.
