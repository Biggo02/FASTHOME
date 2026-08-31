# FASTHOME — workflow API

## Visite

`POST /api/visits`

Crée une demande avec `propertyId`, `requesterId`, `preferredDate` et `preferredTime`.

`PATCH /api/visits/:id`

Actions :
- `FASTHOME_APPROVE` — réservé aux identifiants configurés dans `FASTHOME_ADMIN_USER_IDS`.
- `OWNER_APPROVE` — réservé au propriétaire du bien.
- `DECLINE` — refuse la demande.
- `COMPLETE` — marque la visite comme effectuée.

Lorsque FASTHOME et le propriétaire ont approuvé, la visite devient `CONFIRMED` et le bien `VISIT_SCHEDULED`.

## Location et contrats

Après une visite `COMPLETED`, le demandeur peut appeler :

`POST /api/contracts`

avec `visitId`, `actorId`, et éventuellement `startDate` / `endDate`.

FASTHOME génère deux contrats liés au même bien :
- `TENANT` pour le demandeur ;
- `OWNER` pour le propriétaire.

Le bien passe à `RENTAL_IN_PROGRESS`.

## Documents signés

`PATCH /api/contracts/:id`

Action `UPLOAD_SIGNED_DOCUMENT` avec `documentUrl` et `actorId`.

Quand les deux contrats du bien possèdent un document signé, les contrats passent à `ACTIVE` et le bien à `RENTED`.

## Paiements hors ligne

`POST /api/payments`

Enregistre un paiement effectué hors plateforme. Aucun paiement en ligne n'est déclenché.

Statuts calculés : `UPCOMING`, `PARTIAL`, `PAID`.

## Vérification QR

`GET /api/contracts/verify?token=...`

Retourne uniquement les informations nécessaires à la vérification publique d'un contrat, sans identité ni données financières privées.
