"use client";

import { useEffect, useState, useCallback } from "react";
import {
  type Locale,
  getStoredLocale,
  setLocale as persistLocale,
  subscribeLocale,
  translate,
} from "./i18n";
import { type Theme, getStoredTheme, setTheme as persistTheme, subscribeTheme } from "./theme";

/**
 * Hook unificato per stato globale dell'app: locale + tema.
 *
 * Espone `t(key)` per la traduzione, `locale`/`setLocale`, `theme`/`setTheme`.
 * Sincronizza automaticamente con localStorage e altre tab.
 */
export function useAppState() {
  const [locale, setLocaleState] = useState<Locale>("it");
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    // Init dal localStorage (lato client)
    setLocaleState(getStoredLocale());
    setThemeState(getStoredTheme());

    const unsubLocale = subscribeLocale((l) => setLocaleState(l));
    const unsubTheme = subscribeTheme((t) => setThemeState(t));
    return () => {
      unsubLocale();
      unsubTheme();
    };
  }, []);

  const setLocale = useCallback((l: Locale) => {
    persistLocale(l);
    setLocaleState(l);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    persistTheme(t);
    setThemeState(t);
  }, []);

  const t = useCallback((key: string) => translate(key, locale), [locale]);

  return { locale, setLocale, theme, setTheme, t };
}
