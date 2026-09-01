# Keycloak realm

Το [`diploma-realm.json`](diploma-realm.json) είναι **το realm ως κώδικας**. Το container το
εισάγει στο πρώτο ξεκίνημα (`start-dev --import-realm`), οπότε κανείς δεν χρειάζεται να
πατήσει τίποτα στο admin console για να δουλέψει η σύνδεση.

## Τι περιέχει

| | |
|---|---|
| Realm | `diploma` |
| Client | `diploma-app` — confidential, standard flow, PKCE (S256) |
| Callback | `http://localhost:3000/api/auth/callback/keycloak` |
| Realm roles | `student`, `professor`, `secretary` |
| Χρήστες | Οι ίδιοι με το seed του `lib/data.ts` — κωδικός `diploma` για όλους |

Ο mapper `realm roles` βάζει το `realm_access.roles` **και στο id_token**, όχι μόνο στο
access token: εκεί το διαβάζει το [`lib/auth/identity.ts`](../lib/auth/identity.ts).

## Χρήστες επίδειξης

| Χρήστης | Ρόλος |
|---|---|
| `g.antoniou`, `m.konstantinou`, `n.dimou`, `e.spanou`, `p.rigas` | διδάσκων |
| `e.papadopoulou`, `d.ioannou`, `s.makri`, `k.pavlou`, `a.vasileiou`, `g.lekkas`, `r.bitsis` | φοιτητής |
| `grammateia` | γραμματεία |

Κωδικός: `diploma`. Admin console: <http://localhost:8080> με `admin` / `admin`.

> Το `secret` του client (`diploma-app-secret`) είναι fixture ανάπτυξης, όχι μυστικό
> παραγωγής. Σε πραγματική εγκατάσταση παράγεται νέο από το admin console και δίνεται
> στην εφαρμογή ως `AUTH_KEYCLOAK_SECRET` από secret manager.

## Αλλαγές στο realm

Οι αλλαγές που κάνεις από το admin console **δεν** γράφονται εδώ αυτόματα, και το
`--import-realm` αγνοεί realm που υπάρχει ήδη (`IGNORE_EXISTING`). Οπότε:

- Για να ξαναδιαβαστεί το αρχείο από την αρχή: `docker compose down -v` και ξανά πάνω.
- Για να κρατήσεις αλλαγές που έκανες στο console, εξήγαγέ τες πίσω στο αρχείο:

  ```bash
  docker exec diploma-keycloak /opt/keycloak/bin/kc.sh export \
    --realm diploma --file /tmp/diploma-realm.json --users realm_file
  docker cp diploma-keycloak:/tmp/diploma-realm.json keycloak/diploma-realm.json
  ```

## Ομοσπονδία με το SSO του ιδρύματος

Το Keycloak εδώ κρατά δικούς του χρήστες. Σε πραγματική εγκατάσταση μπαίνει ως **identity
broker**: στο realm προστίθεται Identity Provider (SAML ή OIDC) προς το SSO του
Πανεπιστημίου και οι τοπικοί χρήστες φεύγουν. **Ο κώδικας της εφαρμογής δεν αλλάζει** —
εξακολουθεί να βλέπει το ίδιο OIDC endpoint και το ίδιο `realm_access.roles`.
