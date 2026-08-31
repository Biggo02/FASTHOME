# FASTHOME

Plateforme immobilière moderne pour la RDC : recherche, matching, visites, publications, contrats, paiements et gestion d'activité dans un **compte utilisateur unique**.

## État actuel

Cette première version pose la fondation UI responsive inspirée de la planche de maquettes fournie :

- accueil marketplace ;
- recherche et résultats ;
- détail d'un bien ;
- matching détaillé ;
- inscription / connexion ;
- espace personnel et dashboard ;
- publications et ajout d'un bien ;
- visites, contrats, paiements, échéances, messages et notifications (shells UI) ;
- espace administration ;
- pages d'erreur ;
- responsive desktop / tablette / mobile ;
- confidentialité des prix, adresses et coordonnées propriétaires côté interface publique.

## Démarrage local

```bash
npm install
npm run dev
```

Puis ouvrir `http://localhost:3000`.

## Architecture cible

La prochaine phase peut brancher la persistance et les workflows métier : authentification, PostgreSQL, stockage documentaire, RBAC/permissions, matching, calendrier, contrats PDF + QR, paiements hors ligne, audit et notifications.
