/**
 * Gestione tema (chiaro / scuro) con persistenza in localStorage.
 *
 * Il tema viene applicato tramite la classe ".theme-dark" sull'elemento <html>.
 * Nota: NON usiamo data-theme perché LightningCSS (compilatore CSS di Tailwind v4)
 * riconosce quel pattern come marker per la funzione light-dark() e scarta le
 * override di custom properties. La classe CSS funziona invece in modo prevedibile.
 *
 * Le variabili CSS in globals.css definiscono i token per ciascun tema.
 */

export type Theme = "light" | "dark";

const STORAGE_KEY = "mase-theme";
const CHANGE_EVENT = "mase-theme-change";
const DARK_CLASS = "theme-dark";

/** Applica la classe del tema al <html>. */
function applyThemeClass(theme: Theme): void {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  if (theme === "dark") html.classList.add(DARK_CLASS);
  else html.classList.remove(DARK_CLASS);
}

/** Legge il tema salvato. Se nessuna preferenza salvata, ritorna il default "light". */
export function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const saved = window.localStorage.getItem(STORAGE_KEY);
  return saved === "dark" ? "dark" : "light";
}

/** Imposta il tema, lo persiste e applica al DOM. */
export function setTheme(theme: Theme): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, theme);
  applyThemeClass(theme);
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: theme }));
}

/** Applica il tema corrente al DOM. Da chiamare al mount. */
export function applyStoredTheme(): void {
  if (typeof window === "undefined") return;
  applyThemeClass(getStoredTheme());
}

/** Subscribe a cambi di tema (sia nella stessa tab che da altre). */
export function subscribeTheme(callback: (theme: Theme) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (e: Event) => {
    const t = (e as CustomEvent<Theme>).detail;
    callback(t);
  };
  const storageHandler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY && (e.newValue === "light" || e.newValue === "dark")) {
      callback(e.newValue);
      applyThemeClass(e.newValue);
    }
  };
  window.addEventListener(CHANGE_EVENT, handler);
  window.addEventListener("storage", storageHandler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener("storage", storageHandler);
  };
}
