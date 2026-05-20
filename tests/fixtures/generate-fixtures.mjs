// Genera i file di test per la verifica massiva.
//
// 3 fixture create in tests/fixtures/:
//   1. folder-cartella/  -> cartella con file vuoti (nomi = codici da validare)
//   2. codici-test.csv   -> CSV con codici in colonna A, descrizione in colonna B
//   3. codici-test.xlsx  -> Excel con un foglio "Elaborati" + un foglio "Misto"
//
// Per ciascuno includo casi: OK ufficiali, OK formali fuori catalogo, WARNING, ERRORI.

import { mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import * as XLSX from "xlsx";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FOLDER_DIR = join(__dirname, "folder-cartella");

// === Casi di test (categorie esplicite per ricostruire risultati attesi) ===
const TEST_CASES = [
  // OK e in catalogo ufficiale
  { code: "RMB1284-ADD-ELENCELAB-XX-AM-Z-PD00001", desc: "ELENCO ELABORATI", expected: "ok" },
  { code: "RMB1284-ADD-RELGENERA-XX-RT-Z-PD00001", desc: "RELAZIONE GENERALE", expected: "ok" },
  { code: "RMB1284-ADD-PLANLIVEL-GF-DR-A-PD00001", desc: "Rilievo Piano terra", expected: "ok" },
  { code: "RMB1284-ADD-PLANLIVEL-G1-DR-D-PD00001", desc: "Demolizione selettiva Piano G1", expected: "ok" },
  { code: "RMB1284-ADD-PIASICCOO-XX-HS-D-PD00001", desc: "PSC", expected: "ok" },
  { code: "RMB1284-ADD-RELTECNIC-XX-RT-M-PD00005", desc: "Report di coordinamento (R1 update)", expected: "ok" },
  { code: "RMB1284-ADD-SPECIFCSP-XX-SM-Z-C00001", desc: "Capitolato Informativo CSP", expected: "ok" },
  { code: "RMB1284-ADD-SPECIFRIL-XX-SM-Z-S00001", desc: "Specifica Metodologica Rilievi", expected: "ok" },
  { code: "RMB1284-ADD-SPECIFPRO-XX-SM-Z-P00001", desc: "Specifica Metodologica Progettazione", expected: "ok" },

  // OK formalmente, ma fuori catalogo (warning sul fuori-catalogo, campi OK)
  // Nota: uso formato 6-char (senza Stato) per evitare combinazioni Servizio+Stato non valide
  { code: "RMB1284-ADD-PLANLIVEL-04-DR-A-E00099", desc: "Piano 4 in fase Esecutivo (formato 6-char)", expected: "out-of-catalog" },
  { code: "RMB1284-ADD-RELTECNIC-XX-RT-A-AN00099", desc: "Relazione As Built + Nuove costruzioni (composito)", expected: "out-of-catalog" },

  // WARNING — coerenza SPECIF*/servizio
  { code: "RMB1284-ADD-SPECIFCSP-XX-SM-Z-P00001", desc: "SPECIFCSP con servizio P invece di C", expected: "warning" },
  { code: "RMB1284-ADD-SPECIFRIL-XX-SM-Z-C00001", desc: "SPECIFRIL con servizio C invece di S", expected: "warning" },

  // WARNING — Codice Agenzia legacy ADM
  { code: "RMB1284-ADM-RM0411001-XX-RT-Z-PD00001", desc: "Codice Agenzia legacy ADM (Vulnerabilità Sismica)", expected: "warning" },

  // WARNING — codice documento valido ma non in tabella ufficiale
  { code: "RMB1284-ADD-PIPPOXXXX-XX-RT-Z-PD00001", desc: "Codice documento sconosciuto 9 char", expected: "warning" },

  // WARNING — tipo file non coerente col Codice Documento
  { code: "RMB1284-ADD-PLANGENER-XX-RT-Z-PD00001", desc: "PLANGENER (DR atteso) con RT", expected: "warning" },

  // WARNING — fase != 0
  { code: "RMB1284-ADD-ELENCELAB-XX-AM-Z-PD10001", desc: "Fase 1 (di norma 0)", expected: "warning" },

  // ERRORE — numero campi sbagliato (6 invece di 7)
  { code: "RMB1284-ADD-RELGENERA-XX-RT-Z", desc: "Campo 7 mancante", expected: "error" },

  // ERRORE — Codice Bene fuori formato
  { code: "RMB-ADD-RELGENERA-XX-RT-Z-PD00001", desc: "Codice Bene troppo corto", expected: "error" },

  // ERRORE — Codice Documento di 10 caratteri
  { code: "RMB1284-ADD-ELEVAZIONI-XX-RT-Z-PD00001", desc: "ELEVAZIONI (10 char) — bug della v0 ora corretto", expected: "error" },

  // ERRORE — Disciplina non riconosciuta (cifra invece di lettera)
  { code: "RMB1284-ADD-RELGENERA-XX-RT-9-PD00001", desc: "Disciplina cifra", expected: "error" },

  // ERRORE — Codice elaborato non valido (lettera in posizione cifra)
  { code: "RMB1284-ADD-RELGENERA-XX-RT-Z-PDX0001", desc: "Codice elaborato malformato (lettera in posizione cifra)", expected: "error" },

  // ERRORE — Codice elaborato troppo corto
  { code: "RMB1284-ADD-RELGENERA-XX-RT-Z-PD001", desc: "Codice elaborato troppo corto", expected: "error" },

  // ERRORE — Livello non noto
  { code: "RMB1284-ADD-RELGENERA-99-RT-Z-PD00001", desc: "Livello 99 non in tabella", expected: "warning" }, // formato OK, ma non in tab

  // ERRORE — progressivo 00 (deve partire da 01)
  { code: "RMB1284-ADD-ELENCELAB-XX-AM-Z-PD00000", desc: "Progressivo 00", expected: "warning" },

  // EDGE — input con spazi embedded (deve essere ripulito → match catalogo)
  { code: "RMB1284 -ADD-ELENCELAB-XX-AM-Z-PD00001", desc: "Spazi embedded (dovrebbero essere normalizzati)", expected: "ok" },
  { code: " RMB1284-ADD-RELGENERA-XX-RT-Z-PD00001 ", desc: "Spazi leading/trailing", expected: "ok" },
  { code: "rmb1284-add-relgenera-xx-rt-z-pd00001", desc: "Lowercase (deve essere uppercased)", expected: "ok" },

  // EDGE — 8 trattini (parti extra)
  { code: "RMB1284-ADD-ELENCELAB-XX-AM-Z-PD00001-EXTRA", desc: "8 parti invece di 7", expected: "error" },
];

console.log(`Generating ${TEST_CASES.length} test cases...`);

// === Pulizia precedente ===
if (existsSync(FOLDER_DIR)) {
  rmSync(FOLDER_DIR, { recursive: true });
}
mkdirSync(FOLDER_DIR, { recursive: true });

// === 1. Folder-cartella: file vuoti nominati come i codici ===
// Mixed extensions per simulare situazione reale
// Saltiamo i codici con spazi/lowercase: testano la validazione, non l'I/O
const EXTENSIONS = [".pdf", ".docx", ".dxf", ".xlsx", ".jpg"];
let ext_i = 0;
const fsUnsafe = (s) => /\s/.test(s) || /[a-z]/.test(s);
for (const tc of TEST_CASES) {
  if (fsUnsafe(tc.code)) continue; // skip per il filesystem
  const ext = EXTENSIONS[ext_i++ % EXTENSIONS.length];
  writeFileSync(join(FOLDER_DIR, `${tc.code}${ext}`), "");
}
// Aggiungo anche 2 file con nome del tutto fuori formato per testare resilienza
writeFileSync(join(FOLDER_DIR, "documento generico.pdf"), "");
writeFileSync(join(FOLDER_DIR, "appunti riunione 2026-05-20.docx"), "");
console.log(`✓ Folder fixture: ${TEST_CASES.length + 2} files in ${FOLDER_DIR}`);

// === 2. CSV ===
const csvHeader = "Codice;Descrizione;Esito atteso";
const csvBody = TEST_CASES.map(
  (tc) => `${tc.code};${tc.desc};${tc.expected}`
).join("\r\n");
const csvContent = "﻿" + csvHeader + "\r\n" + csvBody;
writeFileSync(join(__dirname, "codici-test.csv"), csvContent);
console.log(`✓ CSV fixture: ${TEST_CASES.length} rows in codici-test.csv`);

// === 3. XLSX (2 fogli: Elaborati + Misto con descrizione in altra colonna) ===
const wb = XLSX.utils.book_new();

// Foglio 1: "Elaborati" — codici in colonna A
const sheet1Data = [
  ["Codice", "Descrizione", "Esito atteso"],
  ...TEST_CASES.map((tc) => [tc.code, tc.desc, tc.expected]),
];
const ws1 = XLSX.utils.aoa_to_sheet(sheet1Data);
XLSX.utils.book_append_sheet(wb, ws1, "Elaborati");

// Foglio 2: "Misto" — codici in colonna B per testare il column picker
const sheet2Data = [
  ["#", "Codice", "Note"],
  ...TEST_CASES.map((tc, i) => [i + 1, tc.code, tc.desc]),
];
const ws2 = XLSX.utils.aoa_to_sheet(sheet2Data);
XLSX.utils.book_append_sheet(wb, ws2, "Misto");

XLSX.writeFile(wb, join(__dirname, "codici-test.xlsx"));
console.log(`✓ XLSX fixture: 2 sheets x ${TEST_CASES.length} rows in codici-test.xlsx`);

// === 4. expected-results.json — risultati attesi per i test ricorsivi ===
const expected = TEST_CASES.map((tc) => ({
  codice: tc.code,
  descrizione: tc.desc,
  expected: tc.expected,
}));
writeFileSync(
  join(__dirname, "expected-results.json"),
  JSON.stringify(expected, null, 2)
);
console.log(`✓ expected-results.json (${expected.length} cases)`);

// Stats per categoria
const stats = TEST_CASES.reduce(
  (acc, tc) => ({ ...acc, [tc.expected]: (acc[tc.expected] || 0) + 1 }),
  {}
);
console.log("\nSummary by expected status:");
Object.entries(stats).forEach(([k, v]) => console.log(`  ${k}: ${v}`));
