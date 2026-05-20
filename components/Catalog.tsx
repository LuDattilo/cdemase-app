"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Library, Search, Copy, Check, Trash2, User2, Download } from "lucide-react";
import {
  CATALOGO_ELABORATI,
  CATALOGO_GRUPPI,
  type CatalogoEntry,
} from "@/lib/codifica-data";
import {
  getUserCatalog,
  removeFromUserCatalog,
  subscribeUserCatalog,
  exportUserCatalogAsJSON,
  type UserCatalogoEntry,
} from "@/lib/userCatalog";
import { Card, Input, Badge, Button } from "./ui-primitives";
import { useAppState } from "@/lib/useAppState";

type UnifiedEntry =
  | (CatalogoEntry & { isUser: false })
  | (UserCatalogoEntry & { isUser: true });

export function Catalog() {
  const { t, locale } = useAppState();
  const [query, setQuery] = useState("");
  const [gruppo, setGruppo] = useState<string>("__all__");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [userCatalog, setUserCatalog] = useState<UserCatalogoEntry[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const confirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Carica il catalogo personale + subscribe ai cambiamenti
  useEffect(() => {
    setUserCatalog(getUserCatalog());
    const unsubscribe = subscribeUserCatalog(() => setUserCatalog(getUserCatalog()));
    return () => {
      unsubscribe();
      // Cleanup del timeout per evitare update su componente smontato
      if (confirmTimerRef.current) {
        clearTimeout(confirmTimerRef.current);
        confirmTimerRef.current = null;
      }
    };
  }, []);

  // Combina i due cataloghi in una vista unificata
  const allEntries: UnifiedEntry[] = useMemo(() => {
    const official: UnifiedEntry[] = CATALOGO_ELABORATI.map((e) => ({ ...e, isUser: false }));
    const user: UnifiedEntry[] = userCatalog.map((e) => ({ ...e, isUser: true }));
    return [...user, ...official]; // utente primi (più recenti)
  }, [userCatalog]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allEntries.filter((e) => {
      if (gruppo !== "__all__" && e.gruppo !== gruppo) return false;
      if (!q) return true;
      return (
        e.codice.toLowerCase().includes(q) ||
        e.descrizione.toLowerCase().includes(q) ||
        e.gruppo.toLowerCase().includes(q)
      );
    });
  }, [query, gruppo, allEntries]);

  // Gruppi disponibili (ufficiali + "I miei codici" se ci sono entry utente)
  const gruppiDisponibili = useMemo(() => {
    const set = new Set<string>(CATALOGO_GRUPPI);
    userCatalog.forEach((e) => set.add(e.gruppo));
    return Array.from(set);
  }, [userCatalog]);

  // Raggruppa i risultati
  const grouped = useMemo(() => {
    const map = new Map<string, UnifiedEntry[]>();
    for (const e of filtered) {
      if (!map.has(e.gruppo)) map.set(e.gruppo, []);
      map.get(e.gruppo)!.push(e);
    }
    return gruppiDisponibili
      .filter((g) => map.has(g))
      .map((g) => ({ gruppo: g, entries: map.get(g)! }));
  }, [filtered, gruppiDisponibili]);

  function handleCopy(codice: string) {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(codice).then(() => {
      setCopiedCode(codice);
      setTimeout(() => setCopiedCode(null), 1500);
    });
  }

  function handleRemove(codice: string) {
    // Cancella sempre un eventuale timer pendente prima di azzerare/impostare lo stato
    if (confirmTimerRef.current) {
      clearTimeout(confirmTimerRef.current);
      confirmTimerRef.current = null;
    }
    if (confirmDelete === codice) {
      removeFromUserCatalog(codice);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(codice);
      confirmTimerRef.current = setTimeout(() => {
        setConfirmDelete(null);
        confirmTimerRef.current = null;
      }, 2400);
    }
  }

  function handleExport() {
    const json = exportUserCatalogAsJSON();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mase-miei-codici-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const countUser = userCatalog.length;

  return (
    <div className="space-y-5">
      <Card>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Library className="h-4 w-4 text-[color:var(--color-mase-primary)]" />
          <h3 className="text-base font-semibold">{t("catalog.title")}</h3>
          {countUser > 0 && (
            <button
              onClick={handleExport}
              className="ml-auto inline-flex items-center gap-1 rounded-lg border border-[color:var(--color-mase-border)] bg-[color:var(--color-mase-surface-elevated)] px-3 py-1.5 text-xs font-medium text-[color:var(--color-mase-text-muted)] transition-colors hover:text-[color:var(--color-mase-text)]"
              title={t("catalog.backup.title")}
            >
              <Download className="h-3.5 w-3.5" /> {t("catalog.backup")}
            </button>
          )}
        </div>

        {/* Search + group filter */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-mase-text-muted)]" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("catalog.search.placeholder")}
              className="pl-9"
            />
          </div>
          <select
            value={gruppo}
            onChange={(e) => setGruppo(e.target.value)}
            className="w-full rounded-xl border border-[color:var(--color-mase-border)] bg-[color:var(--color-mase-surface-elevated)] px-3 py-2.5 text-sm text-[color:var(--color-mase-text)] transition-colors hover:border-[color:var(--color-mase-primary)]/60"
          >
            <option value="__all__">
              {t("catalog.group.all")} ({gruppiDisponibili.length})
            </option>
            {gruppiDisponibili.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-[color:var(--color-mase-text-muted)]">
          <span>
            <strong className="text-[color:var(--color-mase-text)]">{filtered.length}</strong>{" "}
            {filtered.length === 1 ? t("catalog.results.singular") : t("catalog.results.plural")}
          </span>
          {(query || gruppo !== "__all__") && (
            <button
              onClick={() => {
                setQuery("");
                setGruppo("__all__");
              }}
              className="text-[color:var(--color-mase-primary)] hover:underline"
            >
              {t("catalog.reset")}
            </button>
          )}
        </div>
      </Card>

      {grouped.length === 0 ? (
        <Card>
          <p className="py-6 text-center text-sm text-[color:var(--color-mase-text-muted)]">
            {t("catalog.empty")} "{query}"
            {gruppo !== "__all__" && ` ${t("catalog.empty.group")} "${gruppo}"`}.
          </p>
        </Card>
      ) : (
        grouped.map(({ gruppo: g, entries }) => (
          <Card key={g} className="p-0">
            <div className="flex items-center justify-between border-b border-[color:var(--color-mase-border)] px-4 py-3">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold">{g}</h4>
                {entries.some((e) => e.isUser) && entries.every((e) => e.isUser) && (
                  <Badge tone="warning">
                    <User2 className="mr-1 inline h-3 w-3" />
                    {t("catalog.personalized")}
                  </Badge>
                )}
              </div>
              <Badge tone="neutral">{entries.length}</Badge>
            </div>
            <div className="divide-y divide-[color:var(--color-mase-border)]">
              {entries.map((e) => {
                const copied = copiedCode === e.codice;
                const isConfirming = confirmDelete === e.codice;
                return (
                  <div
                    key={e.codice}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-[color:var(--color-mase-surface-elevated)]"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-2">
                        <code className="block break-all font-mono text-xs text-[color:var(--color-mase-primary)] sm:text-sm">
                          {e.codice}
                        </code>
                        {e.isUser && (
                          <Badge tone="warning">
                            <User2 className="mr-1 inline h-2.5 w-2.5" />
                            {t("catalog.personalized")}
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-[color:var(--color-mase-text)]">
                        {e.descrizione}
                      </p>
                      {e.isUser && (
                        <p className="mt-0.5 text-[10px] text-[color:var(--color-mase-text-subtle)]">
                          {t("catalog.savedOn")}{" "}
                          {new Date(e.addedAt).toLocaleDateString(locale === "en" ? "en-GB" : "it-IT")}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        variant="ghost"
                        onClick={() => handleCopy(e.codice)}
                        className="px-2.5 py-1.5 text-xs"
                        aria-label={`${t("catalog.copy")} ${e.codice}`}
                      >
                        {copied ? (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            {t("catalog.copied")}
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            {t("catalog.copy")}
                          </>
                        )}
                      </Button>
                      {e.isUser && (
                        <button
                          onClick={() => handleRemove(e.codice)}
                          className={`inline-flex items-center gap-1 rounded-xl border px-2.5 py-1.5 text-xs transition-colors ${
                            isConfirming
                              ? "border-[color:var(--color-mase-err)] bg-[color:var(--color-mase-err-soft)] text-[color:var(--color-mase-err)]"
                              : "border-[color:var(--color-mase-border)] text-[color:var(--color-mase-text-muted)] hover:border-[color:var(--color-mase-err)]/40 hover:text-[color:var(--color-mase-err)]"
                          }`}
                          aria-label={`${t("catalog.remove")} ${e.codice}`}
                          title={isConfirming ? t("catalog.confirmHint") : t("catalog.remove")}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {isConfirming ? t("catalog.confirm") : ""}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
