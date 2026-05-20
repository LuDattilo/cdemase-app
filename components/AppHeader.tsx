"use client";

import { FileText, Sun, Moon, Languages, BookOpen } from "lucide-react";
import { useAppState } from "@/lib/useAppState";
import { PROGETTO_MASE } from "@/lib/codifica-data";

const BASE = process.env.GITHUB_PAGES === "true" ? "/cdemase-app" : "";
const SPECS_PDF_URL = `${BASE}/docs/RMB1284-ADD-SPECIFCSP-XX-SM-Z-C00001.pdf`;

export function AppHeader() {
  const { t, theme, setTheme, locale, setLocale } = useAppState();

  return (
    <header className="border-b border-[color:var(--color-mase-border)] bg-[color:var(--color-mase-surface)]">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color:var(--color-mase-primary-soft)]">
            <FileText className="h-5 w-5 text-[color:var(--color-mase-primary)]" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold sm:text-lg">
              {t("app.title")}
            </h1>
            <p className="truncate text-xs text-[color:var(--color-mase-text-muted)]">
              {PROGETTO_MASE.nome}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {/* Specifications PDF — open in new tab */}
          <a
            href={SPECS_PDF_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[color:var(--color-mase-border)] bg-[color:var(--color-mase-surface)] px-3 text-xs font-medium text-[color:var(--color-mase-text-muted)] transition-colors hover:border-[color:var(--color-mase-primary)]/40 hover:text-[color:var(--color-mase-text)]"
            title={t("header.specs.title")}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t("header.specs.short")}</span>
          </a>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[color:var(--color-mase-border)] bg-[color:var(--color-mase-surface)] text-[color:var(--color-mase-text-muted)] transition-colors hover:border-[color:var(--color-mase-primary)]/40 hover:text-[color:var(--color-mase-text)]"
            title={theme === "light" ? t("header.theme.dark") : t("header.theme.light")}
            aria-label={t("header.theme.toggle")}
          >
            {theme === "light" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </button>

          {/* Language switcher */}
          <div
            className="flex items-center overflow-hidden rounded-lg border border-[color:var(--color-mase-border)] bg-[color:var(--color-mase-surface)]"
            role="group"
            aria-label={t("header.lang.toggle")}
          >
            <Languages className="ml-2 h-3.5 w-3.5 text-[color:var(--color-mase-text-subtle)]" />
            <button
              onClick={() => setLocale("it")}
              aria-pressed={locale === "it"}
              className={`px-2 py-1.5 text-xs font-semibold transition-colors ${
                locale === "it"
                  ? "bg-[color:var(--color-mase-primary)] text-[color:var(--color-mase-primary-text)]"
                  : "text-[color:var(--color-mase-text-muted)] hover:text-[color:var(--color-mase-text)]"
              }`}
              title={t("header.lang.it")}
            >
              IT
            </button>
            <button
              onClick={() => setLocale("en")}
              aria-pressed={locale === "en"}
              className={`px-2 py-1.5 text-xs font-semibold transition-colors ${
                locale === "en"
                  ? "bg-[color:var(--color-mase-primary)] text-[color:var(--color-mase-primary-text)]"
                  : "text-[color:var(--color-mase-text-muted)] hover:text-[color:var(--color-mase-text)]"
              }`}
              title={t("header.lang.en")}
            >
              EN
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
