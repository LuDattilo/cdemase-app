/**
 * Internazionalizzazione leggera — IT (default) ed EN.
 *
 * Strategia: chiavi gerarchiche (es. "tab.catalogo"), dizionari in oggetti,
 * fallback automatico su italiano se la chiave manca in inglese.
 *
 * Persistenza in localStorage. Custom event per sincronizzare i componenti.
 */

export type Locale = "it" | "en";

const STORAGE_KEY = "mase-locale";
const CHANGE_EVENT = "mase-locale-change";

const IT: Record<string, string> = {
  // App shell
  "app.title": "MASE — Codifica Elaborati",
  "app.subtitle": "Nuovo Ministero dell'Ambiente e della Sicurezza Energetica",
  "app.docref": "Linee Guida BIMMS — Allegato H",

  // Tabs
  "tab.catalogo": "Catalogo",
  "tab.genera": "Genera codice",
  "tab.verifica": "Verifica codice",
  "tab.riferimenti": "Riferimenti",

  // Header controls
  "header.theme.light": "Tema chiaro",
  "header.theme.dark": "Tema scuro",
  "header.theme.toggle": "Cambia tema",
  "header.lang.it": "Italiano",
  "header.lang.en": "Inglese",
  "header.lang.toggle": "Cambia lingua",
  "header.specs.open": "Apri Capitolato",
  "header.specs.title": "Capitolato Informativo MASE - Specifica Metodologica CSP",
  "header.specs.short": "Specifiche",

  // Catalog
  "catalog.title": "Catalogo elaborati MASE",
  "catalog.backup": "Backup",
  "catalog.backup.title": "Esporta i tuoi codici come JSON",
  "catalog.search.placeholder": "Cerca: planimetria, demolizione, PD00001...",
  "catalog.group.all": "Tutti i gruppi",
  "catalog.results.singular": "risultato",
  "catalog.results.plural": "risultati",
  "catalog.reset": "Reset filtri",
  "catalog.empty": "Nessun codice trovato",
  "catalog.empty.group": "nel gruppo",
  "catalog.personalized": "Personalizzato",
  "catalog.savedOn": "Salvato il",
  "catalog.copy": "Copia",
  "catalog.copied": "Copiato",
  "catalog.remove": "Rimuovi",
  "catalog.confirm": "Conferma",
  "catalog.confirmHint": "Click di nuovo per confermare",

  // Generator
  "generator.title": "Composizione codice — 7 campi",
  "generator.preview.label": "Codice generato",
  "generator.preview.valid": "Valido",
  "generator.preview.incomplete": "Da completare",
  "generator.diagnostics": "Diagnostica per campo",
  "generator.formats": "Formati",
  "generator.copy": "Copia",
  "generator.copied": "Copiato",
  "generator.save": "Salva nel Catalogo",
  "generator.saved": "Salvato!",
  "generator.duplicate": "Già nel catalogo",
  "generator.official": "Già ufficiale",
  "generator.section.identification": "Identificazione contenuto",
  "generator.section.characteristics": "Caratteristiche elaborato",
  "generator.section.codiceElaborato": "Campo 7 — Codice Elaborato (composito)",
  "generator.fasiPreviste": "Fasi previste",
  "generator.descrizione.label": "Descrizione personalizzata (opzionale — sarà usata al salvataggio)",
  "generator.descrizione.placeholderFallback": "Es. Pianta del piano terra - Architettonica",
  "generator.dup.user": "Questo codice è già nel tuo catalogo personale.",
  "generator.dup.official": "Questo codice è già nel catalogo ufficiale MASE.",

  // Field labels
  "field.codiceBene": "Codice Bene",
  "field.codiceBene.hint": "fisso per il progetto MASE",
  "field.codiceAgenzia": "Codice Agenzia",
  "field.codiceAgenzia.hint": "fisso (Agenzia del Demanio)",
  "field.fixedForProject": "Campo fisso per il progetto MASE — non modificabile",
  "field.codiceDocumento": "Codice Documento",
  "field.codiceDocumento.hint": "9 char alfanumerici (Tabella documenti)",
  "field.codiceDocumento.placeholder": "— Seleziona un codice documento —",
  "field.livello": "Livello",
  "field.tipoFile": "Tipo File",
  "field.tipoFile.placeholder": "— Seleziona —",
  "field.disciplina": "Disciplina",
  "field.servizio": "Servizio/Stato",
  "field.servizio.hint": "1 lettera",
  "field.fase": "Fase",
  "field.fase.hint": "Cifra (default 0)",
  "field.bloccoFunz": "Blocco Funz.",
  "field.bloccoFunz.hint": "2 cifre",
  "field.progressivo": "Progressivo",
  "field.progressivo.hint": "2 cifre",

  // Validator (single)
  "validator.subtab.single": "Codice singolo",
  "validator.subtab.bulk": "Verifica massiva",
  "validator.input.title": "Incolla qui un codice da verificare",
  "validator.input.hint": "Lo strumento controllerà ciascun campo rispetto alla naming MASE",
  "validator.input.placeholder": "es. RMB1284-ADD-RELGENERA-XX-RT-Z-PD00001",
  "validator.examples": "Esempi rapidi:",
  "validator.result.valid": "Codice valido",
  "validator.result.invalid": "Codice non valido",
  "validator.result.warnings": "Codice con avvisi",
  "validator.summary.ok": "campi OK",
  "validator.summary.warnings": "avvisi",
  "validator.summary.errors": "errori",
  "validator.documento": "Documento:",
  "validator.fieldByField": "Verifica campo per campo",
  "validator.inCatalog": "Codice presente nel catalogo ufficiale MASE",
  "validator.group": "Gruppo:",
  "validator.notInCatalog": "Codice formalmente valido ma non presente nel catalogo ufficiale: verifica con la SA prima dell'uso.",

  // Bulk validator
  "bulk.title": "Verifica massiva — Carica codici da analizzare",
  "bulk.intro": "Importa una cartella di file (l'app legge i nomi), un file Excel o CSV con i codici. Tutto rimane locale — nessun file viene caricato su server.",
  "bulk.mode.folder": "Cartella",
  "bulk.mode.folder.sub": "Legge i nomi dei file",
  "bulk.mode.excel": "Excel",
  "bulk.mode.excel.sub": ".xlsx o .xls",
  "bulk.mode.csv": "CSV",
  "bulk.mode.csv.sub": "Testo separato",
  "bulk.folder.cta": "Click per selezionare una cartella",
  "bulk.folder.hint": "L'app leggerà i nomi dei file (senza estensione) e li validerà.",
  "bulk.privacy": "Nessun file viene caricato su server.",
  "bulk.file.cta": "Click per selezionare un file",
  "bulk.file.hint": "Dopo l'upload sceglierai foglio e colonna da analizzare.",
  "bulk.cancel": "Annulla",
  "bulk.sheet": "Foglio",
  "bulk.column": "Colonna con i codici",
  "bulk.preview": "Anteprima prime righe (colonna selezionata evidenziata):",
  "bulk.column.label": "Colonna",
  "bulk.analyze": "Analizza colonna selezionata",
  "bulk.processing": "Elaborazione in corso...",
  "bulk.summary.title": "Esito verifica",
  "bulk.summary.analyzed": "codici analizzati",
  "bulk.export": "Esporta CSV",
  "bulk.new": "Nuovo",
  "bulk.filter.search": "Filtra per codice o sorgente...",
  "bulk.filter.all": "Tutti gli esiti",
  "bulk.filter.ok": "Solo OK",
  "bulk.filter.warning": "Solo warning",
  "bulk.filter.error": "Solo errori",
  "bulk.table.esito": "Esito",
  "bulk.table.codice": "Codice",
  "bulk.table.sorgente": "Sorgente",
  "bulk.table.note": "Note / Errori",
  "bulk.table.noResults": "Nessun risultato corrisponde ai filtri.",
  "bulk.table.empty": "Nessun risultato.",
  "bulk.table.shown": "Mostrati",
  "bulk.table.of": "di",
  "bulk.table.results": "risultati",
  "bulk.inCatalog": "Catalogo:",
  "bulk.validButOutCatalog": "Valido ma fuori catalogo ufficiale",
  "bulk.row": "riga",

  // Reference
  "reference.title": "Riferimenti naming MASE",
  "reference.tab.documenti": "Codici Documento",
  "reference.tab.livelli": "Livelli (Tab. 13)",
  "reference.tab.tipi": "Tipi File (Tab. 14)",
  "reference.tab.discipline": "Discipline (Tab. 15)",
  "reference.tab.servizi": "Servizi/Stati (Tab. 16)",
  "reference.search": "Cerca in",
  "reference.col.codice": "Codice",
  "reference.col.descrizione": "Descrizione",
  "reference.col.tipo": "Tipo",
  "reference.col.formati": "Formati",
  "reference.col.fasi": "Fasi",
  "reference.empty": "Nessun risultato per",
  "reference.stati.title": "Stati (2° carattere)",
};

