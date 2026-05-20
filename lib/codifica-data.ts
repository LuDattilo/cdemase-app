/**
 * MASE — Naming Convention Data
 *
 * GERARCHIA DELLE FONTI (in ordine di autorità):
 * 1. BIMMS - Method Statement (Linee Guida di Produzione Informativa) — Allegato H,
 *    Tabelle 13–16. Documento normativo dell'Agenzia del Demanio.
 * 2. Capitolato Informativo del Servizio (PDF):
 *    - RMB1284-ADD-SPECIFCSP-XX-SM-Z-C00001.pdf — Sicurezza Progettazione (Tab. 8 = 20 codici CSP)
 *    - RMB1284-ADD-SPECIFRIL-XX-SM-Z-S00001 — Specifica Metodologica Rilievi
 *    - RMB1284-ADD-SPECIFPRO-XX-SM-Z-P00001 — Specifica Metodologica PFTE
 * 3. MASE_CodificaElaborati_R1.xlsx — Foglio "Codifica Elaborati" (catalogo operativo,
 *    deriva dalle fonti 1 e 2).
 *
 * In caso di conflitto: PDF (fonte 1/2) vince sull'Excel (fonte 3).
 *
 * NOTA: gli elaborati con Codice Agenzia "ADM" (vs "ADD") provengono da servizi
 * precedenti del Demanio (es. Vulnerabilità Sismica) e usano formati di codifica
 * legacy non più validi per il servizio CSP MASE corrente.
 */

export type LookupEntry = {
  code: string;
  description: string;
  meta?: Record<string, string>;
};

/* ============================================================
 * CAMPO 1 — CODICE BENE (3 lettere + 4 numeri)
 * Le prime 2 lettere indicano la provincia.
 * Default progetto MASE: RMB1284
 * ============================================================ */
export const CODICE_BENE_DEFAULT = "RMB1284";
export const CODICE_BENE_REGEX = /^[A-Z]{3}\d{4}$/;

/* ============================================================
 * CAMPO 2 — CODICE FISSO AGENZIA (3 lettere)
 * Default progetto MASE: ADD
 * ============================================================ */
export const CODICE_AGENZIA_DEFAULT = "ADD";
export const CODICE_AGENZIA_REGEX = /^[A-Z]{3}$/;

/* ============================================================
 * CAMPO 3 — CODICE AREA / FABBRICATO / DOCUMENTO
 * Può essere:
 *   - CANNNN  (Codice Area: 2 lettere + 4 numeri)
 *   - CFNNNNNNN (Codice Fabbricato: 2 lettere + 7 numeri, es. RM0411001)
 *   - 9 caratteri alfanumerici (Codice Documento, es. PLANGENER)
 * ============================================================ */
export const CODICE_AREA_REGEX = /^[A-Z]{2}\d{4}$/;
export const CODICE_FABBRICATO_REGEX = /^[A-Z]{2}\d{7}$/;
export const CODICE_DOCUMENTO_REGEX = /^[A-Z0-9]{9}$/;

/**
 * CODICI DOCUMENTO ufficiali (Campo 3)
 *
 * Lista esaustiva derivata da:
 *   - MASE_CodificaElaborati_R1.xlsx (catalogo applicativo, foglio "Codifica Elaborati")
 *   - RMB1284-ADD-SPECIFCSP-XX-SM-Z-C00001.pdf — Capitolato Informativo CSP, Tabella 8
 *   - Riferimenti puntuali nel testo del Capitolato (es. SPECIFRIL, SPECIFPRO, MGENERALE)
 *
 * Nota: per i Codici Documento generali (non CSP-specifici), la fonte primaria
 * è la BIMMS - Method Statement (paragrafo 4.1.2.2), che questo Capitolato cita.
 */
