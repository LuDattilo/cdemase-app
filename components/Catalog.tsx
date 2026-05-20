"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Library, Search, Copy, Check, Trash2, User2,
  Download, CheckSquare, Square, Eye,
} from "lucide-react";
import {
  CATALOGO_ELABORATI,
  CATALOGO_GRUPPI,
  type CatalogoEntry,
} from "@/lib/codifica-data";
import {
  getUserCatalog,
  removeFromUserCatalog,
  removeManyFromUserCatalog,
  hideCodes,
  getHiddenCodes,
  restoreHiddenCodes,
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
  const [hiddenCodes, setHiddenCodes] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const confirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Multi-selezione
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmBulk, setConfirmBulk] = useState(false);
  const confirmBulkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setUserCatalog(getUserCatalog());
    setHiddenCodes(getHiddenCodes());
    const unsubscribe = subscribeUserCatalog(() => {
      setUserCatalog(getUserCatalog());
      setHiddenCodes(getHiddenCodes());
    });
    return () => {
      unsubscribe();
      if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
      if (confirmBulkTimerRef.current) clearTimeout(confirmBulkTimerRef.current);
    };
  }, []);

  const allEntries: UnifiedEntry[] = useMemo(() => {
    const official: UnifiedEntry[] = CATALOGO_ELABORATI
      .filter((e) => !hiddenCodes.has(e.codice.toUpperCase()))
      .map((e) => ({ ...e, isUser: false }));
    const user: UnifiedEntry[] = userCatalog.map((e) => ({ ...e, isUser: true }));
    return [...user, ...official];
  }, [userCatalog, hiddenCodes]);

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

  const gruppiDisponibili = useMemo(() => {
    const set = new Set<string>(
      CATALOGO_GRUPPI.filter((g) =>
        CATALOGO_ELABORATI.some(
          (e) => e.gruppo === g && !hiddenCodes.has(e.codice.toUpperCase())
        )
      )
    );
    userCatalog.forEach((e) => set.add(e.gruppo));
    return Array.from(set);
  }, [userCatalog, hiddenCodes]);

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

  function enterSelectMode() {
    setSelectMode(true);
    setSelected(new Set());
    setConfirmBulk(false);
  }

  function exitSelectMode() {
    setSelectMode(false);
    setSelected(new Set());
    setConfirmBulk(false);
    if (confirmBulkTimerRef.current) {
      clearTimeout(confirmBulkTimerRef.current);
      confirmBulkTimerRef.current = null;
    }
  }

  function toggleSelect(codice: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(codice)) next.delete(codice);
      else next.add(codice);
      return next;
    });
    setConfirmBulk(false);
  }

  function selectAll() {
    // Seleziona tutte le entry visibili (sia utente che ufficiali)
    setSelected(new Set(filtered.map((e) => e.codice)));
    setConfirmBulk(false);
  }

  function selectNone() {
    setSelected(new Set());
    setConfirmBulk(false);
  }

  function handleBulkDelete() {
    if (confirmBulkTimerRef.current) {
      clearTimeout(confirmBulkTimerRef.current);
      confirmBulkTimerRef.current = null;
    }
    if (confirmBulk) {
      // Entry utente → rimozione definitiva; entry ufficiali → nascondi
      const userCodes = Array.from(selected).filter((c) =>
        userCatalog.some((e) => e.codice.toUpperCase() === c.toUpperCase())
      );
      const officialCodes = Array.from(selected).filter(
        (c) => !userCatalog.some((e) => e.codice.toUpperCase() === c.toUpperCase())
      );
      if (userCodes.length > 0) removeManyFromUserCatalog(userCodes);
      if (officialCodes.length > 0) hideCodes(officialCodes);
      exitSelectMode();
    } else {
      setConfirmBulk(true);
      confirmBulkTimerRef.current = setTimeout(() => {
        setConfirmBulk(false);
        confirmBulkTimerRef.current = null;
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
  const countHidden = hiddenCodes.size;

  return (
    <div className="space-y-5">
      <Card>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Library className="h-4 w-4 text-[color:var(--color-mase-primary)]" />
          <h3 className="text-base font-semibold">{t("catalog.title")}</h3>
          <div className="ml-auto flex items-center gap-2">
            {/* Ripristina nascosti */}
            {countHidden > 0 && !selectMode && (
              <button
                onClick={() => restoreHiddenCodes()}
                className="inline-flex items-center gap-1 rounded-lg border border-[color:var(--color-mase-warn)]/40 bg-[color:var(--color-mase-warn-soft)] px-3 py-1.5 text-xs font-medium text-[color:var(--color-mase-warn)] transition-colors hover:border-[color:var(--color-mase-warn)]"
                title={`${countHidden} ${t("catalog.hidden.count")}`}
              >
                <Eye className="h-3.5 w-3.5" />
                {t("catalog.hidden.restore")} ({countHidden})
              </button>
            )}

            {!selectMode ? (
              <>
                <button
                  onClick={enterSelectMode}
                  className="inline-flex items-center gap-1 rounded-lg border border-[color:var(--color-mase-border)] bg-[color:var(--color-mase-surface-elevated)] px-3 py-1.5 text-xs font-medium text-[color:var(--color-mase-text-muted)] transition-colors hover:border-[color:var(--color-mase-err)]/40 hover:text-[color:var(--color-mase-err)]"
                >
                  <CheckSquare className="h-3.5 w-3.5" /> {t("catalog.select")}
                </button>
                {countUser > 0 && (
                  <button
                    onClick={handleExport}
                    className="inline-flex items-center gap-1 rounded-lg border border-[color:var(--color-mase-border)] bg-[color:var(--color-mase-surface-elevated)] px-3 py-1.5 text-xs font-medium text-[color:var(--color-mase-text-muted)] transition-colors hover:text-[color:var(--color-mase-text)]"
                    title={t("catalog.backup.title")}
                  >
                    <Download className="h-3.5 w-3.5" /> {t("catalog.backup")}
                  </button>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={selectAll}
                  className="text-xs text-[color:var(--color-mase-primary)] hover:underline"
                >
                  {t("catalog.select.all")}
                </button>
                <span className="text-[color:var(--color-mase-text-subtle)]">·</span>
                <button
                  onClick={selectNone}
                  className="text-xs text-[color:var(--color-mase-text-muted)] hover:underline"
                >
                  {t("catalog.select.none")}
                </button>
                <button
                  onClick={exitSelectMode}
                  className="inline-flex items-center gap-1 rounded-lg border border-[color:var(--color-mase-border)] bg-[color:var(--color-mase-surface-elevated)] px-3 py-1.5 text-xs font-medium text-[color:var(--color-mase-text-muted)] transition-colors hover:text-[color:var(--color-mase-text)]"
                >
                  {t("catalog.select.cancel")}
                </button>
              </div>
            )}
          </div>
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
            {selectMode && selected.size > 0 && (
              <span className="ml-2 font-medium text-[color:var(--color-mase-err)]">
                · {selected.size} {t("catalog.select.count")}
              </span>
            )}
          </span>
          {(query || gruppo !== "__all__") && (
            <button
              onClick={() => { setQuery(""); setGruppo("__all__"); }}
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
                const isSelected = selected.has(e.codice);
                return (
                  <div
                    key={e.codice}
                    onClick={() => selectMode ? toggleSelect(e.codice) : undefined}
                    className={`flex items-start gap-3 px-4 py-3 transition-colors ${
                      selectMode
                        ? isSelected
                          ? "cursor-pointer bg-[color:var(--color-mase-err-soft)]"
                          : "cursor-pointer hover:bg-[color:var(--color-mase-surface-elevated)]"
                        : "hover:bg-[color:var(--color-mase-surface-elevated)]"
                    }`}
                  >
                    {/* Checkbox in modalità selezione */}
                    {selectMode && (
                      <div className="mt-0.5 shrink-0">
                        {isSelected ? (
                          <CheckSquare className="h-4 w-4 text-[color:var(--color-mase-err)]" />
                        ) : (
                          <Square className="h-4 w-4 text-[color:var(--color-mase-text-muted)]" />
                        )}
                      </div>
                    )}
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
                    {/* Azioni singole: visibili solo fuori dalla modalità selezione */}
                    {!selectMode && (
                      <div className="flex shrink-0 gap-1">
                        <Button
                          variant="ghost"
                          onClick={() => handleCopy(e.codice)}
                          className="px-2.5 py-1.5 text-xs"
                          aria-label={`${t("catalog.copy")} ${e.codice}`}
                        >
                          {copied ? (
                            <><Check className="h-3.5 w-3.5" /> {t("catalog.copied")}</>
                          ) : (
                            <><Copy className="h-3.5 w-3.5" /> {t("catalog.copy")}</>
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
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        ))
      )}

      {/* Barra azione bulk — sticky bottom, visibile solo in selectMode con almeno 1 selezionato */}
      {selectMode && selected.size > 0 && (
        <div className="sticky bottom-4 z-20 mx-auto max-w-lg">
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-[color:var(--color-mase-err)]/30 bg-[color:var(--color-mase-surface)] px-4 py-3 shadow-lg ring-1 ring-[color:var(--color-mase-err)]/10">
            <span className="text-sm font-medium text-[color:var(--color-mase-text)]">
              <strong className="text-[color:var(--color-mase-err)]">{selected.size}</strong>{" "}
              {t("catalog.select.count")}
            </span>
            <button
              onClick={handleBulkDelete}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                confirmBulk
                  ? "bg-[color:var(--color-mase-err)] text-white"
                  : "border border-[color:var(--color-mase-err)]/40 text-[color:var(--color-mase-err)] hover:bg-[color:var(--color-mase-err-soft)]"
              }`}
            >
              <Trash2 className="h-4 w-4" />
              {confirmBulk ? t("catalog.select.confirmDelete") : t("catalog.select.delete")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
