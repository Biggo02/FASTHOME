# FASTHOME — architecture fonctionnelle

## Principe

FASTHOME utilise un **compte unique**. Les capacités supplémentaires sont accordées par permissions internes : utilisateur, agent et administrateur. Un même utilisateur peut être propriétaire d'un bien et locataire d'un autre.

## Modules

- Marketplace : recherche, filtres, favoris, comparaison, détail des biens.
- Matching : score 0–100, pondération explicable et tolérance sur les localisations.
- Publications : brouillon → vérification → validation → publication → location → archivage.
- Visites : demande → validation FASTHOME + validation propriétaire → confirmation → visite → décision.
- Contrats : deux contrats liés au même bien, références uniques, QR de vérification, documents signés.
- Paiements : enregistrement hors plateforme, preuves, paiements partiels et échéances.
- Audit : journal des actions sensibles.

## Confidentialité

Les pages publiques ne renvoient jamais le loyer réel, l'adresse exacte, les coordonnées GPS précises ou les coordonnées privées du propriétaire. Ces données sont réservées aux workflows autorisés.

## Workflow de publication

`DRAFT → IN_REVIEW → VALIDATED → TO_PUBLISH → PUBLISHED`

La validation administrative et la publication sont volontairement deux actions distinctes.

## Workflow de visite

`PENDING → FASTHOME_APPROVED + OWNER_APPROVED → CONFIRMED → COMPLETED`

Une seule approbation ne doit jamais produire une visite confirmée.

## Données

PostgreSQL est la cible de production. Prisma fournit le schéma relationnel dans `prisma/schema.prisma`.

## Prochaine couche d'implémentation

1. Authentification sécurisée avec session HTTP-only.
2. API CRUD propriétés, favoris, visites et contrats.
3. Upload privé des photos/documents.
4. Génération PDF et QR de vérification.
5. Notifications et rappels.
6. RBAC agent/admin.
7. Tests unitaires + tests de workflow.
8. Déploiement PostgreSQL + stockage objet.