export const CODICI_DOCUMENTO: LookupEntry[] = [
  { code: "ABACOELEM", description: "Abachi elementi architettonici ricorrenti", meta: { tipo: "DR", formati: ".dxf ; .pdf; formato nativo", fasi: "INDA / PFTE / PE / DL" } },
  { code: "ATTPREENE", description: "Attestato di prestazione energetica (APE)", meta: { tipo: "CR", formati: ".docx ; .pdf", fasi: "INDA / COLLAUDO" } },
  { code: "CALSOMSPE", description: "Calcolo sommario della spesa", meta: { tipo: "CP", formati: ".docx ; .pdf", fasi: "PFTE" } },
  { code: "CAPSPEAPP", description: "Capitolato speciale descrittivo e prestazionale", meta: { tipo: "AM", formati: ".docx ; .pdf", fasi: "PFTE / PE" } },
  { code: "CONTRATTO", description: "Schema di contratto", meta: { tipo: "AM", formati: ".docx ; .pdf", fasi: "PFTE / EPE" } },
  { code: "CRONOPROG", description: "Cronoprogramma", meta: { tipo: "PR", formati: ".docx ; .pdf", fasi: "PFTE / PE / DL / CSP / CSE" } },
  { code: "ELENCELAB", description: "Elenco elaborati", meta: { tipo: "RP", formati: ".docx ; .pdf", fasi: "INDA / PFTE / PE / DL / CSP / CSE" } },
  { code: "ELEVAZION", description: "Prospetti e sezioni (elaborati 2D estrapolati dal Modello BIM)", meta: { tipo: "DR", formati: ".dxf ; .pdf; formato nativo", fasi: "PFTE / PE / DL / CSP" } },
  { code: "GEOLOGICA", description: "Relazione geologica e sismica", meta: { tipo: "RT", formati: ".docx ; .pdf", fasi: "INDA / RAPPRESE / PFTE" } },
  { code: "METODORIL", description: "Relazione tecnico-illustrativa sulle metodologie del rilievo", meta: { tipo: "RT", formati: ".docx ; .pdf", fasi: "INDA" } },
  { code: "MGENERALE", description: "Codice speciale (Campo 3) per Modelli pluridisciplinari riferibili a porzioni di territorio esterne al perimetro del Bene o Nuvole di punti riferibili all'intero Bene (BIMMS 4.1.1.2)", meta: { tipo: "M3 / MR", formati: "formato nativo + IFC", fasi: "TUTTO" } },
  { code: "MODSTRUTT", description: "Relazione sulla modellazione strutturale", meta: { tipo: "RT", formati: ".docx ; .pdf", fasi: "INDA / PFTE / PE / DL" } },
  { code: "OFFGESINF", description: "Offerta di Gestione Informativa (oGI) — Documento redatto dall'Offerente in fase di gara, risponde alle richieste del Capitolato Informativo", meta: { tipo: "RT", formati: ".docx ; .pdf", fasi: "TUTTO" } },
  { code: "PARTCOSTR", description: "Particolari costruttivi", meta: { tipo: "DR", formati: ".dxf ; .pdf; formato nativo", fasi: "PFTE / PE / DL / ESE" } },
  { code: "PIAECOMAX", description: "Piano economico e finanziario di massima", meta: { tipo: "CP", formati: ".docx ; .pdf", fasi: "PFTE" } },
  { code: "PIAGEOSTR", description: "Piano geotecnico strutturale", meta: { tipo: "RT", formati: ".docx ; .pdf", fasi: "PFTE" } },
  { code: "PIAGESINF", description: "Piano di Gestione Informativa (pGI) — Documento contrattuale redatto dall'Operatore Economico Aggiudicatario, sviluppa ulteriormente le richieste del Capitolato Informativo", meta: { tipo: "RT", formati: ".docx ; .pdf", fasi: "TUTTO" } },
  { code: "PIAINDSTR", description: "Piano di indagini strutturali", meta: { tipo: "RT", formati: ".docx ; .pdf", fasi: "INDA" } },
  { code: "PIALAVORO", description: "Piano di Lavoro", meta: { tipo: "RT", formati: ".docx ; .pdf", fasi: "DL / ESE" } },
  { code: "PIAMANOPE", description: "Piano di manutenzione dell'opera — Piano preliminare e piano di manutenzione (può essere supportato da modelli informativi)", meta: { tipo: "RT", formati: ".docx ; .pdf", fasi: "PFTE / PE / DL" } },
  { code: "PIAPARESP", description: "Piano particellare di esproprio", meta: { tipo: "AM", formati: ".docx ; .pdf", fasi: "PFTE" } },
  { code: "PIASICCOO", description: "Piano di Sicurezza e Coordinamento (PSC) — Finalizzato alla tutela della salute e sicurezza dei lavoratori nei cantieri (D.Lgs. 81/2008). Include stima costi sicurezza. Può essere supportato da modelli informativi", meta: { tipo: "HS", formati: ".docx ; .pdf", fasi: "PFTE / CSP / CSE" } },
  { code: "PLANAMBIE", description: "Planimetria indagini ambientali", meta: { tipo: "DR", formati: ".dxf ; .pdf", fasi: "INDA" } },
  { code: "PLANARCHE", description: "Planimetria archeologica", meta: { tipo: "DR", formati: ".docx ; .pdf", fasi: "RAPPRESE / PFTE / PE" } },
  { code: "PLANCARPE", description: "Piante delle carpenterie", meta: { tipo: "DR", formati: ".dxf ; .pdf; formato nativo", fasi: "PFTE / PE / DL" } },
  { code: "PLANCONTE", description: "Planimetria contesto — Planimetria in scala non inferiore a 1:200, in relazione alla dimensione dell'intervento, corredata da due o più sezioni atte ad illustrare tutti i profili significativi (Tab. 8 CSP)", meta: { tipo: "DR", formati: ".dxf ; .pdf; formato nativo", fasi: "PFTE / CSP" } },
  { code: "PLANCURVE", description: "Planimetria generale con curve di livello", meta: { tipo: "DR", formati: ".pdf", fasi: "INDA" } },
  { code: "PLANGENER", description: "Planimetria generale", meta: { tipo: "DR", formati: ".dxf ; .pdf; formato nativo", fasi: "INDA / PFTE / PE / DL / CSP" } },
  { code: "PLANGEOLO", description: "Planimetria indagini geologiche", meta: { tipo: "DR", formati: ".dxf ; .pdf", fasi: "INDA" } },
  { code: "PLANGEOTE", description: "Planimetria indagini geotecniche", meta: { tipo: "DR", formati: ".dxf ; .pdf", fasi: "INDA" } },
  { code: "PLANIMPIA", description: "Piante degli impianti", meta: { tipo: "DR", formati: ".dxf ; .pdf; formato nativo", fasi: "INDA / PFTE / PE / DL" } },
  { code: "PROFILIST", description: "Profili Stradali a doppia scala (1/100 - 1/1000) o adeguata (Tab. 8 CSP)", meta: { tipo: "DR", formati: ".dxf ; .pdf; formato nativo", fasi: "PFTE / CSP" } },
  { code: "PLANINSIE", description: "Planimetria d'insieme — in scala non inferiore a 1:500, con curve di livello (equidistanza ≤ 50 cm), strade, sagome edifici confinanti, alberature esistenti", meta: { tipo: "DR", formati: ".dxf ; .pdf; formato nativo", fasi: "RAPPRESE / PFTE / CSP" } },
  { code: "PLANLIVEL", description: "Piante di tutti i piani — Elaborati 2D estrapolati dal Modello BIM con dettagli architettonici, impiantistici, tecnologici, quote", meta: { tipo: "DR", formati: ".dxf ; .pdf; formato nativo", fasi: "INDA / PFTE / PE / DL" } },
  { code: "PLANSCAVA", description: "Planimetria dei siti di cava e deposito (Tab. 8 CSP)", meta: { tipo: "DR", formati: ".dxf ; .pdf", fasi: "PFTE / CSP" } },
  { code: "PLANSOTSV", description: "Planimetria indagini sottoservizi", meta: { tipo: "DR", formati: ".dxf ; .pdf", fasi: "INDA" } },
  { code: "PLANSTRUT", description: "Planimetria indagini strutturali", meta: { tipo: "DR", formati: ".dxf ; .pdf", fasi: "INDA" } },
  { code: "PLANTOPOG", description: "Planimetria punti stazione topografica", meta: { tipo: "DR", formati: ".dxf ; .pdf; formato nativo", fasi: "INDA" } },
  { code: "PLANURBAN", description: "Stralcio dello strumento urbanistico generale o attuativo", meta: { tipo: "DR", formati: ".dxf ; .pdf", fasi: "INDA" } },
  { code: "PLANVOLUM", description: "Planivolumetrico d'insieme", meta: { tipo: "DR", formati: ".dxf ; .pdf; formato nativo", fasi: "PFTE / DL" } },
  { code: "PLAPROSEZ", description: "Piante, prospetti e sezioni", meta: { tipo: "DR", formati: ".dxf ; .pdf; formato nativo", fasi: "INDA / PFTE / PE / DL" } },
  { code: "PROSPETTI", description: "Prospetti", meta: { tipo: "DR", formati: ".dxf ; .pdf; formato nativo", fasi: "INDA / PFTE / PE / DL" } },
  { code: "QUADROECO", description: "Quadro economico di progetto", meta: { tipo: "CP", formati: ".docx ; .pdf", fasi: "RAPPRESE / PFTE" } },
  { code: "RAPDPROVA", description: "Rapporti di prova", meta: { tipo: "RP", formati: ".docx ; .pdf", fasi: "INDA / PE / DL" } },
  { code: "RELACUSTI", description: "Relazione di impatto acustico", meta: { tipo: "RT", formati: ".docx ; .pdf", fasi: "INDA / PFTE / DL" } },
  { code: "RELANTINC", description: "Relazione antincendio", meta: { tipo: "RT", formati: ".docx ; .pdf", fasi: "PFTE / PE / DL" } },
  { code: "RELAPPCAM", description: "Relazione applicazione CAM", meta: { tipo: "RT", formati: ".docx ; .pdf", fasi: "PFTE / PE" } },
  { code: "RELARCHEO", description: "Relazione archeologica", meta: { tipo: "RT", formati: ".docx ; .pdf", fasi: "INDA / PFTE / PE / DL" } },
  { code: "RELBARARC", description: "Relazione barriere architettoniche", meta: { tipo: "RT", formati: ".docx ; .pdf", fasi: "PFTE / PE / DL" } },
  { code: "RELCANTIE", description: "Relazione tecnica organizzazione del cantiere (Tab. 8 CSP)", meta: { tipo: "RT", formati: ".docx ; .pdf", fasi: "PFTE / CSP / CSE" } },
  { code: "RELENERGE", description: "Relazione diagnosi energetica", meta: { tipo: "RT", formati: ".docx ; .pdf", fasi: "INDA / PFTE / PE / AS" } },
  { code: "RELGENERA", description: "Relazione generale", meta: { tipo: "RT", formati: ".docx ; .pdf", fasi: "PFTE" } },
  { code: "RELGEOTEC", description: "Relazione geotecnica", meta: { tipo: "RT", formati: ".docx ; .pdf", fasi: "INDA / RAPPRESE / PFTE" } },
  { code: "RELGESMAT", description: "Relazione sulla gestione delle materie", meta: { tipo: "RT", formati: ".docx ; .pdf", fasi: "PE" } },
  { code: "RELIDRAUL", description: "Relazione idraulica", meta: { tipo: "RT", formati: ".docx ; .pdf", fasi: "INDA / RAPPRESE / PFTE" } },
  { code: "RELIDROGE", description: "Relazione idrogeologica", meta: { tipo: "RT", formati: ".docx ; .pdf", fasi: "INDA / RAPPRESE / PFTE" } },
  { code: "RELILLUST", description: "Relazione illustrativa", meta: { tipo: "RT", formati: ".docx ; .pdf", fasi: "RAPPRESE / PFTE" } },
  { code: "RELINDAGI", description: "Relazione indagini", meta: { tipo: "RT", formati: ".docx ; .pdf", fasi: "INDA" } },
  { code: "RELINDGEO", description: "Relazione sulle indagini geognostiche realizzate", meta: { tipo: "RT", formati: ".docx ; .pdf", fasi: "INDA / RAPPRESE / PFTE" } },
  { code: "RELINDSTR", description: "Relazione sulle indagini strutturali realizzate", meta: { tipo: "RT", formati: ".docx ; .pdf", fasi: "INDA / RAPPRESE / PFTE" } },
  { code: "RELINTERF", description: "Relazione sulle interferenze", meta: { tipo: "RT", formati: ".docx ; .pdf", fasi: "PFTE / PE" } },
  { code: "RELSISMIC", description: "Relazione sismica", meta: { tipo: "RT", formati: ".docx ; .pdf", fasi: "PFTE" } },
  { code: "RELSISSIC", description: "Relazione sistema di sicurezza — descrive la concezione del sistema di sicurezza per l'esercizio e le caratteristiche del progetto (Tab. 8 CSP)", meta: { tipo: "HS", formati: ".docx ; .pdf", fasi: "PFTE / CSP / CSE" } },
  { code: "RELSOSOPE", description: "Relazione sostenibilità dell'opera", meta: { tipo: "RT", formati: ".docx ; .pdf", fasi: "PFTE" } },
  { code: "RELSTRATI", description: "Relazione sulle stratigrafie realizzate", meta: { tipo: "RT", formati: ".docx ; .pdf", fasi: "INDA / RAPPRESE / PFTE" } },
  { code: "RELSTRUTT", description: "Relazione sulle strutture", meta: { tipo: "RT", formati: ".docx ; .pdf", fasi: "PE / DL" } },
  { code: "RELTECARC", description: "Relazione tecnica opere architettoniche", meta: { tipo: "RT", formati: ".docx ; .pdf", fasi: "PE / DL" } },
  { code: "RELTECIMP", description: "Relazione tecnica impianti", meta: { tipo: "RT", formati: ".docx ; .pdf", fasi: "PE / DL" } },
  { code: "RELTECNIC", description: "Relazione tecnica", meta: { tipo: "RT", formati: ".docx ; .pdf", fasi: "INDA / PFTE / PE / DL" } },
  { code: "RELVEGETA", description: "Relazione vegetazionale", meta: { tipo: "RT", formati: ".docx ; .pdf", fasi: "PFTE / PE" } },
  { code: "RICERCADC", description: "Relazione della ricerca documentale", meta: { tipo: "RT", formati: ".docx ; .pdf", fasi: "INDA / PFTE" } },
  { code: "RILFOTOGR", description: "Rilievo fotografico", meta: { tipo: "PH", formati: ".jpg ; .pdf", fasi: "RAPPRESE / PFTE / PE / CSP / DL / CSE / ESE" } },
  { code: "SCEEFFENE", description: "Scenario di efficientamento energetico", meta: { tipo: "RT", formati: ".docx ; .pdf", fasi: "INDA" } },
  { code: "SCENARIST", description: "Scenario di intervento", meta: { tipo: "RT", formati: ".docx ; .pdf", fasi: "INDA" } },
  { code: "SCHEDAINV", description: "Scheda inventario", meta: { tipo: "RP", formati: ".docx ; .pdf", fasi: "INDA" } },
  { code: "SCHESASIS", description: "Scheda di sintesi di livello 0, 1, 2 (sismico)", meta: { tipo: "RP", formati: ".docx ; .pdf", fasi: "INDA" } },
  { code: "SEZIONEIS", description: "Sezioni", meta: { tipo: "DR", formati: ".dxf ; .pdf; formato nativo", fasi: "INDA / PFTE / PE / DL" } },
  { code: "SICUREZZA", description: "Prime indicazioni prescrizioni per la stesura del piano di sicurezza", meta: { tipo: "HS", formati: ".docx ; .pdf", fasi: "PFTE" } },
  { code: "SIMPIANTI", description: "Relazione sullo stato degli impianti", meta: { tipo: "RT", formati: ".docx ; .pdf", fasi: "INDA" } },
  { code: "SPECIFCSP", description: "Capitolato Informativo — Specifica Metodologica Coordinamento Sicurezza in fase di Progettazione (CSP)", meta: { tipo: "SM", formati: ".pdf", fasi: "PFTE / CSP" } },
  { code: "SPECIFPRO", description: "Capitolato Informativo — Specifica Metodologica Progettazione Fattibilità Tecnico Economica", meta: { tipo: "SM", formati: ".pdf", fasi: "PFTE" } },
  { code: "SPECIFRIL", description: "Capitolato Informativo — Specifica Metodologica Rilievo (AS-IS) Beni Immobili", meta: { tipo: "SM", formati: ".pdf", fasi: "INDA / RAPPRESE" } },
  { code: "STUFATAMB", description: "Studio di fattibilità ambientale", meta: { tipo: "RT", formati: ".docx ; .pdf", fasi: "PFTE" } },
  { code: "STUPREAMB", description: "Studio prefattibilità ambientale", meta: { tipo: "RT", formati: ".docx ; .pdf", fasi: "PFTE" } },
  { code: "VERCONFOR", description: "Verifica di Conformità — Da prodursi da parte del DEC (o RUP se DEC non presente) al termine dell'esecuzione del servizio", meta: { tipo: "RT", formati: ".docx ; .pdf", fasi: "TUTTO" } },
  { code: "VERVULNER", description: "Relazione sulla verifica di vulnerabilità sismica", meta: { tipo: "RT", formati: ".docx ; .pdf", fasi: "INDA" } },
];

