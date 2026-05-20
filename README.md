# MASE — Codifica Elaborati

Web app per la **generazione** e **verifica** dei codici file del progetto **MASE**
(Nuovo Ministero dell'Ambiente e della Sicurezza Energetica — Viale Boston, Roma)
secondo la naming convention BIMMS — Allegato H, Tabelle 13–16.

## Caratteristiche

- **Catalogo** — 81 codici elaborato pre-approvati dalla Stazione Appaltante
  (foglio "Codifica Elaborati" del file MASE_CodificaElaborati_R1.xlsx),
  organizzati in 9 gruppi tematici, con ricerca full-text e copia con un click.
- **Genera codice** — form a step con dropdown per ciascun campo della naming.
  Il tipo file viene auto-popolato in base al Codice Documento selezionato.
- **Verifica codice** — incolla un codice e ricevi diagnostica campo per campo.
  Cross-lookup automatico nel Catalogo: se il codice è ufficiale viene mostrata
  la descrizione approvata; altrimenti l'app segnala "verifica con SA".
- **Riferimenti** — consulta tutte le tabelle ufficiali (Codici Documento, Livelli,
  Tipi File, Discipline, Servizi e Stato/Fase) con ricerca incrementale.
- **Embed in SharePoint** — header CSP `frame-ancestors` già configurati per
  `*.sharepoint.com`, `*.office.com`, `*.microsoft.com`.

## Struttura della naming convention

```
<CodBene>-<CodAgenzia>-<CodDocumento>-<Livello>-<TipoFile>-<Disciplina>-<CodElaborato>
   C1         C2             C3           C4        C5          C6           C7
```

Esempio: `RMB1284-ADD-PLANLIVEL-GF-DR-A-PD0001` → Pianta Piano Terra,
Architettonica, PFTE + Demolizioni, Blocco Funzionale 00, Progressivo 01.

| Campo | Descrizione                              | Formato                        |
|-------|------------------------------------------|--------------------------------|
| C1    | Codice Bene                              | 3 lettere + 4 cifre            |
| C2    | Codice fisso Agenzia                     | 3 lettere (ADD)                |
| C3    | Codice Area / Fabbricato / Documento     | 6 / 9 / 9 caratteri            |
| C4    | Livello modello                          | 2 alfanumerici (Tab. 13)       |
| C5    | Tipo file                                | 2 caratteri (Tab. 14)          |
| C6    | Disciplina                               | 1 lettera (Tab. 15)            |
| C7    | Servizio + Stato/Fase + Blocco Funz + Progress. | `<L><L/N><NN><NN>` (Tab. 16) |

## Setup locale

Richiede **Node.js 24 LTS** o superiore.

```bash
npm install
npm run dev
# Apri http://localhost:3000
```

Build di produzione:

```bash
npm run build
npm start
```

## Deploy su Vercel

L'app è già configurata per il deploy su Vercel.

```bash
# Installa CLI Vercel (una sola volta)
npm i -g vercel

# Link al tuo account e deploy preview
vercel

# Promuovi in produzione
vercel --prod
```

Il file `vercel.ts` contiene la configurazione del progetto.
Gli header HTTP per l'embed in SharePoint sono definiti in `next.config.ts`.

## Embed in SharePoint

1. Esegui il deploy in produzione e copia l'URL pubblico (es. `https://mase-codifica.vercel.app`).
2. In SharePoint, modifica una pagina e aggiungi una web part **Embed**.
3. Incolla l'URL — la pagina caricherà l'app in iframe.

Se l'embed viene bloccato, l'amministratore del tenant SharePoint deve
aggiungere il dominio Vercel alla lista dei domini consentiti via HTML Field
Security.

## Architettura

```
.
├── app/                  # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx          # Home con tab Genera / Verifica / Riferimenti
│   └── globals.css       # Tailwind v4 + tema dark MASE
├── components/
│   ├── Generator.tsx     # Form generazione codice
│   ├── Validator.tsx     # Validazione di un codice incollato
│   ├── Reference.tsx     # Browser delle tabelle ufficiali
│   └── ui-primitives.tsx # Card, Input, Select, Badge...
├── lib/
│   ├── codifica-data.ts  # TUTTE le tabelle (Tab. 13-16, codici documento)
│   └── validator.ts      # Validazione deterministica campo per campo
├── next.config.ts        # Header CSP per SharePoint
└── vercel.ts             # Config deploy Vercel
```

## Aggiornare la naming convention

Tutte le tabelle vivono in **`lib/codifica-data.ts`**. Per aggiungere/modificare
codici, basta editare gli array `CODICI_DOCUMENTO`, `LIVELLI`, `TIPI_FILE`,
`DISCIPLINE`, `SERVIZI`, `STATI_FASI`.

Il validatore in `lib/validator.ts` usa direttamente questi array, quindi
qualsiasi modifica si riflette immediatamente sia nel Generator che nel Validator.

## Fonti (in ordine di autorità)

1. **BIMMS - Method Statement** (Linee Guida di Produzione Informativa) — Allegato H,
   Tabelle 13–16. Documento normativo dell'Agenzia del Demanio.
2. **Capitolato Informativo del Servizio MASE** (PDF):
   - `RMB1284-ADD-SPECIFCSP-XX-SM-Z-C00001.pdf` — Specifica Metodologica CSP, **Tabella 8 (20 codici)**
   - `RMB1284-ADD-SPECIFRIL-XX-SM-Z-S00001` — Specifica Metodologica Rilievi
   - `RMB1284-ADD-SPECIFPRO-XX-SM-Z-P00001` — Specifica Metodologica PFTE
3. **`MASE_CodificaElaborati_R1.xlsx`** (SharePoint MASE — 00_Documenti) — Catalogo operativo.

In caso di conflitto: **il PDF vince sull'Excel** (es. bug `ELEVAZIONI`→`ELEVAZION`
risolto in base al PDF). L'app codifica le regole con questa gerarchia.

