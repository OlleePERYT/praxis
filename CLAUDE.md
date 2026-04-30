# praxis-kennzahlen.de

## Stack
- Next.js 14 App Router
- SQLite + Drizzle ORM
- Auth.js (NextAuth v5)
- Caddy auf Hetzner VPS cx23, Ubuntu 24
- React 18 · Tailwind · Recharts

## Workflow (immer einhalten)
1. Explore – relevante Dateien lesen
2. Plan vorlegen – bei mehr als einer Datei nie direkt implementieren
3. Freigabe abwarten
4. Implement

Breaking Changes (DB-Schema, Auth, Routing, Rechenlogik):
Impact beschreiben → Freigabe abwarten, dann umsetzen.

## Kritische Regeln
- Jeder DB-Query zu Praxis-Daten braucht WHERE practice_id = ?
  Richtig: SELECT * FROM scenarios WHERE practice_id = ? AND id = ?
  Falsch:  SELECT * FROM scenarios WHERE id = ?
  Tenant-Isolation verletzt → sofort stoppen und melden
- Altbestand auf Vercel (kalk.peryt.de, 113.peryt.de) nie anfassen
- Keine Terminal-Editoren (nano, vim, vi) – nur cat/sed/tee
- Konstanten nie ohne explizite Freigabe ändern

## Konstanten
- AG = 1.21
- SACH_OHNE_MIETE = 24020
- Erlösmodi: nur "direct" und "mix"
- Mitarbeiterkosten: cost = rate * hours * 52 * AG
- offWeeks = (vacation + sick) / 5
- effWeeks = 52 - offWeeks
- effHours = hours * effWeeks

## Build-Reihenfolge
1. DB-Schema + Drizzle
2. Auth.js + Login
3. Middleware Subdomain-Routing