/* ============================================================
 * CAMPO 4 — LIVELLO DEL MODELLO (2 caratteri alfanumerici)
 * Tabella 13
 * ============================================================ */
export const LIVELLI: LookupEntry[] = [
  { code: "ZZ", description: "Livello Multiplo" },
  { code: "XX", description: "Nessun livello applicabile" },
  { code: "G2", description: "Piano fondazioni / Interrato 2" },
  { code: "G1", description: "Piano Interrato 1" },
  { code: "GF", description: "Piano Terra" },
  { code: "01", description: "Primo Piano" },
  { code: "02", description: "Secondo Piano" },
  { code: "03", description: "Terzo Piano" },
  { code: "04", description: "Quarto Piano" },
  { code: "05", description: "Quinto Piano" },
  { code: "06", description: "Sesto Piano" },
  { code: "07", description: "Settimo Piano" },
  { code: "08", description: "Piano copertura" },
];
export const LIVELLO_REGEX = /^[A-Z0-9]{2}$/;

/* ============================================================
 * CAMPO 5 — TIPO DI FILE (2 caratteri alfabetici/alfanumerici)
 * Tabella 14
 * ============================================================ */
export const TIPI_FILE: LookupEntry[] = [
  { code: "AM", description: "Documenti amministrativi" },
  { code: "BQ", description: "Computo delle quantità" },
  { code: "CA", description: "Relazioni di calcolo" },
  { code: "CM", description: "Construction Management" },
  { code: "CP", description: "Analisi dei costi" },
  { code: "CR", description: "Certificazioni" },
  { code: "DR", description: "Tavole 2D" },
  { code: "HS", description: "Sicurezza" },
  { code: "MI", description: "Report delle riunioni" },
  { code: "MS", description: "Method Statement – Procedura metodologica" },
  { code: "M2", description: "Modello con contenuti bidimensionali" },
  { code: "M3", description: "Modello con contenuti tridimensionali" },
  { code: "MR", description: "Modello da utilizzare per scopi diversi" },
  { code: "PH", description: "Materiale fotografico" },
  { code: "PC", description: "Nuvola di punti" },
  { code: "PR", description: "Programmazione" },
  { code: "RT", description: "Relazione tecnica" },
  { code: "RP", description: "Report e similari" },
  { code: "SM", description: "Specifica metodologica" },
  { code: "SO", description: "Specifica operativa" },
  { code: "SN", description: "Elenco delle non conformità (verifica)" },
  { code: "VS", description: "File per la visualizzazione del Modello (render, VR/AR)" },
];
export const TIPO_FILE_REGEX = /^[A-Z0-9]{2}$/;

