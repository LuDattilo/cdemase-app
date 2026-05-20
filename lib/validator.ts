import {
  CODICE_BENE_REGEX,
  CODICE_AGENZIA_REGEX,
  CODICE_AREA_REGEX,
  CODICE_FABBRICATO_REGEX,
  CODICE_DOCUMENTO_REGEX,
  LIVELLO_REGEX,
  TIPO_FILE_REGEX,
  DISCIPLINA_REGEX,
  CODICE_ELABORATO_REGEX,
  CODICI_DOCUMENTO,
  LIVELLI,
  TIPI_FILE,
  DISCIPLINE,
  SERVIZI,
  STATI_FASI,
  SEPARATORE,
  CODICE_BENE_DEFAULT,
  CODICE_AGENZIA_DEFAULT,
  findInCatalogo,
} from "./codifica-data";

export type FieldStatus = "ok" | "warning" | "error" | "empty";

export type FieldResult = {
  campo: number;
  nome: string;
  valore: string;
  status: FieldStatus;
  messaggio: string;
  suggerimento?: string;
};

export type ValidationResult = {
  valid: boolean;
  campi: FieldResult[];
  codiceNormalizzato: string;
  descrizione?: string;
  /** True se il codice esatto è presente nel catalogo ufficiale */
  inCatalogo?: boolean;
  /** Descrizione ufficiale dal catalogo, se presente */
  descrizioneCatalogo?: string;
  /** Gruppo del catalogo (es. "Demolizioni", "Sicurezza") */
  gruppoCatalogo?: string;
};

export type CodificaInput = {
  codiceBene: string;
  codiceAgenzia: string;
  codiceDocumento: string;
  livello: string;
  tipoFile: string;
  disciplina: string;
  servizio: string;
  /** Secondo carattere del Campo 7: stato oppure fase 0. */
  statoFase: string;
  bloccoFunzionale: string;
  progressivo: string;
};

/**
 * Componi una stringa nominale a partire dai singoli campi.
 * Il Campo 7 è sempre 6 char: Servizio + Stato/Fase + BF + Progressivo.
 */
export function componiCodice(input: CodificaInput): string {
  const campo7 =
    input.servizio +
    input.statoFase +
    input.bloccoFunzionale +
    input.progressivo;
  return [
    input.codiceBene,
    input.codiceAgenzia,
    input.codiceDocumento,
    input.livello,
    input.tipoFile,
    input.disciplina,
    campo7,
  ].join(SEPARATORE);
}

/**
 * Valida i singoli campi del 3° tipo (Codice Documento, Area o Fabbricato).
 */
function validateCampo3(value: string): FieldResult {
  const v = value.trim().toUpperCase();
  if (!v) {
    return {
      campo: 3,
      nome: "Codice Area/Fabbricato/Documento",
      valore: v,
      status: "empty",
      messaggio: "Campo vuoto.",
    };
  }
  if (CODICE_DOCUMENTO_REGEX.test(v)) {
    const found = CODICI_DOCUMENTO.find((d) => d.code === v);
    if (found) {
      return {
        campo: 3,
        nome: "Codice Documento",
        valore: v,
        status: "ok",
        messaggio: `${found.description}`,
      };
    }
    return {
      campo: 3,
      nome: "Codice Documento",
      valore: v,
      status: "warning",
      messaggio:
        "Codice 9 caratteri valido come formato, ma non presente nella tabella ufficiale.",
      suggerimento:
        "Verifica con la Stazione Appaltante se il codice è stato approvato.",
    };
  }
  if (CODICE_AREA_REGEX.test(v)) {
    return {
      campo: 3,
      nome: "Codice Area",
      valore: v,
      status: "ok",
      messaggio: "Codice Area (CANNNN — 2 lettere + 4 cifre).",
    };
  }
  if (CODICE_FABBRICATO_REGEX.test(v)) {
    return {
      campo: 3,
      nome: "Codice Fabbricato",
      valore: v,
      status: "ok",
      messaggio: "Codice Fabbricato (CFNNNNNNN — 2 lettere + 7 cifre).",
    };
  }
  return {
    campo: 3,
    nome: "Codice Area/Fabbricato/Documento",
    valore: v,
    status: "error",
    messaggio:
      "Formato non valido. Atteso: 6 char (Area), 9 char (Fabbricato) o 9 char alfanumerici (Documento).",
  };
}

