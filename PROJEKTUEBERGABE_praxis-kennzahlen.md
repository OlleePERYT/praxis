# Projektübergabe: praxis-kennzahlen.de
**Stand: 30. April 2026**  
**Erstellt aus: Projektgesprächen + PROJECT_DOKUMENTATION.md**

---

## 1. Worum es geht

### Produkt
**praxis-kennzahlen.de** ist ein wirtschaftlicher Szenario-Simulator für Physiotherapie- und Therapiepraxen. Inhaber bewegen Regler (Therapeutenstunden, Stundenlohn, Stundensatz, Personalstruktur, Mietkosten) und sehen in Echtzeit, wie sich Änderungen auf den Praxisüberschuss auswirken.

**Es ist kein BWA-Dashboard und kein Controlling-Tool.** Es ist eine Entscheidungs-Spielwiese für strategische Fragen:
- Lohnt es sich, eine weitere Therapeutin einzustellen?
- Was passiert, wenn ich den Stundenlohn auf 26 € anhebe?
- Was bringt es, einen Raum unterzuvermieten?
- Wie viele Privatpatienten brauche ich, um GKV-Abhängigkeit zu reduzieren?

### Marktlücke
Steuerberater liefern Vergangenheit (BWA als PDF, einmal im Quartal). Praxisverwaltungssoftware (buchnerFLOW, MD Therapie, iPrax, NOVENTI Ora) deckt das Operative ab (Termine, Abrechnung, Dokumentation). **Niemand liefert eine Was-wäre-wenn-Spielwiese für Praxisstrategie.** Das ist die Lücke.

### Geschäftsmodell (bewusste Entscheidungen)
- **Einmalverkauf pro Praxis, kein Abo.** Perpetual License, aktuelle Version.
- **Eine Lizenz = eine Betriebsstätte (eine Steuernummer).** Technisch und vertraglich erzwungen.
- **Neue Features = neuer Preis.** Updates explizit aus der Lizenz ausgeschlossen.
- **Zielpreis: 690 € pro Praxis, einmalig** (Onboarding + Einrichtung durch Verkäufer inklusive).
- **Optional White-Label auf Kundendomain: +200 € Aufpreis** (technisch aufwändiger, DNS-Setup erforderlich).
- **Kein langfristiges Geschäft angestrebt.** Nebenprojekt, klar begrenzt.

### Zielkunden
- Inhaber von Physiotherapie-, Ergo-, Logo- und Podologie-Praxen in Deutschland
- Einstieg über persönliche Netzwerk-Empfehlung (kein Marketing geplant)
- Erste drei Interessenten bereits vorhanden (über Physio-Netzwerk des Verkäufers)

---

## 2. Was bereits existiert (Altbestand)

### 2.1 Bestehende Tools (auf peryt.de / Vercel)

Das Projekt existiert bereits als funktionierender Prototyp. Es gibt **zwei laufende Rechner-Varianten** in einem einzigen Vite+React-Build:

| Subdomain | Datei | Funktion |
|---|---|---|
| `kalk.peryt.de` | `praxis_rechner.jsx` | Interner Rechner mit GF-Gehalt, Mietlogik, Ergebnis vor Steuern |
| `113.peryt.de` | `praxis_planer_praesentation.jsx` | Planungsrechner mit JSON-Export/Import, für Praxis-Präsentation |

**Aktueller Deployment-Weg:** Vercel (GitHub Actions CI/CD auf Push nach `main`). Die beiden Rechner laufen unter verschiedenen Subdomains auf Vercel, nicht auf dem eigenen Hetzner-VPS.

### 2.2 Tech-Stack (Altbestand)

```
Build:        Vite 6
Frontend:     React 18
Styling:      Tailwind CSS + Inline-Styles (Farbpalette per const C = {...})
Charts:       Recharts (PieChart, BarChart)
Persistenz:   localStorage (kein Backend)
Deployment:   Vercel + GitHub Actions
```