/* ============================================================
 * CAMPO 6 — CODICE DISCIPLINA (1 carattere alfabetico)
 * Tabella 15
 * ============================================================ */
export const DISCIPLINE: LookupEntry[] = [
  { code: "A", description: "Architettonica" },
  { code: "S", description: "Strutturale" },
  { code: "M", description: "Impiantistica meccanica" },
  { code: "E", description: "Impiantistica elettrica" },
  { code: "P", description: "Impiantistica speciale" },
  { code: "F", description: "Antincendio" },
  { code: "G", description: "Verde, paesaggio e arredo urbano" },
  { code: "H", description: "Sicurezza (CSP/CSE)" },
  { code: "L", description: "Topografica e rilievo" },
  { code: "C", description: "Costruzioni" },
  { code: "R", description: "Restauro" },
  { code: "D", description: "Demolizioni" },
  { code: "T", description: "Temporanei (es. sicurezza)" },
  { code: "Y", description: "Federazione/Sintesi multidisciplinare" },
  { code: "Z", description: "Generale o multidisciplinare" },
];
export const DISCIPLINA_REGEX = /^[A-Z]$/;

/* ============================================================
 * CAMPO 7 — CODICE ALFANUMERICO ELABORATO (6 char)
 * Composizione: <Servizio><Stato/Fase><BloccoFunzionale(2)><Progressivo(2)>
 * Tabella 16, Figura 11
 * ============================================================ */