function validateCampo1(v: string): FieldResult {
  const value = v.trim().toUpperCase();
  if (!value) {
    return {
      campo: 1,
      nome: "Codice Bene",
      valore: value,
      status: "empty",
      messaggio: "Campo vuoto.",
    };
  }
  if (!CODICE_BENE_REGEX.test(value)) {
    return {
      campo: 1,
      nome: "Codice Bene",
      valore: value,
      status: "error",
      messaggio: "Formato non valido. Atteso: 3 lettere + 4 cifre (es. RMB1284).",
      suggerimento: `Per il progetto MASE: ${CODICE_BENE_DEFAULT}`,
    };
  }
  if (value !== CODICE_BENE_DEFAULT) {
    return {
      campo: 1,
      nome: "Codice Bene",
      valore: value,
      status: "warning",
      messaggio: `Formato corretto, ma diverso dal default MASE (${CODICE_BENE_DEFAULT}).`,
    };
  }
  return {
    campo: 1,
    nome: "Codice Bene",
    valore: value,
    status: "ok",
    messaggio: "Codice Bene MASE riconosciuto (RMB = provincia Roma).",
  };
}

function validateCampo2(v: string): FieldResult {
  const value = v.trim().toUpperCase();
  if (!value) {
    return {
      campo: 2,
      nome: "Codice Agenzia",
      valore: value,
      status: "empty",
      messaggio: "Campo vuoto.",
    };
  }
  if (!CODICE_AGENZIA_REGEX.test(value)) {
    return {
      campo: 2,
      nome: "Codice Agenzia",
      valore: value,
      status: "error",
      messaggio: "Formato non valido. Atteso: 3 lettere (es. ADD).",
      suggerimento: `Per il progetto MASE: ${CODICE_AGENZIA_DEFAULT}`,
    };
  }
  if (value === "ADM") {
    return {
      campo: 2,
      nome: "Codice Agenzia",
      valore: value,
      status: "warning",
      messaggio: "Codice Agenzia legacy (ADM): elaborato di un servizio precedente del Demanio (es. Vulnerabilità Sismica).",
      suggerimento: `Per nuovi elaborati del servizio CSP MASE usa: ${CODICE_AGENZIA_DEFAULT}`,
    };
  }
  if (value !== CODICE_AGENZIA_DEFAULT) {
    return {
      campo: 2,
      nome: "Codice Agenzia",
      valore: value,
      status: "warning",
      messaggio: `Formato corretto, ma diverso dal default MASE (${CODICE_AGENZIA_DEFAULT}).`,
    };
  }
  return {
    campo: 2,
    nome: "Codice Agenzia",
    valore: value,
    status: "ok",
    messaggio: "Codice Agenzia ADD riconosciuto.",
  };
}

function validateCampo4(v: string): FieldResult {
  const value = v.trim().toUpperCase();
  if (!value) {
    return {
      campo: 4,
      nome: "Livello",
      valore: value,
      status: "empty",
      messaggio: "Campo vuoto.",
    };
  }
  if (!LIVELLO_REGEX.test(value)) {
    return {
      campo: 4,
      nome: "Livello",
      valore: value,
      status: "error",
      messaggio: "Formato non valido. Atteso: 2 caratteri alfanumerici.",
    };
  }
  const found = LIVELLI.find((l) => l.code === value);
  if (!found) {
    return {
      campo: 4,
      nome: "Livello",
      valore: value,
      status: "warning",
      messaggio: "Codice livello non presente nella tabella ufficiale (Tab. 13).",
    };
  }
  return {
    campo: 4,
    nome: "Livello",
    valore: value,
    status: "ok",
    messaggio: found.description,
  };
}

function validateCampo5(v: string): FieldResult {
  const value = v.trim().toUpperCase();
  if (!value) {
    return {
      campo: 5,
      nome: "Tipo File",
      valore: value,
      status: "empty",
      messaggio: "Campo vuoto.",
    };
  }
  if (!TIPO_FILE_REGEX.test(value)) {
    return {
      campo: 5,
      nome: "Tipo File",
      valore: value,
      status: "error",
      messaggio: "Formato non valido. Atteso: 2 caratteri.",
    };
  }
  const found = TIPI_FILE.find((t) => t.code === value);
  if (!found) {
    return {
      campo: 5,
      nome: "Tipo File",
      valore: value,
      status: "warning",
      messaggio: "Codice tipo file non presente nella tabella ufficiale (Tab. 14).",
    };
  }
  return {
    campo: 5,
    nome: "Tipo File",
    valore: value,
    status: "ok",
    messaggio: found.description,
  };
}

