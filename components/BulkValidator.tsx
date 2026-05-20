"use client";

import { useMemo, useState, useRef } from "react";
import {
  FolderOpen,
  FileSpreadsheet,
  FileText,
  Search,
  Filter,
  Download,
  CircleCheck,
  CircleX,
  AlertTriangle,
  X,
  Upload,
} from "lucide-react";
import * as XLSX from "xlsx";
import { validaCodiceCompleto, type ValidationResult } from "@/lib/validator";
import { Card, Input, Badge, Button } from "./ui-primitives";
import { useAppState } from "@/lib/useAppState";

type InputMode = "folder" | "excel" | "csv";

type BulkResult = {
  /** Identificatore (nome file o riga) */
  source: string;
  /** Codice estratto */
  codice: string;
  /** Esito della validazione */
  validation: ValidationResult;
};

type SummaryStats = {
  total: number;
  ok: number;
  warning: number;
  error: number;
};

/**
 * Rimuove l'estensione e il path dal nome file.
 * Es. "docs/RMB1284-ADD-RELGENERA-XX-RT-Z-PD0001.pdf" -> "RMB1284-ADD-RELGENERA-XX-RT-Z-PD0001"
 */
function extractCodeFromFilename(fullName: string): string {
  // Rimuovi il path (gestisce sia / che \)
  const parts = fullName.split(/[/\\]/);
  const fileName = parts[parts.length - 1];
  // Rimuovi l'estensione (l'ultima dopo il punto)
  const dotIdx = fileName.lastIndexOf(".");
  return dotIdx > 0 ? fileName.substring(0, dotIdx) : fileName;
}