export const SERVIZI: LookupEntry[] = [
  { code: "S", description: "As Is (Stato di fatto)" },
  { code: "P", description: "PFTE - Progetto di Fattibilità Tecnico Economica" },
  { code: "D", description: "PD - Progetto Definitivo" },
  { code: "E", description: "PE - Progetto Esecutivo" },
  { code: "C", description: "CSP - Coordinamento Sicurezza Progettazione" },
  { code: "L", description: "DL - Direzione Lavori" },
  { code: "K", description: "CSE - Coordinamento Sicurezza Esecuzione" },
  { code: "B", description: "Progetto Costruttivo" },
  { code: "A", description: "As Built" },
  { code: "M", description: "Manutenzione" },
  { code: "G", description: "Generale" },
];

export const STATI_FASI: LookupEntry[] = [
  { code: "0", description: "Fase 0 / nessuno stato" },
  { code: "S", description: "Stato di fatto" },
  { code: "D", description: "Demolizioni" },
  { code: "N", description: "Nuove costruzioni" },
  { code: "R", description: "Interventi di restauro" },
  { code: "T", description: "Sicurezza (temporanei)" },
];

// Regex per il campo 7 completo:
//   - 6 char: <Servizio(1L)><Stato/Fase(1L|1N)><BF(2N)><Progressivo(2N)>
//     es. C00001 (Fase 0), PD0001 (Demolizioni), PS0001 (Stato di fatto)
export const CODICE_ELABORATO_REGEX = /^[A-Z][A-Z0-9]\d{4}$/;

/* ============================================================
 * METADATI PROGETTO MASE
 * ============================================================ */
export const PROGETTO_MASE = {
  nome: "Nuovo Ministero dell'Ambiente e della Sicurezza Energetica",
  indirizzo: "Viale Boston, 25 — EUR, Roma",
  codiceBene: CODICE_BENE_DEFAULT,
  codiceAgenzia: CODICE_AGENZIA_DEFAULT,
};

/* ============================================================
 * SEPARATORE UFFICIALE
 * ============================================================ */
export const SEPARATORE = "-";

/* ============================================================
 * STRUTTURA COMPLETA NAMING
 * <CodiceBene>-<CodiceAgenzia>-<CodiceDoc>-<Livello>-<TipoFile>-<Disciplina>-<CodiceElaborato>
 * Esempi:
 *   RMB1284-ADD-PLANLIVEL-GF-DR-A-PD0001
 *   RMB1284-ADD-RELGENERA-XX-RT-Z-PD0001
 *   RMB1284-ADD-PLANGEOLO-ZZ-DR-Z-PD0001
 * ============================================================ */
export const NAMING_FULL_REGEX =
  /^([A-Z]{3}\d{4})-([A-Z]{3})-([A-Z0-9]{9})-([A-Z0-9]{2})-([A-Z0-9]{2})-([A-Z])-([A-Z][A-Z0-9]\d{4})$/;

/* ============================================================
 * CATALOGO ELABORATI PFTE — Demolizioni MASE (R1)
 * Fonte: foglio "Codifica Elaborati" del file MASE_CodificaElaborati_R1.xlsx
 * 81 codici pre-approvati dalla Stazione Appaltante con descrizione ufficiale.
 *
 * Categorie (group):
 *   - DOCUMENTAZIONE GENERALE
 *   - INDAGINI E RILIEVI
 *   - ECONOMICA
 *   - INQUADRAMENTO TERRITORIALE
 *   - RILIEVO ARCHITETTONICO
 *   - DEMOLIZIONI
 *   - SICUREZZA / CANTIERE
 *   - VERIFICA E COORDINAMENTO
 * ============================================================ */
export type CatalogoEntry = {
  codice: string;
  descrizione: string;
  gruppo: string;
};