const EN: Record<string, string> = {
  // App shell
  "app.title": "MASE — Document Naming Tool",
  "app.subtitle": "New Ministry of Environment and Energy Security",
  "app.docref": "BIMMS Guidelines — Annex H",

  // Tabs
  "tab.catalogo": "Catalog",
  "tab.genera": "Generate",
  "tab.verifica": "Verify",
  "tab.riferimenti": "Reference",

  // Header controls
  "header.theme.light": "Light theme",
  "header.theme.dark": "Dark theme",
  "header.theme.toggle": "Toggle theme",
  "header.lang.it": "Italian",
  "header.lang.en": "English",
  "header.lang.toggle": "Change language",
  "header.specs.open": "Open Specification",
  "header.specs.title": "MASE Information Specification - CSP Methodology",
  "header.specs.short": "Specs",

  // Catalog
  "catalog.title": "MASE elaborates catalog",
  "catalog.backup": "Backup",
  "catalog.backup.title": "Export your codes as JSON",
  "catalog.search.placeholder": "Search: floor plan, demolition, PD00001...",
  "catalog.group.all": "All groups",
  "catalog.results.singular": "result",
  "catalog.results.plural": "results",
  "catalog.reset": "Reset filters",
  "catalog.empty": "No code found",
  "catalog.empty.group": "in group",
  "catalog.personalized": "Custom",
  "catalog.savedOn": "Saved on",
  "catalog.copy": "Copy",
  "catalog.copied": "Copied",
  "catalog.remove": "Remove",
  "catalog.confirm": "Confirm",
  "catalog.confirmHint": "Click again to confirm",

  // Generator
  "generator.title": "Code composition — 7 fields",
  "generator.preview.label": "Generated code",
  "generator.preview.valid": "Valid",
  "generator.preview.incomplete": "Incomplete",
  "generator.diagnostics": "Per-field diagnostics",
  "generator.formats": "Formats",
  "generator.copy": "Copy",
  "generator.copied": "Copied",
  "generator.save": "Save to Catalog",
  "generator.saved": "Saved!",
  "generator.duplicate": "Already in catalog",
  "generator.official": "Already official",
  "generator.section.identification": "Content identification",
  "generator.section.characteristics": "Document characteristics",
  "generator.section.codiceElaborato": "Field 7 — Composite Code",
  "generator.fasiPreviste": "Allowed phases",
  "generator.descrizione.label": "Custom description (optional — used when saving)",
  "generator.descrizione.placeholderFallback": "e.g. Ground floor plan - Architectural",
  "generator.dup.user": "This code is already in your personal catalog.",
  "generator.dup.official": "This code is already in the official MASE catalog.",

  // Field labels
  "field.codiceBene": "Asset Code",
  "field.codiceBene.hint": "locked for MASE project",
  "field.codiceAgenzia": "Agency Code",
  "field.codiceAgenzia.hint": "locked (Agenzia del Demanio)",
  "field.fixedForProject": "Field locked for the MASE project — not editable",
  "field.codiceDocumento": "Document Code",
  "field.codiceDocumento.hint": "9 alphanumeric chars (document table)",
  "field.codiceDocumento.placeholder": "— Select a document code —",
  "field.livello": "Level",
  "field.tipoFile": "File Type",
  "field.tipoFile.placeholder": "— Select —",
  "field.disciplina": "Discipline",
  "field.servizio": "Service/Status",
  "field.servizio.hint": "1 letter",
  "field.fase": "Phase",
  "field.fase.hint": "Digit (default 0)",
  "field.bloccoFunz": "Func. Block",
  "field.bloccoFunz.hint": "2 digits",
  "field.progressivo": "Progressive",
  "field.progressivo.hint": "2 digits",

  // Validator (single)
  "validator.subtab.single": "Single code",
  "validator.subtab.bulk": "Bulk verification",
  "validator.input.title": "Paste a code to verify",
  "validator.input.hint": "Each field will be checked against MASE naming rules",
  "validator.input.placeholder": "e.g. RMB1284-ADD-RELGENERA-XX-RT-Z-PD00001",
  "validator.examples": "Quick examples:",
  "validator.result.valid": "Valid code",
  "validator.result.invalid": "Invalid code",
  "validator.result.warnings": "Code with warnings",
  "validator.summary.ok": "OK fields",
  "validator.summary.warnings": "warnings",
  "validator.summary.errors": "errors",
  "validator.documento": "Document:",
  "validator.fieldByField": "Field-by-field check",
  "validator.inCatalog": "Code in the official MASE catalog",
  "validator.group": "Group:",
  "validator.notInCatalog": "Code is formally valid but not in the official catalog: verify with the SA before use.",

  // Bulk validator
  "bulk.title": "Bulk verification — Load codes to analyze",
  "bulk.intro": "Import a folder (the app reads file names), an Excel or CSV file with codes. Everything stays local — no file is uploaded to a server.",
  "bulk.mode.folder": "Folder",
  "bulk.mode.folder.sub": "Reads file names",
  "bulk.mode.excel": "Excel",
  "bulk.mode.excel.sub": ".xlsx or .xls",
  "bulk.mode.csv": "CSV",
  "bulk.mode.csv.sub": "Separated text",
  "bulk.folder.cta": "Click to select a folder",
  "bulk.folder.hint": "The app will read file names (without extension) and validate them.",
  "bulk.privacy": "No file is uploaded to a server.",
  "bulk.file.cta": "Click to select a file",
  "bulk.file.hint": "After upload you'll choose the sheet and column to analyze.",
  "bulk.cancel": "Cancel",
  "bulk.sheet": "Sheet",
  "bulk.column": "Column with codes",
  "bulk.preview": "Preview of first rows (selected column highlighted):",
  "bulk.column.label": "Column",
  "bulk.analyze": "Analyze selected column",
  "bulk.processing": "Processing...",
  "bulk.summary.title": "Verification result",
  "bulk.summary.analyzed": "codes analyzed",
  "bulk.export": "Export CSV",
  "bulk.new": "New",
  "bulk.filter.search": "Filter by code or source...",
  "bulk.filter.all": "All results",
  "bulk.filter.ok": "OK only",
  "bulk.filter.warning": "Warnings only",
  "bulk.filter.error": "Errors only",
  "bulk.table.esito": "Result",
  "bulk.table.codice": "Code",
  "bulk.table.sorgente": "Source",
  "bulk.table.note": "Notes / Errors",
  "bulk.table.noResults": "No results match the filters.",
  "bulk.table.empty": "No results.",
  "bulk.table.shown": "Showing",
  "bulk.table.of": "of",
  "bulk.table.results": "results",
  "bulk.inCatalog": "Catalog:",
  "bulk.validButOutCatalog": "Valid but outside the official catalog",
  "bulk.row": "row",

  // Reference
  "reference.title": "MASE naming reference",
  "reference.tab.documenti": "Document Codes",
  "reference.tab.livelli": "Levels (Tab. 13)",
  "reference.tab.tipi": "File Types (Tab. 14)",
  "reference.tab.discipline": "Disciplines (Tab. 15)",
  "reference.tab.servizi": "Services/States (Tab. 16)",
  "reference.search": "Search in",
  "reference.col.codice": "Code",
  "reference.col.descrizione": "Description",
  "reference.col.tipo": "Type",
  "reference.col.formati": "Formats",
  "reference.col.fasi": "Phases",
  "reference.empty": "No results for",
  "reference.stati.title": "States (2nd character)",
};

