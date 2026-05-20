"use client";

import { useState, useMemo } from "react";
import { Search, BookOpen } from "lucide-react";
import {
  CODICI_DOCUMENTO,
  LIVELLI,
  TIPI_FILE,
  DISCIPLINE,
  SERVIZI,
  STATI_FASI,
} from "@/lib/codifica-data";
import { Card, Input, Badge } from "./ui-primitives";
import { useAppState } from "@/lib/useAppState";

type Tab = "documenti" | "livelli" | "tipi" | "discipline" | "servizi";

export function Reference() {
  const { t } = useAppState();
  const [tab, setTab] = useState<Tab>("documenti");
  const [query, setQuery] = useState("");

  const TAB_LABELS: { key: Tab; label: string; count: number }[] = [
    { key: "documenti", label: t("reference.tab.documenti"), count: CODICI_DOCUMENTO.length },
    { key: "livelli", label: t("reference.tab.livelli"), count: LIVELLI.length },
    { key: "tipi", label: t("reference.tab.tipi"), count: TIPI_FILE.length },
    { key: "discipline", label: t("reference.tab.discipline"), count: DISCIPLINE.length },
    { key: "servizi", label: t("reference.tab.servizi"), count: SERVIZI.length + STATI_FASI.length },
  ];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filter = <T extends { code: string; description: string }>(items: T[]) =>
      q
        ? items.filter(
            (i) =>
              i.code.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)
          )
        : items;

    switch (tab) {
      case "documenti":
        return filter(CODICI_DOCUMENTO);
      case "livelli":
        return filter(LIVELLI);
      case "tipi":
        return filter(TIPI_FILE);
      case "discipline":
        return filter(DISCIPLINE);
      case "servizi":
        return filter(SERVIZI);
      default:
        return [];
    }
  }, [tab, query]);

  return (
    <div className="space-y-5">
      <Card>
        <div className="mb-4 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-[color:var(--color-mase-primary)]" />
          <h3 className="text-base font-semibold">{t("reference.title")}</h3>
        </div>

        <div className="-mx-1 mb-4 flex flex-wrap gap-1.5">
          {TAB_LABELS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                tab === t.key
                  ? "bg-[color:var(--color-mase-primary)] text-[color:var(--color-mase-primary-text)]"
                  : "bg-[color:var(--color-mase-surface-elevated)] text-[color:var(--color-mase-text-muted)] hover:text-[color:var(--color-mase-text)] border border-[color:var(--color-mase-border)]"
              }`}
            >
              {t.label}{" "}
              <span className="ml-1 font-mono text-[10px] opacity-70">{t.count}</span>
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-mase-text-muted)]" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`${t("reference.search")} ${TAB_LABELS.find((tb) => tb.key === tab)?.label}...`}
            className="pl-9"
          />
        </div>
      </Card>

      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-[color:var(--color-mase-border)] text-left text-xs uppercase tracking-wider text-[color:var(--color-mase-text-muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">{t("reference.col.codice")}</th>
                <th className="px-4 py-3 font-medium">{t("reference.col.descrizione")}</th>
                {tab === "documenti" && (
                  <>
                    <th className="px-4 py-3 font-medium">{t("reference.col.tipo")}</th>
                    <th className="px-4 py-3 font-medium">{t("reference.col.formati")}</th>
                    <th className="px-4 py-3 font-medium">{t("reference.col.fasi")}</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={tab === "documenti" ? 5 : 2}
                    className="px-4 py-8 text-center text-sm text-[color:var(--color-mase-text-muted)]"
                  >
                    {t("reference.empty")} "{query}"
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr
                    key={item.code}
                    className="border-b border-[color:var(--color-mase-border)]/40 last:border-0 hover:bg-[color:var(--color-mase-surface-elevated)]/40"
                  >
                    <td className="px-4 py-2.5">
                      <code className="font-mono text-[color:var(--color-mase-primary)]">
                        {item.code}
                      </code>
                    </td>
                    <td className="px-4 py-2.5 text-[color:var(--color-mase-text)]">
                      {item.description}
                    </td>
                    {tab === "documenti" && "meta" in item && item.meta && (
                      <>
                        <td className="px-4 py-2.5">
                          <Badge tone="neutral">{item.meta.tipo ?? "—"}</Badge>
                        </td>
                        <td className="px-4 py-2.5 font-mono text-xs text-[color:var(--color-mase-text-muted)]">
                          {item.meta.formati ?? "—"}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-xs text-[color:var(--color-mase-text-muted)]">
                          {item.meta.fasi ?? "—"}
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {tab === "servizi" && (
        <Card>
          <h4 className="mb-3 text-sm font-semibold">{t("reference.stati.title")}</h4>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {STATI_FASI.map((s) => (
              <div
                key={s.code}
                className="rounded-lg border border-[color:var(--color-mase-border)] bg-[color:var(--color-mase-surface-elevated)] px-3 py-2"
              >
                <code className="font-mono text-[color:var(--color-mase-primary)]">{s.code}</code>
                <span className="ml-2 text-sm">{s.description}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