### 2.3 Fachliches Datenmodell (bereits implementiert)

**Mitarbeiter-Struktur (bis zu 5 Slots):**
```
name        String
hours       Wochenstunden (Number)
rate        Bruttostundenlohn €/h (Number)
vacation    Urlaubstage/Jahr (Number)
sick        Krankheits-/Weiterbildungstage/Jahr (Number)
```

**Rechenlogik (bereits validiert):**
```
AG           = 1.21  (Arbeitgeberfaktor inkl. AG-Anteil SV)
WEEKS        = 52
SACH_OHNE_MIETE = 24.020 € (Jahresfixkosten ohne Miete – kann Slider werden)

Pro Mitarbeiter:
  offWeeks   = (vacation + sick) / 5
  effWeeks   = 52 - offWeeks
  effHours   = hours * effWeeks
  cost       = rate * hours * 52 * AG

Erlösmodus "direct":
  effectiveRevPerHour = revPerHour (direkter €/Stunde-Wert)

Erlösmodus "mix":
  selfPct    = max(0, 100 - gkvPct - pkvPct)
  avgPerTreatment = gewichteter Schnitt aus GKV/PKV/Selbstzahler
  effectiveRevPerHour = avgPerTreatment * treatmentsPerHour * (utilization/100)

Umsatz:
  revenue = totalEffHours * effectiveRevPerHour
```

**Vollständige Liste aller aktuellen Eingabewerte (aus dem Code):**

*Pro Mitarbeiter (5 Slots):*
- Name (Text)
- Wochenstunden (0–40, Schritte 5)
- Stundenlohn €/h
- Urlaubstage/Jahr
- Krankheits-/Weiterbildungstage/Jahr

*Erlös-Modell (Umschalter zwischen zwei Modi):*
- Modus: "direct" oder "mix"
- **Direct:** € pro Anwesenheitsstunde
- **Mix:** GKV-Anteil %, PKV-Anteil %, (Selbstzahler errechnet sich), Ø GKV-Vergütung/Behandlung €, Ø PKV-Vergütung/Behandlung €, Ø Selbstzahler/Behandlung €, Behandlungen pro Stunde, Behandlungsauslastung %

*Sonstige Erlöse:*
- Untermiete €/Monat

*Kosten:*
- Miete €/Monat (oder Jahresbasis)
- Sachkosten (aktuell Fixwert 24.020 €, soll Slider werden)

*Nur im kalk-Rechner (intern):*
- GF-Gehalt €/Monat
- GF-Split % (Anteil dieser Praxis)
- GF SV-frei Toggle

**GKV-Referenzsätze 2026 (recherchiert, für Benchmark-Funktion):**

| Leistung | GKV-Preis | Dauer |
|---|---|---|
| KG (Allgemeine Krankengymnastik) | 29,63 € | 20 Min. |
| Manuelle Therapie (MT) | 35,59 € | 20 Min. |
| MLD 30 Min. | 33,75 € | 30 Min. |
| MLD 45 Min. | 53,94 € | 45 Min. |
| KG-ZNS Bobath Erw. | 47,06 € | 30 Min. |
| Massage | 21,63 € | 20 Min. |
| Fango/Warmpackung | 18,70 € | Zusatz |
| Hausbesuch | 22,78 € | Zusatz |

*PKV-Vergütung typisch: 1,4× GKV-Satz*

### 2.4 UI-Komponenten (bereits vorhanden)

- **StepSlider** (`src/StepSlider.jsx`) – einheitliches Eingabeelement mit +/- Buttons, Direkteingabe, step-genaues Runden, Accessibility (fieldset/legend, aria-label)
- **Sticky KPI-Leiste** oben
- **Mitarbeiterkarten** pro Person
- **PieChart** (Kostenverteilung, Erlösanteile)
- **BarChart** (Referenz vs. Modell)
- **JSON-Export/Import** (im 113-Rechner)

