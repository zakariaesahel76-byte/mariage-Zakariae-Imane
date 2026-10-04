# Faire-part — Zakariae & Imane

Site statique (HTML/CSS/JS, sans build), hébergé sur Vercel.
Les commentaires du livre d'or sont stockés dans Supabase (table `comments`).

## Modifier le contenu

| Quoi | Fichier |
|---|---|
| Date, heure, lieu, liens Maps / Waze | `config.js` |
| Textes (français / arabe) | `index.html` |
| Couleurs et polices | `style.css` (début du fichier) |

Chaque modification poussée sur `main` est publiée automatiquement par Vercel.

## Supprimer un commentaire

Supabase → projet `mariage-zakariae-imane` → Table Editor → `comments`.