export function BulkValidator() {
  const { t } = useAppState();
  const [mode, setMode] = useState<InputMode>("folder");
  const [results, setResults] = useState<BulkResult[] | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "ok" | "warning" | "error">("all");
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [excelSheets, setExcelSheets] = useState<string[] | null>(null);
  const [excelData, setExcelData] = useState<{ workbook: XLSX.WorkBook; fileName: string } | null>(
    null
  );
  const [selectedSheet, setSelectedSheet] = useState<string>("");
  const [selectedColumn, setSelectedColumn] = useState<number>(0);
  const [excelPreview, setExcelPreview] = useState<string[][] | null>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const summary: SummaryStats = useMemo(() => {
    if (!results) return { total: 0, ok: 0, warning: 0, error: 0 };
    return results.reduce(
      (acc, r) => {
        acc.total++;
        const hasError = r.validation.campi.some(
          (c) => c.status === "error" || c.status === "empty"
        );
        const hasWarning = r.validation.campi.some((c) => c.status === "warning");
        if (hasError) acc.error++;
        else if (hasWarning) acc.warning++;
        else acc.ok++;
        return acc;
      },
      { total: 0, ok: 0, warning: 0, error: 0 }
    );
  }, [results]);

  const filteredResults = useMemo(() => {
    if (!results) return [];
    const q = search.trim().toLowerCase();
    return results.filter((r) => {
      // Filtro per status
      if (statusFilter !== "all") {
        const hasError = r.validation.campi.some(
          (c) => c.status === "error" || c.status === "empty"
        );
        const hasWarning = r.validation.campi.some((c) => c.status === "warning");
        if (statusFilter === "error" && !hasError) return false;
        if (statusFilter === "warning" && (hasError || !hasWarning)) return false;
        if (statusFilter === "ok" && (hasError || hasWarning)) return false;
      }
      // Filtro testuale
      if (q && !r.source.toLowerCase().includes(q) && !r.codice.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [results, statusFilter, search]);

  function reset() {
    setResults(null);
    setError(null);
    setSearch("");
    setStatusFilter("all");
    setExcelSheets(null);
    setExcelData(null);
    setSelectedSheet("");
    setSelectedColumn(0);
    setExcelPreview(null);
    if (folderInputRef.current) folderInputRef.current.value = "";
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleFolderSelect(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;
    // Limite difensivo: cartelle troppo grandi bloccherebbero il main thread
    const MAX_FILES = 5000;
    if (files.length > MAX_FILES) {
      setError(
        `Troppi file selezionati (${files.length}). Limite: ${MAX_FILES}. Suddividi in più cartelle.`
      );
      if (folderInputRef.current) folderInputRef.current.value = "";
      return;
    }
    setIsProcessing(true);
    // Estrai tutti i nomi file (unici)
    const codiciVisti = new Set<string>();
    const out: BulkResult[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const codice = extractCodeFromFilename(f.name);
      if (codiciVisti.has(codice)) continue;
      codiciVisti.add(codice);
      out.push({
        source: f.webkitRelativePath || f.name,
        codice,
        validation: validaCodiceCompleto(codice),
      });
    }
    setResults(out);
    setIsProcessing(false);
  }

  function handleSpreadsheetSelect(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheets = workbook.SheetNames;
        if (sheets.length === 0) {
          throw new Error("Il file non contiene fogli.");
        }
        setExcelData({ workbook, fileName: file.name });
        setExcelSheets(sheets);
        setSelectedSheet(sheets[0]);
        // Carica preview prima foglio
        loadSheetPreview(workbook, sheets[0]);
      } catch (err) {
        setError(
          err instanceof Error
            ? `Impossibile leggere il file: ${err.message}`
            : "Errore sconosciuto nella lettura del file."
        );
      }
      setIsProcessing(false);
    };
    reader.onerror = () => {
      setError("Errore nella lettura del file.");
      setIsProcessing(false);
    };
    reader.readAsArrayBuffer(file);
  }

  function loadSheetPreview(workbook: XLSX.WorkBook, sheetName: string) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) return;
    const rows = XLSX.utils.sheet_to_json<string[]>(sheet, {
      header: 1,
      blankrows: false,
      defval: "",
    });
    // Mostriamo solo le prime 5 righe per la preview
    const stringRows: string[][] = rows.slice(0, 5).map((r) =>
      Array.isArray(r) ? r.map((cell) => String(cell)) : []
    );
    setExcelPreview(stringRows);
    setSelectedColumn(0);
  }

  function handleSheetChange(sheetName: string) {
    setSelectedSheet(sheetName);
    if (excelData) loadSheetPreview(excelData.workbook, sheetName);
  }

  function processSpreadsheet() {
    if (!excelData || !selectedSheet) return;
    setIsProcessing(true);
    try {
      const sheet = excelData.workbook.Sheets[selectedSheet];
      const rows = XLSX.utils.sheet_to_json<string[]>(sheet, {
        header: 1,
        blankrows: false,
        defval: "",
      });
      const codiciVisti = new Set<string>();
      const out: BulkResult[] = [];
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (!Array.isArray(row)) continue;
        const raw = row[selectedColumn];
        if (raw === undefined || raw === null) continue;
        const cellValue = String(raw).trim();
        if (!cellValue) continue;
        // Salta gli header (riga 1) se è chiaramente un'intestazione
        if (i === 0 && !cellValue.includes("-")) continue;
        const codice = extractCodeFromFilename(cellValue);
        if (codiciVisti.has(codice)) continue;
        codiciVisti.add(codice);
        out.push({
          source: `${selectedSheet} - ${t("bulk.row")} ${i + 1}`,
          codice,
          validation: validaCodiceCompleto(codice),
        });
      }
      setResults(out);
      setExcelSheets(null);
      setExcelData(null);
      setExcelPreview(null);
    } catch (err) {
      setError(
        err instanceof Error ? `Errore: ${err.message}` : "Errore durante l'elaborazione."
      );
    }
    setIsProcessing(false);
  }

  function exportResultsCSV() {
    if (!results) return;
    const header = ["Sorgente", "Codice", "Esito", "Errori", "Note catalogo"];
    const rows = results.map((r) => {
      const hasError = r.validation.campi.some(
        (c) => c.status === "error" || c.status === "empty"
      );
      const hasWarning = r.validation.campi.some((c) => c.status === "warning");
      const esito = hasError ? "ERRORE" : hasWarning ? "WARNING" : "OK";
      const errori = r.validation.campi
        .filter((c) => c.status === "error" || c.status === "empty" || c.status === "warning")
        .map((c) => `C${c.campo}:${c.messaggio}`)
        .join(" | ");
      const note = r.validation.inCatalogo
        ? `In catalogo: ${r.validation.descrizioneCatalogo}`
        : r.validation.valid
        ? "Valido ma fuori catalogo ufficiale"
        : "";
      return [r.source, r.codice, esito, errori, note];
    });

    // CSV-escape
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(";"))
      .join("\r\n");

    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `verifica-bulk-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      {/* Input mode tabs */}
      <Card>
        <h3 className="mb-3 flex items-center gap-2 text-base font-semibold">
          <Upload className="h-4 w-4 text-[color:var(--color-mase-primary)]" />
          {t("bulk.title")}
        </h3>
        <p className="mb-4 text-sm text-[color:var(--color-mase-text-muted)]">
          {t("bulk.intro")}
        </p>

        <div className="mb-4 grid grid-cols-3 gap-2">
          {[
            { key: "folder" as const, label: t("bulk.mode.folder"), icon: FolderOpen, sub: t("bulk.mode.folder.sub") },
            { key: "excel" as const, label: t("bulk.mode.excel"), icon: FileSpreadsheet, sub: t("bulk.mode.excel.sub") },
            { key: "csv" as const, label: t("bulk.mode.csv"), icon: FileText, sub: t("bulk.mode.csv.sub") },
          ].map((m) => {
            const Icon = m.icon;
            const active = mode === m.key;
            return (
              <button
                key={m.key}
                onClick={() => {
                  setMode(m.key);
                  reset();
                }}
                className={`flex flex-col items-start gap-1 rounded-xl border px-3 py-3 text-left transition-colors ${
                  active
                    ? "border-[color:var(--color-mase-primary)] bg-[color:var(--color-mase-primary-soft)]"
                    : "border-[color:var(--color-mase-border)] bg-[color:var(--color-mase-surface-elevated)] hover:border-[color:var(--color-mase-primary)]/40"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon
                    className={`h-4 w-4 ${
                      active
                        ? "text-[color:var(--color-mase-primary)]"
                        : "text-[color:var(--color-mase-text-muted)]"
                    }`}
                  />
                  <span className="text-sm font-medium">{m.label}</span>
                </div>
                <span className="text-[10px] text-[color:var(--color-mase-text-muted)]">
                  {m.sub}
                </span>
              </button>
            );
          })}
        </div>

        {/* Folder input */}
        {mode === "folder" && (
          <>
            <input
              ref={folderInputRef}
              type="file"
              /* @ts-expect-error webkitdirectory non è ufficialmente tipizzato in React */
              webkitdirectory=""
              directory=""
              multiple
              onChange={handleFolderSelect}
              className="hidden"
              id="folder-input"
            />
            <label
              htmlFor="folder-input"
              className="block cursor-pointer rounded-xl border-2 border-dashed border-[color:var(--color-mase-border-strong)] bg-[color:var(--color-mase-surface-elevated)] px-4 py-8 text-center transition-colors hover:border-[color:var(--color-mase-primary)] hover:bg-[color:var(--color-mase-primary-soft)]"
            >
              <FolderOpen className="mx-auto mb-2 h-8 w-8 text-[color:var(--color-mase-text-muted)]" />
              <p className="text-sm font-medium text-[color:var(--color-mase-text)]">
                {t("bulk.folder.cta")}
              </p>
              <p className="mt-1 text-xs text-[color:var(--color-mase-text-muted)]">
                {t("bulk.folder.hint")}
                <br />
                {t("bulk.privacy")}
              </p>
            </label>
          </>
        )}

        {/* Excel/CSV input */}
        {(mode === "excel" || mode === "csv") && !excelSheets && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept={mode === "excel" ? ".xlsx,.xls,.xlsm" : ".csv,.txt"}
              onChange={handleSpreadsheetSelect}
              className="hidden"
              id="file-input"
            />
            <label
              htmlFor="file-input"
              className="block cursor-pointer rounded-xl border-2 border-dashed border-[color:var(--color-mase-border-strong)] bg-[color:var(--color-mase-surface-elevated)] px-4 py-8 text-center transition-colors hover:border-[color:var(--color-mase-primary)] hover:bg-[color:var(--color-mase-primary-soft)]"
            >
              {mode === "excel" ? (
                <FileSpreadsheet className="mx-auto mb-2 h-8 w-8 text-[color:var(--color-mase-text-muted)]" />
              ) : (
                <FileText className="mx-auto mb-2 h-8 w-8 text-[color:var(--color-mase-text-muted)]" />
              )}
              <p className="text-sm font-medium text-[color:var(--color-mase-text)]">
                {t("bulk.file.cta")} {mode === "excel" ? ".xlsx / .xls" : ".csv"}
              </p>
              <p className="mt-1 text-xs text-[color:var(--color-mase-text-muted)]">
                {t("bulk.file.hint")}
              </p>
            </label>
          </>
        )}

        {/* Excel: sheet/column selection */}
        {excelSheets && excelData && excelPreview && (
          <div className="space-y-3 rounded-xl border border-[color:var(--color-mase-border)] bg-[color:var(--color-mase-surface-elevated)] p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm">
                <strong>{excelData.fileName}</strong>
              </p>
              <button
                onClick={reset}
                className="text-xs text-[color:var(--color-mase-text-muted)] hover:text-[color:var(--color-mase-err)]"
              >
                <X className="inline h-3.5 w-3.5" /> {t("bulk.cancel")}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-[color:var(--color-mase-text-muted)]">
                  {t("bulk.sheet")}
                </label>
                <select
                  value={selectedSheet}
                  onChange={(e) => handleSheetChange(e.target.value)}
                  className="w-full rounded-xl border border-[color:var(--color-mase-border)] bg-[color:var(--color-mase-surface)] px-3 py-2 text-sm"
                >
                  {excelSheets.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[color:var(--color-mase-text-muted)]">
                  {t("bulk.column")}
                </label>
                <select
                  value={selectedColumn}
                  onChange={(e) => setSelectedColumn(Number(e.target.value))}
                  className="w-full rounded-xl border border-[color:var(--color-mase-border)] bg-[color:var(--color-mase-surface)] px-3 py-2 text-sm"
                >
                  {excelPreview[0]?.map((_, idx) => (
                    <option key={idx} value={idx}>
                      {t("bulk.column.label")} {String.fromCharCode(65 + idx)} ({idx + 1})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Preview */}
            <div>
              <p className="mb-1 text-xs font-medium text-[color:var(--color-mase-text-muted)]">
                {t("bulk.preview")}
              </p>
              <div className="overflow-x-auto rounded-lg border border-[color:var(--color-mase-border)] bg-[color:var(--color-mase-surface)]">
                <table className="w-full text-xs">
                  <tbody>
                    {excelPreview.map((row, i) => (
                      <tr
                        key={i}
                        className="border-b border-[color:var(--color-mase-border)]/40 last:border-0"
                      >
                        {row.map((cell, j) => (
                          <td
                            key={j}
                            className={`px-2 py-1.5 font-mono ${
                              j === selectedColumn
                                ? "bg-[color:var(--color-mase-primary-soft)] font-semibold text-[color:var(--color-mase-primary)]"
                                : "text-[color:var(--color-mase-text-muted)]"
                            }`}
                          >
                            {cell.length > 50 ? cell.substring(0, 50) + "..." : cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <Button onClick={processSpreadsheet} variant="primary" className="w-full">
              <Search className="h-4 w-4" /> {t("bulk.analyze")}
            </Button>
          </div>
        )}

        {error && (
          <div className="mt-3 rounded-lg border border-[color:var(--color-mase-err)]/40 bg-[color:var(--color-mase-err-soft)] px-3 py-2 text-sm text-[color:var(--color-mase-err)]">
            {error}
          </div>
        )}
        {isProcessing && (
          <p className="mt-3 text-sm text-[color:var(--color-mase-text-muted)]">
            {t("bulk.processing")}
          </p>
        )}
      </Card>

      {/* Summary + Results */}
      {results && (
        <>
          <Card>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="mb-2 text-base font-semibold">
                  {t("bulk.summary.title")} — {summary.total} {t("bulk.summary.analyzed")}
                </h3>
                <div className="flex flex-wrap gap-2 text-sm">
                  <Badge tone="ok">
                    <CircleCheck className="mr-1 inline h-3 w-3" /> {summary.ok} OK
                  </Badge>
                  <Badge tone="warning">
                    <AlertTriangle className="mr-1 inline h-3 w-3" /> {summary.warning} warning
                  </Badge>
                  <Badge tone="error">
                    <CircleX className="mr-1 inline h-3 w-3" /> {summary.error} {t("validator.summary.errors")}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={exportResultsCSV} variant="ghost">
                  <Download className="h-4 w-4" /> {t("bulk.export")}
                </Button>
                <Button onClick={reset} variant="ghost">
                  <X className="h-4 w-4" /> {t("bulk.new")}
                </Button>
              </div>
            </div>
          </Card>

          {/* Filters */}
          <Card>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_220px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-mase-text-muted)]" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("bulk.filter.search")}
                  className="pl-9"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as "all" | "ok" | "warning" | "error")
                }
                className="w-full rounded-xl border border-[color:var(--color-mase-border)] bg-[color:var(--color-mase-surface-elevated)] px-3 py-2.5 text-sm"
              >
                <option value="all">{t("bulk.filter.all")}</option>
                <option value="ok">{t("bulk.filter.ok")} ({summary.ok})</option>
                <option value="warning">{t("bulk.filter.warning")} ({summary.warning})</option>
                <option value="error">{t("bulk.filter.error")} ({summary.error})</option>
              </select>
            </div>
          </Card>

          {/* Results table */}
          <Card className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-[color:var(--color-mase-border)] text-left text-xs uppercase tracking-wider text-[color:var(--color-mase-text-muted)]">
                  <tr>
                    <th className="px-3 py-3 font-medium w-12">{t("bulk.table.esito")}</th>
                    <th className="px-3 py-3 font-medium">{t("bulk.table.codice")}</th>
                    <th className="px-3 py-3 font-medium">{t("bulk.table.sorgente")}</th>
                    <th className="px-3 py-3 font-medium">{t("bulk.table.note")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-8 text-center text-sm text-[color:var(--color-mase-text-muted)]"
                      >
                        {search || statusFilter !== "all"
                          ? t("bulk.table.noResults")
                          : t("bulk.table.empty")}
                      </td>
                    </tr>
                  ) : (
                    filteredResults.map((r) => {
                      const hasError = r.validation.campi.some(
                        (c) => c.status === "error" || c.status === "empty"
                      );
                      const hasWarning = r.validation.campi.some(
                        (c) => c.status === "warning"
                      );
                      const tone = hasError ? "error" : hasWarning ? "warning" : "ok";
                      const Icon = hasError
                        ? CircleX
                        : hasWarning
                        ? AlertTriangle
                        : CircleCheck;
                      const issues = r.validation.campi
                        .filter(
                          (c) =>
                            c.status === "error" ||
                            c.status === "empty" ||
                            c.status === "warning"
                        )
                        .slice(0, 3);
                      return (
                        <tr
                          key={`${r.source}|${r.codice}`}
                          className="border-b border-[color:var(--color-mase-border)]/40 last:border-0 align-top hover:bg-[color:var(--color-mase-surface-elevated)]/50"
                        >
                          <td className="px-3 py-2.5">
                            <Icon
                              className={`h-4 w-4 ${
                                tone === "error"
                                  ? "text-[color:var(--color-mase-err)]"
                                  : tone === "warning"
                                  ? "text-[color:var(--color-mase-warn)]"
                                  : "text-[color:var(--color-mase-ok)]"
                              }`}
                            />
                          </td>
                          <td className="px-3 py-2.5">
                            <code className="block break-all font-mono text-xs text-[color:var(--color-mase-text)]">
                              {r.codice}
                            </code>
                          </td>
                          <td className="px-3 py-2.5 break-all text-xs text-[color:var(--color-mase-text-muted)]">
                            {r.source}
                          </td>
                          <td className="px-3 py-2.5 text-xs">
                            {r.validation.inCatalogo && (
                              <div className="mb-1 text-[color:var(--color-mase-ok)]">
                                ✓ {t("bulk.inCatalog")} {r.validation.descrizioneCatalogo}
                              </div>
                            )}
                            {!r.validation.inCatalogo && r.validation.valid && (
                              <div className="mb-1 text-[color:var(--color-mase-text-muted)]">
                                {t("bulk.validButOutCatalog")}
                              </div>
                            )}
                            {issues.length > 0 && (
                              <ul className="space-y-0.5">
                                {issues.map((c, i) => (
                                  <li
                                    key={i}
                                    className={
                                      c.status === "error" || c.status === "empty"
                                        ? "text-[color:var(--color-mase-err)]"
                                        : "text-[color:var(--color-mase-warn)]"
                                    }
                                  >
                                    <strong>C{c.campo}</strong>: {c.messaggio}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            {filteredResults.length > 0 && filteredResults.length < (results?.length || 0) && (
              <div className="border-t border-[color:var(--color-mase-border)] bg-[color:var(--color-mase-surface-elevated)] px-4 py-2 text-xs text-[color:var(--color-mase-text-muted)]">
                <Filter className="mr-1 inline h-3 w-3" />
                {t("bulk.table.shown")} {filteredResults.length} {t("bulk.table.of")} {results?.length} {t("bulk.table.results")}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