---

## 3. Was neu gebaut wird

### 3.1 Ziel der neuen Version

Ein **Multi-Tenant-System** unter `praxis-kennzahlen.de`, bei dem:
- Jede Praxis eine eigene Subdomain bekommt (`praxis-meier.praxis-kennzahlen.de`)
- Jede Praxis ein eigenes Login hat
- Die Rechen-Engine aus dem Altbestand übernommen und erweitert wird
- Szenarien gespeichert und geladen werden können
- Branchenbenchmarks angezeigt werden

### 3.2 Was aus dem Altbestand übernommen wird

**Zu übernehmen (1:1 oder leicht angepasst):**
- Die gesamte Rechen-Engine (Formeln, Konstanten, Mitarbeiterlogik)
- StepSlider-Komponente
- Erlösmodi "direct" und "mix" mit allen Eingabefeldern
- Farbsystem-Konzept (const C = {...} pro Praxis)
- Mobile-First-Ansatz

**Nicht zu übernehmen:**
- localStorage-Persistenz → wird durch echte DB ersetzt
- Host-basiertes Routing in App.jsx → wird durch DB-basiertes Tenant-Routing ersetzt
- Vercel-Deployment → wird durch eigenen Hetzner-VPS ersetzt
- GF-Gehalt-Block aus kalk-Rechner → wird in neue Praxis-Konfiguration überführt

### 3.3 Neuer Tech-Stack

```
Framework:    Next.js 14+ (App Router)
Datenbank:    SQLite mit Drizzle ORM
Auth:         Auth.js (NextAuth) – E-Mail + Passwort
Webserver:    Caddy (bereits auf VPS, mit Hetzner-DNS-Plugin)
Hosting:      Hetzner Cloud VPS cx23 (bereits vorhanden)
Process Mgr:  PM2 oder systemd
```

**Warum Next.js:** Subdomain-Erkennung über Middleware ist eingebaut, React-Komponenten aus dem Altbestand übertragbar, Cursor versteht Next.js exzellent.

**Warum SQLite + Drizzle:** Eine Datei zum Sichern, kein Datenbankserver zu warten, ausreichend für 1–50 Praxen. Drizzle ermöglicht späteren Wechsel auf Postgres ohne Rewrite.

**Warum SQLite statt localStorage:** Multi-Tenant und Login funktionieren nur serverseitig.

### 3.4 Datenmodell (neu)

**Drei Tabellen:**

```sql
-- Tabelle 1: Praxen (Tenants)
practices
  id            INTEGER PRIMARY KEY
  subdomain     TEXT UNIQUE        -- z. B. "praxis-meier"
  name          TEXT               -- "Praxis Meier"
  logo_path     TEXT               -- Pfad zur Logo-Datei
  config        TEXT (JSON)        -- komplette Praxis-Konfiguration (Mitarbeiter, Stundensätze, Kosten)
  created_at    DATETIME

-- Tabelle 2: Nutzer
users
  id            INTEGER PRIMARY KEY
  practice_id   INTEGER FOREIGN KEY → practices.id
  email         TEXT UNIQUE
  password_hash TEXT
  created_at    DATETIME

-- Tabelle 3: Szenarien
scenarios
  id            INTEGER PRIMARY KEY
  practice_id   INTEGER FOREIGN KEY → practices.id
  name          TEXT               -- "Status quo", "Mit neuem Therapeuten"
  data          TEXT (JSON)        -- alle Regler-Werte dieses Szenarios
  created_at    DATETIME
```

**Config-JSON-Struktur pro Praxis (Beispiel):**
```json
{
  "employees": [
    { "name": "Therapeutin 1", "hours": 25, "rate": 26, "vacation": 30, "sick": 5 }
  ],
  "revenueMode": "mix",
  "gkvPct": 66,
  "pkvPct": 30,
  "gkvPerTreatment": 35,
  "pkvPerTreatment": 49,
  "treatmentsPerHour": 2.0,
  "utilization": 73,
  "mieteMonat": 1300,
  "untermiete": 300,
  "sachkosten": 24020
}
```