const DICTIONARIES: Record<Locale, Record<string, string>> = { it: IT, en: EN };

/** Traduce una chiave nella lingua data, con fallback su italiano se manca. */
export function translate(key: string, locale: Locale): string {
  return DICTIONARIES[locale][key] ?? DICTIONARIES.it[key] ?? key;
}

export function getStoredLocale(): Locale {
  if (typeof window === "undefined") return "it";
  const saved = window.localStorage.getItem(STORAGE_KEY);
  return saved === "en" ? "en" : "it";
}

export function setLocale(locale: Locale): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, locale);
  document.documentElement.setAttribute("lang", locale);
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: locale }));
}

export function applyStoredLocale(): void {
  if (typeof window === "undefined") return;
  const locale = getStoredLocale();
  document.documentElement.setAttribute("lang", locale);
}

export function subscribeLocale(callback: (locale: Locale) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (e: Event) => callback((e as CustomEvent<Locale>).detail);
  const storageHandler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY && (e.newValue === "it" || e.newValue === "en")) {
      callback(e.newValue);
      document.documentElement.setAttribute("lang", e.newValue);
    }
  };
  window.addEventListener(CHANGE_EVENT, handler);
  window.addEventListener("storage", storageHandler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener("storage", storageHandler);
  };
}
