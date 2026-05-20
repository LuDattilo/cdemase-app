/**
 * Catalogo personale dell'utente — persistito in localStorage.
 *
 * Il catalogo ufficiale (CATALOGO_ELABORATI) resta read-only.
 * Questo modulo gestisce entries aggiunte dall'utente tramite il Generator.
 *
 * Quando si fa il deploy multi-utente con backend condiviso (es. Vercel KV),
 * basterà sostituire questo file con una versione che chiama un endpoint API.
 */

import type { CatalogoEntry } from "./codifica-data";

const STORAGE_KEY = "mase-user-catalog-v1";
const CHANGE_EVENT = "mase-user-catalog-change";

export type UserCatalogoEntry = CatalogoEntry & {
  /** ISO timestamp di quando l'utente l'ha aggiunto */
  addedAt: string;
  /** Note libere dell'utente */
  note?: string;
};

/** Legge tutto il catalogo personale, ordinato per data desc (più recenti primi) */
export function getUserCatalog(): UserCatalogoEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (e): e is UserCatalogoEntry =>
          e &&
          typeof e.codice === "string" &&
          typeof e.descrizione === "string" &&
          typeof e.gruppo === "string" &&
          typeof e.addedAt === "string"
      )
      .sort((a, b) => b.addedAt.localeCompare(a.addedAt));
  } catch {
    return [];
  }
}

/**
 * Aggiunge una voce al catalogo personale.
 * Ritorna l'entry creata, oppure null se esiste già un'entry con lo stesso codice
 * (in qualsiasi catalogo: ufficiale o personale — quello viene controllato dal chiamante).
 */
export function addToUserCatalog(
  entry: Omit<UserCatalogoEntry, "addedAt"> & { addedAt?: string }
): UserCatalogoEntry | null {
  if (typeof window === "undefined") return null;
  const current = getUserCatalog();
  const codice = entry.codice.trim().toUpperCase();

  // Dedup nel solo catalogo personale (l'ufficiale è controllato a monte)
  if (current.some((e) => e.codice.toUpperCase() === codice)) {
    return null;
  }

  const newEntry: UserCatalogoEntry = {
    codice,
    descrizione: entry.descrizione.trim(),
    gruppo: entry.gruppo?.trim() || "I miei codici",
    addedAt: entry.addedAt ?? new Date().toISOString(),
    note: entry.note?.trim() || undefined,
  };

  const next = [newEntry, ...current];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  notifyChange();
  return newEntry;
}

/** Rimuove una voce dal catalogo personale per codice. */
export function removeFromUserCatalog(codice: string): boolean {
  if (typeof window === "undefined") return false;
  const current = getUserCatalog();
  const normalized = codice.trim().toUpperCase();
  const next = current.filter((e) => e.codice.toUpperCase() !== normalized);
  if (next.length === current.length) return false;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  notifyChange();
  return true;
}

/**
 * Rimuove più voci dal catalogo personale in un'unica operazione (una sola write + una sola notifica).
 * Restituisce il numero di voci effettivamente rimosse.
 */
export function removeManyFromUserCatalog(codici: string[]): number {
  if (typeof window === "undefined" || codici.length === 0) return 0;
  const normalized = new Set(codici.map((c) => c.trim().toUpperCase()));
  const current = getUserCatalog();
  const next = current.filter((e) => !normalized.has(e.codice.toUpperCase()));
  const removed = current.length - next.length;
  if (removed === 0) return 0;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  notifyChange();
  return removed;
}

/** Pulisce tutto il catalogo personale. */
export function clearUserCatalog(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  notifyChange();
}

/** Conta le voci del catalogo personale (utile per badge). */
export function getUserCatalogCount(): number {
  return getUserCatalog().length;
}

/** Esporta il catalogo personale come stringa JSON formattata (per backup). */
export function exportUserCatalogAsJSON(): string {
  return JSON.stringify(getUserCatalog(), null, 2);
}

// ─── Codici nascosti (entry ufficiali che l'utente vuole escludere dalla vista) ───

const HIDDEN_KEY = "mase-hidden-codes-v1";

export function getHiddenCodes(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(HIDDEN_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.map((c: unknown) => String(c).toUpperCase()));
  } catch {
    return new Set();
  }
}

export function hideCodes(codici: string[]): void {
  if (typeof window === "undefined" || codici.length === 0) return;
  const current = getHiddenCodes();
  codici.forEach((c) => current.add(c.trim().toUpperCase()));
  window.localStorage.setItem(HIDDEN_KEY, JSON.stringify(Array.from(current)));
  notifyChange();
}

export function restoreHiddenCodes(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(HIDDEN_KEY);
  notifyChange();
}

export function getHiddenCount(): number {
  return getHiddenCodes().size;
}

// ─── Evento custom: emesso quando il catalogo cambia (add/remove/clear) ───

/**
 * Evento custom: emesso quando il catalogo cambia (add/remove/clear).
 * I componenti possono iscriversi per ricaricare la vista.
 */
function notifyChange(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

/** Hook helper: registra un listener e ritorna la funzione di cleanup */
export function subscribeUserCatalog(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => callback();
  window.addEventListener(CHANGE_EVENT, handler);
  // localStorage events da altre tab
  const storageHandler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) callback();
  };
  window.addEventListener("storage", storageHandler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener("storage", storageHandler);
  };
}