function validateCampo6(v: string): FieldResult {
  const value = v.trim().toUpperCase();
  if (!value) {
    return {
      campo: 6,
      nome: "Disciplina",
      valore: value,
      status: "empty",
      messaggio: "Campo vuoto.",
    };
  }
  if (!DISCIPLINA_REGEX.test(value)) {
    return {
      campo: 6,
      nome: "Disciplina",
      valore: value,
      status: "error",
      messaggio: "Formato non valido. Atteso: 1 lettera maiuscola.",
    };
  }
  const found = DISCIPLINE.find((d) => d.code === value);
  if (!found) {
    return {
      campo: 6,
      nome: "Disciplina",
      valore: value,
      status: "warning",
      messaggio: "Codice disciplina non presente nella tabella ufficiale (Tab. 15).",
    };
  }
  return {
    campo: 6,
    nome: "Disciplina",
    valore: value,
    status: "ok",
    messaggio: found.description,
  };
}

function validateCampo7(v: string): FieldResult {
  const value = v.trim().toUpperCase();
  if (!value) {
    return {
      campo: 7,
      nome: "Codice Elaborato",
      valore: value,
      status: "empty",
      messaggio: "Campo vuoto.",
    };
  }
  if (!CODICE_ELABORATO_REGEX.test(value)) {
    return {
      campo: 7,
      nome: "Codice Elaborato",
      valore: value,
      status: "error",
      messaggio:
        "Formato non valido. Atteso sempre 6 char (es. C00001, PD0001, PS0001).",
      suggerimento:
        "Schema: <Servizio><Stato/Fase><BloccoFunzionale 2c><Progressivo 2c>",
    };
  }

  const servizio = value.charAt(0);
  const statoFase = value.charAt(1);
  const bloccoFunz = value.substring(2, 4);
  const progressivo = value.substring(4, 6);

  const servEntry = SERVIZI.find((s) => s.code === servizio);
  if (!servEntry) {
    return {
      campo: 7,
      nome: "Codice Elaborato",
      valore: value,
      status: "warning",
      messaggio: `Codice servizio "${servizio}" non riconosciuto (Tab. 16).`,
    };
  }

  const statoFaseEntry = STATI_FASI.find((s) => s.code === statoFase);
  if (!statoFaseEntry) {
    return {
      campo: 7,
      nome: "Codice Elaborato",
      valore: value,
      status: "warning",
      messaggio: `Servizio "${servEntry.description}" + Stato/Fase "${statoFase}" non riconosciuto (Tab. 16).`,
    };
  }
  if (progressivo === "00") {
    return {
      campo: 7,
      nome: "Codice Elaborato",
      valore: value,
      status: "warning",
      messaggio: `${servEntry.description} + ${statoFaseEntry.description}. Progressivo 00 non valido — deve partire da 01.`,
    };
  }
  return {
    campo: 7,
    nome: "Codice Elaborato",
    valore: value,
    status: "ok",
    messaggio: `${servEntry.description} + ${statoFaseEntry.description} | Blocco Funz: ${bloccoFunz} | Progressivo: ${progressivo}`,
  };
}

/**
 * Valida una stringa codice completa.
 * Restituisce stato di ciascun campo + esito globale.
 *
 * Normalizza l'input rimuovendo TUTTI gli spazi (anche embedded) — un codice MASE
 * non può contenere spazi all'interno dei campi.
 */