---

## 4. Priorisiertes Backlog (v1.0 für 1–2 Pilotkunden)

### MUSS – ohne das kein Verkauf (Woche 1)

| # | Aufgabe | Details |
|---|---|---|
| 1 | **Login-System** | Auth.js mit E-Mail + Passwort. Ein User pro Praxis ausreichend. |
| 2 | **Praxis-Konfiguration in DB** | Practice-Tabelle anlegen. Config als JSON-Feld. Beim Login richtige Practice laden. |
| 3 | **Subdomain-Routing** | Next.js Middleware liest `Host`-Header, mappt auf Practice. `praxis-meier.praxis-kennzahlen.de` → Practice "praxis-meier". |
| 4 | **Rechen-Engine portieren** | Formeln aus Altbestand 1:1 übernehmen, auf DB-Config umstellen. Alle Eingabefelder (Mitarbeiter, Erlösmodi, Kosten) müssen funktionieren. |
| 5 | **Datenschutz-Basis** | Impressum, Datenschutzerklärung, AVV-Vorlage (PDF), AGB mit 3 Schutzpunkten. |
| 6 | **Verkaufsseite** | Simple Landing Page auf `praxis-kennzahlen.de` mit Preis (690 €), Funktions-Highlights, Kontaktformular. |

### SOLL – professioneller erster Eindruck (Woche 2)

| # | Aufgabe | Details |
|---|---|---|
| 7 | **Onboarding-Erlebnis** | Beim ersten Login: Begrüßung mit Praxisname, voreingestellte Daten (von Verkäufer manuell eingespielt), kurze Anleitung. |
| 8 | **Logo-Upload** | Praxis lädt eigenes Logo hoch, erscheint oben links. Hoch Wow-Effekt. |
| 9 | **PDF-Export** | "Aktuelles Szenario exportieren"-Button. Erste Version: Print-CSS + Browser-Druck. |
| 10 | **Szenarien speichern (Light)** | Bis zu 3 benannte Szenarien pro Praxis. CRUD auf JSON-Feld in der Practice. |

### KANN – falls Zeit übrig (Woche 3)

| # | Aufgabe | Details |
|---|---|---|
| 11 | **Branchenbenchmarks** | Hardcodiertes JSON: Personalkostenquote branchenüblich 35–45 %, Privatpatientenanteil. Tooltip am Wert: "Sie liegen bei 62 %, Branche bei 35–45 %". |
| 12 | **Mobile-Optimierung** | Breakpoints prüfen, Slider auf Touch testen. |
| 13 | **Backup-Strategie** | Cron-Job: tägliches Backup der SQLite-Datei auf Hetzner Storage Box. |

### NICHT JETZT – spätere kostenpflichtige Upgrades

Diese Features **bewusst** nicht in v1.0:

| Feature | Upgrade-Preis (Richtwert) |
|---|---|
| BWA-PDF-Import (DATEV-Format) | 190 € |
| Mehrjahres-Trend-Analyse | 90 € |
| Szenarien-Vergleichsmodus (2 nebeneinander) | 90 € |
| Mehrere Standorte / Filialvergleich | 190 € |
| Custom-Domain für Kunden (CNAME-Setup) | 200 € (einmalig) |
| Steuerberater-Lesezugang (Read-only-Link) | 90 € |
| Self-Service-Onboarding-Wizard | intern |
| Stripe-Zahlungsintegration | intern |
| Admin-Backend | intern |

---

## 5. Infrastruktur (bereits erledigt)

### 5.1 Domain

