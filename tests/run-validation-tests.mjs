// Test runner ricorsivo per il validator.
//
// Itera N volte (default 3) per stabilità.
// Per ogni caso confronta l'esito previsto in expected-results.json.
//
// USO:
//   node tests/run-validation-tests.mjs [iterazioni]
//
// Output: report colorato + exit code 0 (tutti OK) / 1 (almeno un fallimento).

import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as XLSX from "xlsx";

// Caricamento dinamico del validator (è TypeScript: lo importiamo via tsx)
import { validaCodiceCompleto } from "../lib/validator.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES = join(__dirname, "fixtures");
const ITERATIONS = parseInt(process.argv[2] || "3", 10);

// Caricamento expected results
const expected = JSON.parse(
  readFileSync(join(FIXTURES, "expected-results.json"), "utf-8")
);

// === Categorizza il risultato del validator ===
function categorize(validation) {
  const hasError = validation.campi.some(
    (c) => c.status === "error" || c.status === "empty"
  );
  const hasWarning = validation.campi.some((c) => c.status === "warning");

  if (hasError) return "error";
  if (hasWarning) return "warning";
  if (validation.valid && validation.inCatalogo) return "ok";
  if (validation.valid && !validation.inCatalogo) return "out-of-catalog";
  return "unknown";
}

// === Esegue un giro di test ===
function runIteration(label) {
  let pass = 0;
  let fail = 0;
  const failures = [];

  for (const tc of expected) {
    const result = validaCodiceCompleto(tc.codice);
    const actual = categorize(result);
    // Tolleranza: "out-of-catalog" è accettabile anche se l'expected è "ok" — l'app
    // segna formalmente OK ma indica fuori catalogo. Quindi consideriamo OK == out-of-catalog
    // SOLO se il test atteso era già out-of-catalog. Altrimenti distinzione netta.
    const matches = actual === tc.expected;

    if (matches) {
      pass++;
    } else {
      fail++;
      failures.push({
        codice: tc.codice,
        atteso: tc.expected,
        ottenuto: actual,
        descrizione: tc.descrizione,
        diagnostica: result.campi
          .filter((c) => c.status !== "ok" && c.status !== "empty")
          .map((c) => `C${c.campo}[${c.status}]: ${c.messaggio}`),
      });
    }
  }

  return { iteration: label, pass, fail, failures, total: expected.length };
}

// === Loader: verifica anche fixture xlsx/csv ===
function checkXlsxFixture() {
  const buf = readFileSync(join(FIXTURES, "codici-test.xlsx"));
  const wb = XLSX.read(buf, { type: "buffer" });
  const errs = [];
  if (!wb.SheetNames.includes("Elaborati")) errs.push("foglio 'Elaborati' mancante");
  if (!wb.SheetNames.includes("Misto")) errs.push("foglio 'Misto' mancante");
  const sheet1 = XLSX.utils.sheet_to_json(wb.Sheets["Elaborati"], { header: 1 });
  if (sheet1.length !== expected.length + 1) {
    errs.push(`Elaborati: ${sheet1.length - 1} righe, attese ${expected.length}`);
  }
  return errs;
}
function checkCsvFixture() {
  const content = readFileSync(join(FIXTURES, "codici-test.csv"), "utf-8");
  const lines = content.split(/\r?\n/).filter((l) => l.trim());
  const errs = [];
  if (lines.length !== expected.length + 1) {
    errs.push(`CSV: ${lines.length - 1} righe, attese ${expected.length}`);
  }
  return errs;
}
function checkFolderFixture() {
  const files = readdirSync(join(FIXTURES, "folder-cartella"));
  const errs = [];
  // Conta solo i casi che possono essere file (no spazi, no lowercase nel codice)
  const fsSafe = expected.filter(
    (tc) => !/\s/.test(tc.codice) && !/[a-z]/.test(tc.codice)
  );
  if (files.length < fsSafe.length) {
    errs.push(`Folder: ${files.length} file, attesi >= ${fsSafe.length} (fs-safe)`);
  }
  return errs;
}

// === MAIN ===
const C = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

console.log(`${C.bold}${C.cyan}═══ MASE Validator — Recursive Test Runner ═══${C.reset}`);
console.log(`Iterations: ${ITERATIONS} · Cases: ${expected.length}\n`);

// Sanity check fixture
console.log(`${C.dim}Checking fixtures...${C.reset}`);
const fixtureErrs = [
  ...checkXlsxFixture(),
  ...checkCsvFixture(),
  ...checkFolderFixture(),
];
if (fixtureErrs.length) {
  console.log(`${C.red}✗ Fixture issues:${C.reset}`);
  fixtureErrs.forEach((e) => console.log(`  - ${e}`));
  process.exit(2);
}
console.log(`${C.green}✓ All fixtures valid${C.reset}\n`);

// Iterazioni
let allFailures = [];
let allPass = 0;
let allFail = 0;

for (let i = 1; i <= ITERATIONS; i++) {
  const { pass, fail, failures, total } = runIteration(`Iter ${i}`);
  allPass += pass;
  allFail += fail;
  const color = fail === 0 ? C.green : C.red;
  console.log(
    `${color}Iter ${i}/${ITERATIONS}: ${pass}/${total} pass${C.reset}` +
      (fail > 0 ? `, ${fail} fail` : "")
  );
  if (i === 1 && failures.length > 0) {
    allFailures = failures; // dettagli solo dal primo giro (gli altri sono deterministici)
  }
}

console.log("");
if (allFail === 0) {
  console.log(
    `${C.bold}${C.green}✓ TUTTI I TEST PASSATI — ${allPass}/${ITERATIONS * expected.length} run-checks${C.reset}`
  );
  process.exit(0);
} else {
  console.log(
    `${C.bold}${C.red}✗ ${allFail} FALLIMENTI su ${ITERATIONS * expected.length} run-checks${C.reset}\n`
  );
  console.log(`${C.bold}Dettaglio fallimenti (prima iterazione):${C.reset}`);
  allFailures.forEach((f, idx) => {
    console.log(
      `\n${C.yellow}${idx + 1}. ${f.codice}${C.reset}\n` +
        `   ${C.dim}${f.descrizione}${C.reset}\n` +
        `   Atteso: ${C.bold}${f.atteso}${C.reset}  Ottenuto: ${C.red}${f.ottenuto}${C.reset}`
    );
    if (f.diagnostica.length) {
      f.diagnostica.forEach((d) => console.log(`   ${C.dim}→ ${d}${C.reset}`));
    }
  });
  process.exit(1);
}