export function validaCodiceCompleto(input: string): ValidationResult {
  const cleaned = input.trim().toUpperCase().replace(/\s+/g, "");
  const parts = cleaned.split(SEPARATORE);

  const placeholders: FieldResult[] = [
    { campo: 1, nome: "Codice Bene", valore: parts[0] ?? "", status: "empty", messaggio: "Campo mancante" },
    { campo: 2, nome: "Codice Agenzia", valore: parts[1] ?? "", status: "empty", messaggio: "Campo mancante" },
    { campo: 3, nome: "Codice Documento/Area/Fabbricato", valore: parts[2] ?? "", status: "empty", messaggio: "Campo mancante" },
    { campo: 4, nome: "Livello", valore: parts[3] ?? "", status: "empty", messaggio: "Campo mancante" },
    { campo: 5, nome: "Tipo File", valore: parts[4] ?? "", status: "empty", messaggio: "Campo mancante" },
    { campo: 6, nome: "Disciplina", valore: parts[5] ?? "", status: "empty", messaggio: "Campo mancante" },
    { campo: 7, nome: "Codice Elaborato", valore: parts[6] ?? "", status: "empty", messaggio: "Campo mancante" },
  ];

  if (parts.length !== 7) {
    return {
      valid: false,
      campi: placeholders.map((p, i) =>
        i < parts.length
          ? { ...p, status: "error" as FieldStatus, messaggio: `Numero campi errato: trovati ${parts.length}, attesi 7.` }
          : p
      ),
      codiceNormalizzato: cleaned,
    };
  }

  const results: FieldResult[] = [
    validateCampo1(parts[0]),
    validateCampo2(parts[1]),
    validateCampo3(parts[2]),
    validateCampo4(parts[3]),
    validateCampo5(parts[4]),
    validateCampo6(parts[5]),
    validateCampo7(parts[6]),
  ];

  const allOkOrWarn = results.every((r) => r.status === "ok" || r.status === "warning");
  const hasErrors = results.some((r) => r.status === "error" || r.status === "empty");

  // Cross-check 1: il tipo file di Campo 5 deve essere coerente col Codice Documento (Campo 3) se è un documento noto.
  // ECCEZIONE: se il codice completo è nel catalogo ufficiale, il catalogo vince sul cross-check
  // (alcuni codici ufficiali hanno divergenze rispetto alla Tab. 8 — es. ELENCELAB con AM invece di RP).
  const docEntry = CODICI_DOCUMENTO.find((d) => d.code === parts[2].toUpperCase());
  const catalogoCheck = findInCatalogo(cleaned);
  if (docEntry && docEntry.meta?.tipo && results[4].status === "ok" && !catalogoCheck) {
    const tipoAtteso = docEntry.meta.tipo;
    // Per MGENERALE il tipo può essere "M3 / MR", quindi confronto come stringa contenuta
    const tipiAmmessi = tipoAtteso.split("/").map((s) => s.trim());
    if (!tipiAmmessi.includes(results[4].valore)) {
      results[4] = {
        ...results[4],
        status: "warning",
        messaggio: `${results[4].messaggio} — Atteso "${tipoAtteso}" per "${docEntry.code}".`,
        suggerimento: `Codice tipo standard per ${docEntry.code}: ${tipoAtteso}`,
      };
    }
  }

  // Cross-check 2: i Capitolati Informativi SPECIF* hanno il servizio del Campo 7 vincolato.
  // SPECIFCSP → servizio C, SPECIFRIL → S, SPECIFPRO → P
  const codDoc = parts[2].toUpperCase();
  const specifMap: Record<string, string> = {
    SPECIFCSP: "C",
    SPECIFRIL: "S",
    SPECIFPRO: "P",
  };
  if (codDoc in specifMap && results[6].status === "ok") {
    const servizioAtteso = specifMap[codDoc];
    const servizioTrovato = results[6].valore.charAt(0);
    if (servizioTrovato !== servizioAtteso) {
      results[6] = {
        ...results[6],
        status: "warning",
        messaggio: `${results[6].messaggio} — Per "${codDoc}" il servizio del Campo 7 deve iniziare con "${servizioAtteso}" (trovato "${servizioTrovato}").`,
        suggerimento: `Es. corretto: ${codDoc.startsWith("SPECIFC") ? "C00001" : codDoc.startsWith("SPECIFR") ? "S00001" : "P00001"}`,
      };
    }
  }

  // Cross-lookup nel catalogo ufficiale degli elaborati
  const catalogoEntry = findInCatalogo(cleaned);

  return {
    valid: !hasErrors && allOkOrWarn,
    campi: results,
    codiceNormalizzato: cleaned,
    descrizione: docEntry?.description,
    inCatalogo: Boolean(catalogoEntry),
    descrizioneCatalogo: catalogoEntry?.descrizione,
    gruppoCatalogo: catalogoEntry?.gruppo,
  };
}

/**
 * Valida un input strutturato (dal Generator)
 */
export function validaInputStrutturato(input: CodificaInput): ValidationResult {
  const codice = componiCodice(input);
  return validaCodiceCompleto(codice);
}