- **`praxis-kennzahlen.de` ist registriert** (Hetzner, 30.04.2026)
- Markenrechtlich geprüft: **keine Treffer** im DPMA für "Praxiskennzahlen" und "Praxis-Kennzahlen"
- Hinweis: `praxiskennzahlen.de` (ohne Bindestrich) ist von Domain-Reseller geparkt → kein Handlungsbedarf bei 1–2 Pilotkunden (Weiterleitung per Link, kein Tippen aus Gedächtnis)
- Hinweis: `PraxisCockpit` ist als **eingetragene Wortmarke** geschützt (André Martin, Registernr. 302022206369, Klassen 35/36/42/45, gültig bis 2032) → dieser Name ist **tabu**

### 5.2 VPS (Hetzner Cloud cx23)

```
Server:       Hetzner Cloud cx23
              2 vCPU | 4 GB RAM | 40 GB SSD
Hostname:     peryt-vps
OS:           Ubuntu 24 (Noble)
Webserver:    Caddy (active, running seit 02.04.2026)
```

**Bereits laufende Subdomains auf dem VPS:**
- `peryt.de`
- `matrix.peryt.de`
- `wahl.peryt.de`
- `bass-finanzen.peryt.de`
- `tasks.peryt.de`
- `cloud.peryt.de`
- `kalk.peryt.de` (Altbestand, läuft weiter via Vercel, nicht VPS)
- `113.peryt.de` (Altbestand, läuft weiter via Vercel, nicht VPS)

**Offener Punkt:** Kernel-Upgrade ausstehend (6.8.0-101 statt 6.8.0-110). Beim nächsten Wartungsfenster rebooten.

### 5.3 Caddy – Status und nächste Schritte

**Bereits erledigt:**
- ✅ Caddy läuft (v2.11.2, systemd-managed)
- ✅ Neues Caddy-Binary mit **Hetzner-DNS-Plugin** gebaut und installiert (`github.com/caddy-dns/hetzner`)
- ✅ Altes Binary als Backup gesichert (`/usr/bin/caddy.backup`)
- ✅ Caddy neu gestartet, läuft stabil

**Noch ausstehend (nächste Sitzung):**
- ⬜ Hetzner DNS API Token erstellen (dns.hetzner.com → API Tokens → Create)
- ⬜ DNS-Zone für `praxis-kennzahlen.de` in Hetzner DNS Console anlegen
- ⬜ Drei A-Records setzen (@ / www / * → VPS-IP)
- ⬜ Caddyfile erweitern (Wildcard-SSL + neue Domain-Blöcke)
- ⬜ Caddy reload und SSL-Zertifikat-Abruf verifizieren
- ⬜ Holdingseite hochladen

**Caddyfile-Snippet (vorbereitet, noch nicht eingespielt):**

```caddyfile
# Globaler Block – ganz oben in die Caddyfile
{
    acme_dns hetzner DEIN_HETZNER_DNS_API_TOKEN
}

# Hauptseite
praxis-kennzahlen.de, www.praxis-kennzahlen.de {
    root * /var/www/praxis-kennzahlen
    file_server
}

# Wildcard für alle Kunden-Subdomains → Next.js App
*.praxis-kennzahlen.de {
    tls {
        dns hetzner DEIN_HETZNER_DNS_API_TOKEN
    }
    reverse_proxy localhost:3000
}
```

**Token-Sicherheit:** API Token nicht hardcoded in Caddyfile, sondern als Umgebungsvariable einbinden (Caddy unterstützt `{env.HETZNER_DNS_TOKEN}`).

### 5.4 Architektur-Entscheidungen (final)

```
Routing:      Caddy Wildcard → Next.js App (Port 3000)
Multi-Tenant: Modell A – Eine App, eine DB, Tenant-ID per Subdomain
              (nicht Container-basiert, nicht statische Builds)
Datenbank:    SQLite (eine Datei, täglich gesichert)
ORM:          Drizzle (typsicher, späteren Postgres-Wechsel ermöglicht)
Auth:         Auth.js (NextAuth)
Assets:       Logos im Dateisystem (/var/www/praxis-kennzahlen/uploads/)
Process Mgr:  PM2 oder systemd unit für Next.js
Backup:       Cron → Hetzner Storage Box (täglich, 14 Tage Retention)
```