## Cosa è codificato come autoritativo

| Aspetto | Fonte ufficiale | File codice |
|---------|----------------|-------------|
| Struttura 7 campi separati da `-` | BIMMS Allegato H | `NAMING_FULL_REGEX` |
| Formato Codice Bene (3L+4N) | BIMMS | `CODICE_BENE_REGEX` |
| Formato Codice Agenzia (3L) | BIMMS | `CODICE_AGENZIA_REGEX` |
| Codici Documento (es. PLANGENER, RELSISSIC, SPECIFCSP) | BIMMS + PDF Tab. 8 | `CODICI_DOCUMENTO` (86 voci) |
| Livelli modello (Tab. 13) | BIMMS | `LIVELLI` |
| Tipi File (Tab. 14) | BIMMS | `TIPI_FILE` |
| Discipline (Tab. 15) | BIMMS | `DISCIPLINE` |
| Servizi e Stato/Fase (Tab. 16) | BIMMS | `SERVIZI`, `STATI_FASI` |
| Coerenza SPECIF*↔ Servizio Campo 7 | PDF (riga 581-583) | regola in `validator.ts` |
| Codice agenzia legacy "ADM" | PDF (Tab. 5) | warning in `validator.ts` |

## Note importanti dall'analisi del PDF

- **MGENERALE** è un codice speciale del Campo 3 riservato a Modelli pluridisciplinari
  riferiti a porzioni di territorio esterne al perimetro del Bene (BIMMS §4.1.1.2).
- I file con Codice Agenzia **`ADM`** provengono da servizi precedenti del Demanio
  (Vulnerabilità Sismica) e usano un formato di codifica legacy del Campo 7
  (es. `0ZZ010` invece di `PD0001`). Il validator emette un warning.
- Esistono **3 Capitolati Informativi paralleli** per il MASE: CSP, RIL (Rilievi),
  PRO (Progettazione). La prima lettera del Servizio nel Campo 7 deve corrispondere:
  `SPECIFCSP→C`, `SPECIFRIL→S`, `SPECIFPRO→P`. Il validator verifica questa coerenza.
