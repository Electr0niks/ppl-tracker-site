# Site public PPL Tracker — landing + politique de confidentialité

Ce dossier est destiné à être publié sur **GitHub Pages**, pour fournir à Play
Console l'URL publique de la politique de confidentialité (champ obligatoire).

| Fichier | Rôle |
|---|---|
| `index.html` | Landing page FR/EN (détection auto de la langue) |
| `privacy.html` | Politique de confidentialité FR/EN — **c'est l'URL demandée par Play Console** |
| `icon.svg` | Logo, utilisé aussi comme favicon |

---

## ⚠️ À remplir avant de publier

1. ~~L'e-mail de contact~~ ✅ **Fait** — `julien.delibes81@gmail.com` est en place
   dans `index.html`, `privacy.html` et `www/privacy.html` (la copie embarquée
   dans l'app). Les trois doivent toujours indiquer la même adresse.

2. **Le lien Play Store.** Une fois l'app en ligne, remplace le bouton
   « Bientôt sur Google Play » (`<a class="cta disabled">`) par :
   ```html
   <a class="cta" href="https://play.google.com/store/apps/details?id=com.ppltracker.workout">Télécharger sur Google Play</a>
   ```
   (blocs FR **et** EN)

---

## Pourquoi un repo séparé

Le repo principal `Electr0niks/PPL-Tracker` est **privé**, et GitHub Pages sur
un repo privé exige un plan payant. La solution gratuite : un petit repo
**public** qui ne contient que ce dossier. Ton code source reste privé.

## Déploiement

```bash
# 1. Crée un repo PUBLIC sur github.com nommé : ppl-tracker-site
#    (sans README, sans .gitignore — vide)

# 2. Depuis la racine du projet
cd site
git init
git add .
git commit -m "Landing page et politique de confidentialite PPL Tracker"
git branch -M main
git remote add origin https://github.com/Electr0niks/ppl-tracker-site.git
git push -u origin main
```

Puis sur GitHub : **Settings → Pages → Source: Deploy from a branch →
Branch: `main` / `(root)` → Save**.

Compter 1 à 2 minutes pour la mise en ligne.

## URLs obtenues

| Usage | URL |
|---|---|
| **Politique de confidentialité** (Play Console) | `https://electr0niks.github.io/ppl-tracker-site/privacy.html` |
| **Site web** (fiche Play Store) | `https://electr0niks.github.io/ppl-tracker-site/` |

Vérifie que les deux s'ouvrent en navigation privée avant de les coller dans
Play Console.

## Mise à jour

```bash
cd site
git add .
git commit -m "Mise a jour du site"
git push
```

> Note : `site/privacy.html` est une copie de `www/privacy.html` (la version
> embarquée dans l'app). Si tu modifies l'une, pense à répercuter sur l'autre —
> les deux doivent dire la même chose.