---

## 6. Lizenz- und Rechtsrahmen

### AGB – drei Kern-Punkte (müssen rein)

1. **Eine Lizenz = eine Betriebsstätte** mit einer Steuernummer. Filialen und weitere Praxen benötigen eigene Lizenzen.
2. **Hosting-Garantie 3 Jahre** ab Kaufdatum, danach „nach Verfügbarkeit".
3. **Updates ausgeschlossen.** Käufer erhält Version zum Kaufzeitpunkt. Bugfixes 12 Monate inklusive. Neue Funktionen werden als separate Module angeboten.

### DSGVO-Pflichten

- Auftragsverarbeitungsvertrag (AVV) – Vorlage erstellen, bei Kauf zu unterschreiben
- Datenschutzerklärung auf jeder Subdomain
- Impressum auf jeder Subdomain
- Recht auf Datenmitnahme (DSGVO Art. 20) – Export aller Praxisdaten als JSON
- Recht auf Löschung – per E-Mail-Anfrage
- Server in Deutschland ✅ (Hetzner, Falkenstein/Nürnberg)

### Preismodell (final)

| Produkt | Preis |
|---|---|
| Standard-Lizenz (Subdomain auf praxis-kennzahlen.de) | **690 € einmalig** |
| White-Label-Option (eigene Kundendomain per CNAME) | **+200 € einmalig** |
| Upgrade-Features (einzeln buchbar, ab v1.1) | **90–190 € je Feature** |

Bestellprozess v1.0 (manuell):
1. Interessent kontaktiert über Formular
2. Verkäufer stellt Rechnung (Word/PDF), Zahlung per Überweisung
3. Nach Zahlungseingang: Verkäufer legt Praxis-Instanz an, spielt BWA-Daten ein, sendet Login

---

## 7. Onboarding-Prozess (manuell, v1.0)

Für die ersten 1–5 Kunden macht der Verkäufer das Setup manuell:

1. **BWA der Praxis durchgehen** (30–60 Minuten) – relevante Werte extrahieren: Mitarbeiterstruktur, Stundensätze GKV/PKV, Mietkosten, aktuelle Sachkosten
2. **Practice in DB anlegen** – Subdomain wählen (z. B. `praxis-meier`), Config-JSON befüllen
3. **User anlegen** – E-Mail der Praxis, Passwort generieren
4. **Logo hochladen** falls vorhanden
5. **Login-Daten per E-Mail senden** (sicher: Passwort separat von Username)
6. **30-minütiger Onboarding-Call** – Regler erklären, erste Szenarien gemeinsam durchspielen

Ziel: Beim ersten Login sieht die Praxis ihre eigenen Zahlen, nicht Beispieldaten.

---

## 8. Abgrenzung Altbestand vs. Neubau

| | Altbestand (peryt.de / Vercel) | Neubau (praxis-kennzahlen.de / VPS) |
|---|---|---|
| **Zweck** | Persönliche Analyse-Tools (Praxiskauf) | Verkaufbares Produkt |
| **Kunden** | Nur du selbst | Externe zahlende Praxen |
| **Persistenz** | localStorage | SQLite (serverseitig) |
| **Login** | Kein Login | Auth.js |
| **Deployment** | Vercel (bleibt bestehen) | Hetzner VPS |
| **Domain** | peryt.de / Subdomains | praxis-kennzahlen.de |
| **Status** | Läuft weiter, wird nicht angefasst | Wird neu aufgebaut |

**Der Altbestand auf Vercel bleibt unverändert laufen.** Er ist nicht Teil dieses Projekts.

---

## 9. Zeitplan

