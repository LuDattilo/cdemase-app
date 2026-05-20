"use client";

import { useMemo, useState } from "react";
import { Copy, Check, AlertCircle, CircleCheck, Wand2, BookmarkPlus, BookmarkCheck, Lock } from "lucide-react";
import {
  CODICI_DOCUMENTO,
  LIVELLI,
  TIPI_FILE,
  DISCIPLINE,
  SERVIZI,
  STATI,
  CODICE_BENE_DEFAULT,
  CODICE_AGENZIA_DEFAULT,
  CATALOGO_ELABORATI,
  findInCatalogo,
} from "@/lib/codifica-data";
import {
  componiCodice,
  validaInputStrutturato,
  type CodificaInput,
  type FieldStatus,
} from "@/lib/validator";
import { addToUserCatalog, getUserCatalog } from "@/lib/userCatalog";
import { useAppState } from "@/lib/useAppState";
import {
  Card,
  FieldLabel,
  Select,
  Input,
  Button,
  Badge,
  Divider,
} from "./ui-primitives";

const TONE: Record<FieldStatus, "ok" | "warning" | "error" | "neutral"> = {
  ok: "ok",
  warning: "warning",
  error: "error",
  empty: "neutral",
};

export function Generator() {
  const { t } = useAppState();
  const [input, setInput] = useState<CodificaInput>({
    codiceBene: CODICE_BENE_DEFAULT,
    codiceAgenzia: CODICE_AGENZIA_DEFAULT,
    codiceDocumento: "",
    livello: "XX",
    tipoFile: "",
    disciplina: "Z",
    servizio: "P",
    stato: "D", // default per MASE: progetto Demolizioni
    cifraFase: "0",
    bloccoFunzionale: "00",
    progressivo: "01",
  });
  const [copied, setCopied] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saved" | "duplicate" | "official">("idle");
  const [descrizionePersonalizzata, setDescrizionePersonalizzata] = useState("");

  const docEntry = useMemo(
    () => CODICI_DOCUMENTO.find((d) => d.code === input.codiceDocumento),
    [input.codiceDocumento]
  );

  // Auto-set del tipo file quando l'utente sceglie un Codice Documento noto
  function handleDocumentoChange(value: string) {
    const entry = CODICI_DOCUMENTO.find((d) => d.code === value);
    setInput((s) => ({
      ...s,
      codiceDocumento: value,
      tipoFile: entry?.meta?.tipo ?? s.tipoFile,
    }));
  }

  const codice = componiCodice(input);
  const validation = validaInputStrutturato(input);

  function copyCodice() {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(codice).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  function salvaNelCatalogo() {
    // 1. Già nel catalogo ufficiale? — non duplichiamo
    if (findInCatalogo(codice)) {
      setSaveState("official");
      setTimeout(() => setSaveState("idle"), 2400);
      return;
    }

    // 2. Già nel catalogo personale?
    const userCat = getUserCatalog();
    if (userCat.some((e) => e.codice.toUpperCase() === codice.toUpperCase())) {
      setSaveState("duplicate");
      setTimeout(() => setSaveState("idle"), 2400);
      return;
    }

    // 3. Salva: descrizione = quella inserita dall'utente, altrimenti quella del codice documento
    const descr =
      descrizionePersonalizzata.trim() ||
      docEntry?.description ||
      "(senza descrizione)";

    const result = addToUserCatalog({
      codice,
      descrizione: descr,
      gruppo: "I miei codici",
    });

    if (result) {
      setSaveState("saved");
      setDescrizionePersonalizzata("");
      setTimeout(() => setSaveState("idle"), 2400);
    }
  }

  // Il bottone Salva è abilitato solo se la validazione è OK
  const canSave = validation.valid;

  return (
    <div className="space-y-5">
      {/* Anteprima codice generato */}
      <Card className="border-[color:var(--color-mase-primary)]/40 bg-[color:var(--color-mase-primary-soft)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-[color:var(--color-mase-text-muted)]">
                {t("generator.preview.label")}
              </span>
              {validation.valid ? (
                <Badge tone="ok">
                  <CircleCheck className="mr-1 inline h-3 w-3" /> {t("generator.preview.valid")}
                </Badge>
              ) : (
                <Badge tone="warning">
                  <AlertCircle className="mr-1 inline h-3 w-3" /> {t("generator.preview.incomplete")}
                </Badge>
              )}
            </div>
            <div className="break-all font-mono text-lg font-semibold text-[color:var(--color-mase-text)] sm:text-xl">
              {codice}
            </div>
            {docEntry && (
              <p className="mt-1.5 text-sm text-[color:var(--color-mase-text-muted)]">
                {docEntry.description}
                {docEntry.meta?.formati && (
                  <span className="ml-2 text-xs">
                    · {t("generator.formats")}: {docEntry.meta.formati}
                  </span>
                )}
              </p>
            )}
          </div>
          <div className="flex shrink-0 gap-2">
            <Button onClick={copyCodice} variant="ghost">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? t("generator.copied") : t("generator.copy")}
            </Button>
            <Button onClick={salvaNelCatalogo} variant="primary" disabled={!canSave}>
              {saveState === "saved" ? (
                <BookmarkCheck className="h-4 w-4" />
              ) : (
                <BookmarkPlus className="h-4 w-4" />
              )}
              {saveState === "saved"
                ? t("generator.saved")
                : saveState === "duplicate"
                ? t("generator.duplicate")
                : saveState === "official"
                ? t("generator.official")
                : t("generator.save")}
            </Button>
          </div>
        </div>

        {/* Descrizione personalizzata (opzionale, visibile solo se valido) */}
        {canSave && (
          <div className="mt-4 border-t border-[color:var(--color-mase-primary)]/20 pt-3">
            <label className="mb-1.5 block text-xs font-medium text-[color:var(--color-mase-text-muted)]">
              {t("generator.descrizione.label")}
            </label>
            <Input
              value={descrizionePersonalizzata}
              onChange={(e) => setDescrizionePersonalizzata(e.target.value)}
              placeholder={
                docEntry
                  ? `Default: ${docEntry.description.substring(0, 60)}${
                      docEntry.description.length > 60 ? "..." : ""
                    }`
                  : t("generator.descrizione.placeholderFallback")
              }
            />
            {saveState === "duplicate" && (
              <p className="mt-2 text-xs text-[color:var(--color-mase-warn)]">
                {t("generator.dup.user")}
              </p>
            )}
            {saveState === "official" && (
              <p className="mt-2 text-xs text-[color:var(--color-mase-primary)]">
                {t("generator.dup.official")}
              </p>
            )}
          </div>
        )}
      </Card>

      {/* Form di composizione */}
      <Card>
        <h3 className="mb-4 flex items-center gap-2 text-base font-semibold">
          <Wand2 className="h-4 w-4 text-[color:var(--color-mase-primary)]" />
          {t("generator.title")}
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <FieldLabel index={1} title={t("field.codiceBene")} description={t("field.codiceBene.hint")} required />
            <div className="relative">
              <Input
                monospace
                value={input.codiceBene}
                readOnly
                tabIndex={-1}
                aria-readonly="true"
                className="cursor-not-allowed bg-[color:var(--color-mase-surface)] pr-9 text-[color:var(--color-mase-text-muted)]"
                title={t("field.fixedForProject")}
              />
              <Lock
                className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[color:var(--color-mase-text-subtle)]"
                aria-hidden="true"
              />
            </div>
          </div>
          <div>
            <FieldLabel index={2} title={t("field.codiceAgenzia")} description={t("field.codiceAgenzia.hint")} required />
            <div className="relative">
              <Input
                monospace
                value={input.codiceAgenzia}
                readOnly
                tabIndex={-1}
                aria-readonly="true"
                className="cursor-not-allowed bg-[color:var(--color-mase-surface)] pr-9 text-[color:var(--color-mase-text-muted)]"
                title={t("field.fixedForProject")}
              />
              <Lock
                className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[color:var(--color-mase-text-subtle)]"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>

        <Divider label={t("generator.section.identification")} />

        <div className="grid grid-cols-1 gap-4">
          <div>
            <FieldLabel
              index={3}
              title={t("field.codiceDocumento")}
              description={t("field.codiceDocumento.hint")}
              required
            />
            <Select
              value={input.codiceDocumento}
              onChange={(e) => handleDocumentoChange(e.target.value)}
              placeholder={t("field.codiceDocumento.placeholder")}
              options={CODICI_DOCUMENTO.map((d) => ({
                value: d.code,
                label: `${d.code}  —  ${d.description}`,
              }))}
            />
            {docEntry?.meta?.fasi && (
              <p className="mt-1.5 text-xs text-[color:var(--color-mase-text-muted)]">
                {t("generator.fasiPreviste")}: <span className="font-mono">{docEntry.meta.fasi}</span>
              </p>
            )}
          </div>
        </div>

        <Divider label={t("generator.section.characteristics")} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <FieldLabel index={4} title={t("field.livello")} description="Tab. 13" required />
            <Select
              value={input.livello}
              onChange={(e) => setInput((s) => ({ ...s, livello: e.target.value }))}
              options={LIVELLI.map((l) => ({
                value: l.code,
                label: `${l.code} — ${l.description}`,
              }))}
            />
          </div>
          <div>
            <FieldLabel index={5} title={t("field.tipoFile")} description="Tab. 14" required />
            <Select
              value={input.tipoFile}
              onChange={(e) => setInput((s) => ({ ...s, tipoFile: e.target.value }))}
              placeholder={t("field.tipoFile.placeholder")}
              options={TIPI_FILE.map((tp) => ({
                value: tp.code,
                label: `${tp.code} — ${tp.description}`,
              }))}
            />
          </div>
          <div>
            <FieldLabel index={6} title={t("field.disciplina")} description="Tab. 15" required />
            <Select
              value={input.disciplina}
              onChange={(e) => setInput((s) => ({ ...s, disciplina: e.target.value }))}
              options={DISCIPLINE.map((d) => ({
                value: d.code,
                label: `${d.code} — ${d.description}`,
              }))}
            />
          </div>
        </div>

        <Divider label={t("generator.section.codiceElaborato")} />

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <div>
            <FieldLabel index={7} subindex="a" title={t("field.servizio")} description={t("field.servizio.hint")} required />
            <Select
              value={input.servizio}
              onChange={(e) => setInput((s) => ({ ...s, servizio: e.target.value }))}
              options={SERVIZI.map((sv) => ({
                value: sv.code,
                label: `${sv.code} — ${sv.description}`,
              }))}
            />
          </div>
          <div>
            <FieldLabel index={7} subindex="b" title="Stato" description="opzionale" />
            <Select
              value={input.stato}
              onChange={(e) => setInput((s) => ({ ...s, stato: e.target.value }))}
              placeholder="— Nessuno (6 char) —"
              options={STATI.map((st) => ({
                value: st.code,
                label: `${st.code} — ${st.description}`,
              }))}
            />
          </div>
          <div>
            <FieldLabel index={7} subindex="c" title={t("field.fase")} description={t("field.fase.hint")} required />
            <Input
              monospace
              value={input.cifraFase}
              maxLength={1}
              onChange={(e) =>
                setInput((s) => ({
                  ...s,
                  cifraFase: e.target.value.replace(/\D/g, "").slice(0, 1),
                }))
              }
              placeholder="0"
            />
          </div>
          <div>
            <FieldLabel index={7} subindex="d" title={t("field.bloccoFunz")} description={t("field.bloccoFunz.hint")} required />
            <Input
              monospace
              value={input.bloccoFunzionale}
              maxLength={2}
              onChange={(e) =>
                setInput((s) => ({
                  ...s,
                  bloccoFunzionale: e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 2)
                    .padStart(2, "0"),
                }))
              }
              placeholder="00"
            />
          </div>
          <div>
            <FieldLabel index={7} subindex="e" title={t("field.progressivo")} description={t("field.progressivo.hint")} required />
            <Input
              monospace
              value={input.progressivo}
              maxLength={2}
              onChange={(e) =>
                setInput((s) => ({
                  ...s,
                  progressivo: e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 2)
                    .padStart(2, "0"),
                }))
              }
              placeholder="01"
            />
          </div>
        </div>
      </Card>

      {/* Diagnostica per campo */}
      <Card>
        <h3 className="mb-3 text-base font-semibold">{t("generator.diagnostics")}</h3>
        <div className="space-y-2">
          {validation.campi.map((f) => (
            <div
              key={f.campo}
              className="flex items-start justify-between gap-3 rounded-lg border border-[color:var(--color-mase-border)]/60 bg-[color:var(--color-mase-surface-elevated)]/60 px-3 py-2"
            >
              <div className="flex min-w-0 items-start gap-2">
                <Badge tone={TONE[f.status]}>{`C${f.campo}`}</Badge>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-[color:var(--color-mase-text)]">
                    {f.nome}
                    {f.valore && (
                      <span className="ml-2 font-mono text-xs text-[color:var(--color-mase-text-muted)]">
                        {f.valore}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[color:var(--color-mase-text-muted)]">
                    {f.messaggio}
                    {f.suggerimento && (
                      <span className="ml-1 text-[color:var(--color-mase-primary)]">
                        → {f.suggerimento}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