export const CATALOGO_ELABORATI: CatalogoEntry[] = [
  // --- DOCUMENTAZIONE GENERALE ---
  { codice: "RMB1284-ADD-ELENCELAB-XX-AM-Z-PD0001", descrizione: "ELENCO ELABORATI", gruppo: "Documentazione generale" },
  { codice: "RMB1284-ADD-RELGENERA-XX-RT-Z-PD0001", descrizione: "RELAZIONE GENERALE", gruppo: "Documentazione generale" },
  { codice: "RMB1284-ADD-RELTECNIC-XX-RT-Z-PD0001", descrizione: "RELAZIONE TECNICA CORREDATA DI RILIEVI, ACCERTAMENTI, INDAGINI E STUDI SPECIALISTICI", gruppo: "Documentazione generale" },
  { codice: "RMB1284-ADD-RILFOTOGR-XX-PH-Z-PD0001", descrizione: "DOCUMENTAZIONE FOTOGRAFICA", gruppo: "Documentazione generale" },
  { codice: "RMB1284-ADD-RELINTERF-XX-RT-Z-PD0001", descrizione: "RELAZIONE SULLE INTERFERENZE", gruppo: "Documentazione generale" },
  { codice: "RMB1284-ADD-PIAGESINF-XX-RT-Z-PD0001", descrizione: "PIANO DI GESTIONE INFORMATIVA", gruppo: "Documentazione generale" },
  { codice: "RMB1284-ADD-CAPSPEAPP-XX-AM-Z-PD0001", descrizione: "CAPITOLATO SPECIALE D'APPALTO E SCHEMA DI CONTRATTO", gruppo: "Documentazione generale" },
  { codice: "RMB1284-ADD-CONTRATTO-XX-AM-Z-PD0001", descrizione: "SCHEMA DI CONTRATTO", gruppo: "Documentazione generale" },
  { codice: "RMB1284-ADD-CAPSPEAPP-XX-AM-Z-PD0002", descrizione: "CAPITOLATO ONERI E OBBLIGHI DELL'APPALTATORE PER I P.E.A.", gruppo: "Documentazione generale" },
  { codice: "RMB1284-ADD-PIAGEOSTR-XX-RT-S-PD0001", descrizione: "PIANO PRELIMINARE DI MONITORAGGIO GEOTECNICO E STRUTTURALE", gruppo: "Documentazione generale" },
  { codice: "RMB1284-ADD-RELTECNIC-XX-RT-H-PD0001", descrizione: "PIANO PRELIMINARE DI MONITORAGGIO AMBIENTALE", gruppo: "Documentazione generale" },

  // --- AMBIENTE E SOSTENIBILITÀ ---
  { codice: "RMB1284-ADD-STUPREAMB-XX-RT-Z-PD0001", descrizione: "STUDIO DI PRE-FATTIBILITÀ AMBIENTALE", gruppo: "Ambiente e sostenibilità" },
  { codice: "RMB1284-ADD-STUPREAMB-XX-DR-Z-PD0001", descrizione: "ALLEGATI ALLO STUDIO DI PRE-FATTIBILITÀ AMBIENTALE", gruppo: "Ambiente e sostenibilità" },
  { codice: "RMB1284-ADD-RELSOSOPE-XX-RT-Z-PD0001", descrizione: "RELAZIONE DI SOSTENIBILITÀ DELL'OPERA", gruppo: "Ambiente e sostenibilità" },
  { codice: "RMB1284-ADD-RELAPPCAM-XX-RT-Z-PD0001", descrizione: "ALLEGATI ALLA RELAZIONE CAM", gruppo: "Ambiente e sostenibilità" },
  { codice: "RMB1284-ADD-RELGESMAT-XX-RT-D-PD0001", descrizione: "RELAZIONE SULLA GESTIONE DELLE MATERIE", gruppo: "Ambiente e sostenibilità" },
  { codice: "RMB1284-ADD-RELGESMAT-XX-DR-D-PD0001", descrizione: "RELAZIONE SULLA GESTIONE DELLE MATERIE (Tavole)", gruppo: "Ambiente e sostenibilità" },
  { codice: "RMB1284-ADD-RELVEGETA-XX-RT-G-PD0001", descrizione: "RILIEVO ARBOREO E VEGETAZIONALE", gruppo: "Ambiente e sostenibilità" },
  { codice: "RMB1284-ADD-RELVEGETA-XX-RT-G-PD0002", descrizione: "RELAZIONE TECNICA AGRONOMICA", gruppo: "Ambiente e sostenibilità" },
  { codice: "RMB1284-ADD-RELACUSTI-XX-RT-Z-PD0001", descrizione: "RELAZIONE DI VALUTAZIONE PREVISIONALE DI CLIMA ED IMPATTO ACUSTICO IN FASE DI CANTIERE", gruppo: "Ambiente e sostenibilità" },
  { codice: "RMB1284-ADD-RELIDRAUL-XX-RT-Z-PD0001", descrizione: "VALUTAZIONE DEL RISCHIO IDRAULICO", gruppo: "Ambiente e sostenibilità" },

  // --- INDAGINI E RILIEVI ---
  { codice: "RMB1284-ADD-PLANGEOLO-ZZ-DR-Z-PD0001", descrizione: "CARTE GEOLOGICHE E DEI VINCOLI", gruppo: "Indagini e rilievi" },
  { codice: "RMB1284-ADD-PLANGEOTE-ZZ-DR-Z-PD0001", descrizione: "PLANIMETRIA CON UBICAZIONE DELLE INDAGINI GEOGNOSTICHE E AMBIENTALI", gruppo: "Indagini e rilievi" },
  { codice: "RMB1284-ADD-SEZIONEIS-ZZ-DR-Z-PD0001", descrizione: "SEZIONI GEOLOGICHE", gruppo: "Indagini e rilievi" },
  { codice: "RMB1284-ADD-PLANSOTSV-ZZ-DR-Z-PD0001", descrizione: "PLANIMETRIA GEORADAR", gruppo: "Indagini e rilievi" },
  { codice: "RMB1284-ADD-GEOLOGICA-ZZ-DR-Z-PD0001", descrizione: "RELAZIONE GEOLOGICA E SISMICA", gruppo: "Indagini e rilievi" },
  { codice: "RMB1284-ADD-RELINDAGI-ZZ-DR-Z-PD0001", descrizione: "ELABORATO RELATIVO AL RISULTATO DELLE INDAGINI PRELIMINARI", gruppo: "Indagini e rilievi" },

  // --- ECONOMICA ---
  { codice: "RMB1284-ADD-QUADROECO-XX-CP-Z-PD0001", descrizione: "QUADRO ECONOMICO", gruppo: "Economica" },
  { codice: "RMB1284-ADD-CALSOMSPE-XX-CP-D-PD0001", descrizione: "COMPUTO ESTIMATIVO OPERE DI DEMOLIZIONE", gruppo: "Economica" },
  { codice: "RMB1284-ADD-CALSOMSPE-XX-CP-D-PD0002", descrizione: "ELENCO PREZZI UNITARIO OPERE DI DEMOLIZIONE", gruppo: "Economica" },
  { codice: "RMB1284-ADD-CALSOMSPE-XX-CP-D-PD0003", descrizione: "ANALISI PREZZI OPERE DI DEMOLIZIONE", gruppo: "Economica" },
  { codice: "RMB1284-ADD-CALSOMSPE-XX-CP-D-PD0004", descrizione: "STIMA INCIDENZA DELLA MANODOPERA OPERE DI DEMOLIZIONE", gruppo: "Economica" },
  { codice: "RMB1284-ADD-CALSOMSPE-XX-CP-H-PD0001", descrizione: "STIMA DEI COSTI DELLA SICUREZZA", gruppo: "Economica" },

  // --- STATO DI FATTO ---
  { codice: "RMB1284-ADD-RELTECNIC-XX-RT-Z-PD0002", descrizione: "RELAZIONE TECNICA SULLO STATO DI FATTO", gruppo: "Stato di fatto" },

  // --- INQUADRAMENTO TERRITORIALE ---
  { codice: "RMB1284-ADD-PLANINSIE-ZZ-DR-A-PD0001", descrizione: "INQUADRAMENTO URBANISTICO E TERRITORIALE", gruppo: "Inquadramento territoriale" },
  { codice: "RMB1284-ADD-PLANCURVE-ZZ-DR-L-PD0001", descrizione: "PLANIMETRIA CON LE CURVE DI LIVELLO", gruppo: "Inquadramento territoriale" },
  { codice: "RMB1284-ADD-SEZIONEIS-ZZ-DR-L-PD0001", descrizione: "PROFILI STRADALI 1/2", gruppo: "Inquadramento territoriale" },
  { codice: "RMB1284-ADD-SEZIONEIS-ZZ-DR-L-PD0002", descrizione: "PROFILI STRADALI 2/2", gruppo: "Inquadramento territoriale" },
  { codice: "RMB1284-ADD-PLANINSIE-ZZ-DR-L-PD0002", descrizione: "VIABILITÀ", gruppo: "Inquadramento territoriale" },
  { codice: "RMB1284-ADD-PLANGENER-ZZ-DR-L-PD0002", descrizione: "PLANIMETRIE DELLE INTERFERENZE", gruppo: "Inquadramento territoriale" },

  // --- RILIEVO ARCHITETTONICO ---
  { codice: "RMB1284-ADD-PLANGENER-ZZ-DR-A-PD0001", descrizione: "Rilievo - Planimetria generale", gruppo: "Rilievo architettonico" },
  { codice: "RMB1284-ADD-PLANLIVEL-G1-DR-A-PD0001", descrizione: "Rilievo - Piano interrato", gruppo: "Rilievo architettonico" },
  { codice: "RMB1284-ADD-PLANLIVEL-GF-DR-A-PD0001", descrizione: "Rilievo - Piano terra", gruppo: "Rilievo architettonico" },
  { codice: "RMB1284-ADD-PLANLIVEL-01-DR-A-PD0001", descrizione: "Rilievo - Piano primo", gruppo: "Rilievo architettonico" },
  { codice: "RMB1284-ADD-PLANLIVEL-02-DR-A-PD0001", descrizione: "Rilievo - Piano secondo", gruppo: "Rilievo architettonico" },
  { codice: "RMB1284-ADD-PLANLIVEL-03-DR-A-PD0001", descrizione: "Rilievo - Piano terzo", gruppo: "Rilievo architettonico" },
  { codice: "RMB1284-ADD-PLANLIVEL-04-DR-A-PD0001", descrizione: "Rilievo - Piano quarto", gruppo: "Rilievo architettonico" },
  { codice: "RMB1284-ADD-PLANLIVEL-05-DR-A-PD0001", descrizione: "Rilievo - Piano quinto", gruppo: "Rilievo architettonico" },
  { codice: "RMB1284-ADD-PLANLIVEL-06-DR-A-PD0001", descrizione: "Rilievo - Piano sesto", gruppo: "Rilievo architettonico" },
  { codice: "RMB1284-ADD-PLANLIVEL-07-DR-A-PD0001", descrizione: "Rilievo - Piano settimo", gruppo: "Rilievo architettonico" },
  { codice: "RMB1284-ADD-PLANLIVEL-08-DR-A-PD0001", descrizione: "Rilievo - Piano copertura", gruppo: "Rilievo architettonico" },
  { codice: "RMB1284-ADD-PROSPETTI-ZZ-DR-A-PD0001", descrizione: "Rilievo - Prospetti Sud, Nord", gruppo: "Rilievo architettonico" },
  { codice: "RMB1284-ADD-PROSPETTI-ZZ-DR-A-PD0002", descrizione: "Rilievo - Prospetti Est", gruppo: "Rilievo architettonico" },
  { codice: "RMB1284-ADD-PROSPETTI-ZZ-DR-A-PD0003", descrizione: "Rilievo - Prospetti Ovest", gruppo: "Rilievo architettonico" },
  { codice: "RMB1284-ADD-SEZIONEIS-ZZ-DR-A-PD0001", descrizione: "Rilievo - Sezioni S-01", gruppo: "Rilievo architettonico" },
  { codice: "RMB1284-ADD-SEZIONEIS-ZZ-DR-A-PD0002", descrizione: "Rilievo - Sezioni S-02", gruppo: "Rilievo architettonico" },
  { codice: "RMB1284-ADD-SEZIONEIS-ZZ-DR-A-PD0003", descrizione: "Rilievo - Sezioni S-03, S-04", gruppo: "Rilievo architettonico" },
  { codice: "RMB1284-ADD-SEZIONEIS-ZZ-DR-A-PD0004", descrizione: "Rilievo - Sezioni S-05, S-06", gruppo: "Rilievo architettonico" },

  // --- DEMOLIZIONI ---
  { codice: "RMB1284-ADD-RELTECNIC-XX-RT-D-PD0001", descrizione: "RELAZIONE TECNICA SULLE OPERE DI DEMOLIZIONE", gruppo: "Demolizioni" },
  { codice: "RMB1284-ADD-RELTECNIC-XX-RT-D-PD0002", descrizione: "SCHEDATURA ANALITICA - Analisi Unità Omogenee mono-materiale", gruppo: "Demolizioni" },
  { codice: "RMB1284-ADD-PLANGENER-ZZ-DR-D-PD0001", descrizione: "DEMOLIZIONE SELETTIVA - Messa in sicurezza, opere provvisionali", gruppo: "Demolizioni" },
  { codice: "RMB1284-ADD-PLANLIVEL-G2-DR-D-PD0001", descrizione: "DEMOLIZIONE SELETTIVA - Piano G2", gruppo: "Demolizioni" },
  { codice: "RMB1284-ADD-PLANLIVEL-G1-DR-D-PD0001", descrizione: "DEMOLIZIONE SELETTIVA - Piano G1", gruppo: "Demolizioni" },
  { codice: "RMB1284-ADD-PLANLIVEL-GF-DR-D-PD0001", descrizione: "DEMOLIZIONE SELETTIVA - Piano GF", gruppo: "Demolizioni" },
  { codice: "RMB1284-ADD-PLANLIVEL-01-DR-D-PD0001", descrizione: "DEMOLIZIONE SELETTIVA - Piano 1", gruppo: "Demolizioni" },
  { codice: "RMB1284-ADD-PLANLIVEL-02-DR-D-PD0001", descrizione: "DEMOLIZIONE SELETTIVA - Piano 2", gruppo: "Demolizioni" },
  { codice: "RMB1284-ADD-PLANLIVEL-03-DR-D-PD0001", descrizione: "DEMOLIZIONE SELETTIVA - Piano 3", gruppo: "Demolizioni" },
  { codice: "RMB1284-ADD-PLANLIVEL-04-DR-D-PD0001", descrizione: "DEMOLIZIONE SELETTIVA - Piano 4", gruppo: "Demolizioni" },
  { codice: "RMB1284-ADD-PLANLIVEL-05-DR-D-PD0001", descrizione: "DEMOLIZIONE SELETTIVA - Piano 5", gruppo: "Demolizioni" },
  { codice: "RMB1284-ADD-PLANLIVEL-06-DR-D-PD0001", descrizione: "DEMOLIZIONE SELETTIVA - Piano 6", gruppo: "Demolizioni" },
  { codice: "RMB1284-ADD-PLANLIVEL-07-DR-D-PD0001", descrizione: "DEMOLIZIONE SELETTIVA - Piano 7", gruppo: "Demolizioni" },
  { codice: "RMB1284-ADD-PLANLIVEL-08-DR-D-PD0001", descrizione: "DEMOLIZIONE SELETTIVA - Piano 8", gruppo: "Demolizioni" },
  { codice: "RMB1284-ADD-PROSPETTI-ZZ-DR-D-PD0001", descrizione: "DEMOLIZIONE SELETTIVA - Prospetti", gruppo: "Demolizioni" },
  { codice: "RMB1284-ADD-SEZIONEIS-ZZ-DR-D-PD0001", descrizione: "DEMOLIZIONE SELETTIVA - Sezioni", gruppo: "Demolizioni" },

  // --- CAPITOLATO INFORMATIVO / SPECIFICHE METODOLOGICHE BIM ---
  // Documenti ufficiali dell'Agenzia del Demanio che definiscono il processo informativo BIM.
  // Pattern: il Servizio nel Campo 7 corrisponde all'iniziale della specifica (C=CSP, S=Rilievi, P=PFTE).
  { codice: "RMB1284-ADD-SPECIFRIL-XX-SM-Z-S00001", descrizione: "Capitolato Informativo — Specifica Metodologica Rilievo (AS-IS) Beni Immobili", gruppo: "Capitolato Informativo BIM" },
  { codice: "RMB1284-ADD-SPECIFPRO-XX-SM-Z-P00001", descrizione: "Capitolato Informativo — Specifica Metodologica Progettazione Fattibilità Tecnico Economica", gruppo: "Capitolato Informativo BIM" },
  { codice: "RMB1284-ADD-SPECIFCSP-XX-SM-Z-C00001", descrizione: "Capitolato Informativo — Specifica Metodologica per il Coordinamento della Sicurezza in fase di Progettazione (CSP)", gruppo: "Capitolato Informativo BIM" },

  // --- SICUREZZA / CANTIERE ---
  { codice: "RMB1284-ADD-PIASICCOO-XX-HS-D-PD0001", descrizione: "PSC - Piano di Sicurezza e Coordinamento", gruppo: "Sicurezza / Cantiere" },
  { codice: "RMB1284-ADD-CRONOPROG-XX-HS-D-PD0001", descrizione: "CRONOPROGRAMMA", gruppo: "Sicurezza / Cantiere" },
  { codice: "RMB1284-ADD-PLANGENER-ZZ-HS-D-PD0001", descrizione: "ELABORATI DI CANTIERE PER LE DEMOLIZIONI", gruppo: "Sicurezza / Cantiere" },
  { codice: "RMB1284-ADD-PLANGENER-ZZ-HS-D-PD0002", descrizione: "STUDIO DELLA VIABILITÀ DI ACCESSO AL CANTIERE", gruppo: "Sicurezza / Cantiere" },

  // --- VERIFICA E COORDINAMENTO ---
  { codice: "RMB1284-ADD-RELTECNIC-XX-RT-Z-PD0003", descrizione: "RELAZIONE TECNICA ASSEVERATA ANTE OPERAM", gruppo: "Verifica e coordinamento" },
  { codice: "RMB1284-ADD-RELTECNIC-XX-RT-Z-PD0004", descrizione: "RELAZIONE SPECIALISTICA SUI MODELLI", gruppo: "Verifica e coordinamento" },
  // ⚠ Aggiornamento R1 (2026-05-20): la disciplina di PD0005 è passata da Z (Generale) a M (Impiantistica meccanica)
  { codice: "RMB1284-ADD-RELTECNIC-XX-RT-M-PD0005", descrizione: "REPORT DI COORDINAMENTO E VERIFICA", gruppo: "Verifica e coordinamento" },
];

/* Helper: lookup per codice esatto (case-insensitive) */
export function findInCatalogo(codice: string): CatalogoEntry | undefined {
  const normalized = codice.trim().toUpperCase();
  return CATALOGO_ELABORATI.find((c) => c.codice.toUpperCase() === normalized);
}

/* Gruppi distinti, in ordine di prima apparizione */
export const CATALOGO_GRUPPI: string[] = Array.from(
  new Set(CATALOGO_ELABORATI.map((c) => c.gruppo))
);