| Woche | Ziel | Ergebnis |
|---|---|---|
| **1** | Infrastruktur fertig + App-Grundgerüst | DNS live, SSL, Next.js auf VPS, Login funktioniert, eine Praxis manuell anlegbar |
| **2** | Kern-Features + erste Praxis live | Rechen-Engine portiert, Logo-Upload, PDF-Export, Szenarien speichern |
| **3** | Puffer + Politur | Feedback Pilot-Kunde einarbeiten, Benchmarks, Mobile-Check, Backup |

---

## 10. Offene Entscheidungen / To-dos vor dem ersten Commit

- [ ] Hetzner DNS API Token erstellen (dns.hetzner.com)
- [ ] DNS-Zone `praxis-kennzahlen.de` anlegen + A-Records setzen
- [ ] Caddyfile anpassen (Wildcard-SSL aktivieren)
- [ ] Next.js-Projekt initialisieren (`npx create-next-app@latest`)
- [ ] Drizzle + better-sqlite3 installieren
- [ ] Auth.js installieren und konfigurieren
- [ ] Drei DB-Tabellen anlegen (practices, users, scenarios)
- [ ] Middleware für Subdomain-Routing schreiben
- [ ] Rechen-Engine aus Altbestand portieren
- [ ] Holdingseite auf praxis-kennzahlen.de hochladen
- [ ] AVV-Vorlage erstellen
- [ ] AGB-Text mit den 3 Schutzpunkten erstellen
- [ ] VPS rebooten (Kernel-Upgrade, beim nächsten Wartungsfenster)
- [ ] Backup-Cron einrichten (nach erster Praxis live)

---

## 11. Cursor-Prompting-Hinweise

Für die Arbeit mit Cursor (der primäre Entwicklungsweg):

**Was Cursor gut kann:**
- Next.js App Router mit Middleware
- Drizzle ORM Schema-Definition und Migrations
- Auth.js Konfiguration
- React-Komponenten aus JSX portieren
- Tailwind Styling

**Was Cursor-Prompts explizit enthalten sollten:**
- „Nutze Next.js 14 App Router, nicht Pages Router"
- „SQLite mit Drizzle ORM, nicht Prisma"
- „Auth.js (NextAuth v5), nicht selbstgebaute Authentifizierung"
- „Subdomain aus dem Host-Header lesen, nicht aus URL-Parametern"
- „Tenant-Isolation sicherstellen: kein SQL-Query ohne WHERE practice_id = ?"

**Reihenfolge für den ersten Cursor-Sprint:**
1. Erst: DB-Schema (practices, users, scenarios) + Drizzle-Setup
2. Dann: Auth.js + Login-Flow
3. Dann: Middleware für Subdomain-Routing
4. Dann: Rechen-Engine portieren
5. Dann: UI-Komponenten aufbauen

---

## 12. Kontakt / Hintergrund

- **Verkäufer / Entwickler:** Herr Stöcker (Hetzner-Account-Inhaber)
- **Erster Vertriebskanal:** Physio-Netzwerk (3 Interessenten bereits bekannt)
- **Ursprung des Projekts:** Analyse-Tools für eigenen Praxiskauf (Praxis 113, Berlin), daraus Produkt-Idee entstanden
- **Verwandte Artefakte:**
  - `Finanzdossier_Annegret_Stoecker_2024.pdf` (Praxis-Analyse, Referenz für Datenstruktur)
  - `Aktuelle_BWA_3_Jahre.pdf` (Praxis 113, Schraudolph/Michalke, 2023–2025)
  - `PROJECT_DOKUMENTATION.md` (Altbestand-Doku, als Basis für dieses Dokument genutzt)

---

*Dieses Dokument ersetzt alle vorherigen Einzelnotizen und ist der einzige authoritative Startpunkt für das neue Projekt.*  
*Bei Widersprüchen zwischen diesem Dokument und älteren Chat-Verläufen gilt dieses Dokument.*
