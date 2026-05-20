"use client";

import { useMemo, useState } from "react";
import { ShieldCheck, AlertTriangle, CircleX, CircleCheck, BookMarked, FileSearch, Layers } from "lucide-react";
import { validaCodiceCompleto, type FieldStatus } from "@/lib/validator";
import { Card, Input, Badge, Button, FieldLabel } from "./ui-primitives";
import { BulkValidator } from "./BulkValidator";
import { useAppState } from "@/lib/useAppState";

const TONE: Record<FieldStatus, "ok" | "warning" | "error" | "neutral"> = {
  ok: "ok",
  warning: "warning",
  error: "error",
  empty: "neutral",
};

const ESEMPI = [
  "RMB1284-ADD-RELGENERA-XX-RT-Z-PD0001",
  "RMB1284-ADD-PLANLIVEL-GF-DR-A-PD0001",
  "RMB1284-ADD-PLANGEOLO-ZZ-DR-Z-PD0001",
  "RMB1284-ADD-RELTECNIC-XX-RT-M-PD0005",
];

type SubTab = "single" | "bulk";

export function Validator() {
  const { t } = useAppState();
  const [subTab, setSubTab] = useState<SubTab>("single");
  const [valore, setValore] = useState("");
  const result = useMemo(() => validaCodiceCompleto(valore), [valore]);

  const totaleOk = result.campi.filter((c) => c.status === "ok").length;
  const totaleWarn = result.campi.filter((c) => c.status === "warning").length;
  const totaleErr = result.campi.filter(
    (c) => c.status === "error" || c.status === "empty"
  ).length;

  return (
    <div className="space-y-5">
      {/* Sub-tab Singolo vs Bulk */}
      <div className="flex gap-1.5">
        <button
          onClick={() => setSubTab("single")}
          className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
            subTab === "single"
              ? "border-[color:var(--color-mase-primary)] bg-[color:var(--color-mase-primary)] text-[color:var(--color-mase-primary-text)]"
              : "border-[color:var(--color-mase-border)] bg-[color:var(--color-mase-surface)] text-[color:var(--color-mase-text-muted)] hover:text-[color:var(--color-mase-text)]"
          }`}
        >
          <FileSearch className="h-4 w-4" /> {t("validator.subtab.single")}
        </button>
        <button
          onClick={() => setSubTab("bulk")}
          className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
            subTab === "bulk"
              ? "border-[color:var(--color-mase-primary)] bg-[color:var(--color-mase-primary)] text-[color:var(--color-mase-primary-text)]"
              : "border-[color:var(--color-mase-border)] bg-[color:var(--color-mase-surface)] text-[color:var(--color-mase-text-muted)] hover:text-[color:var(--color-mase-text)]"
          }`}
        >
          <Layers className="h-4 w-4" /> {t("validator.subtab.bulk")}
        </button>
      </div>

      {subTab === "bulk" ? (
        <BulkValidator />
      ) : (
        <SingleValidator
          valore={valore}
          setValore={setValore}
          result={result}
          totaleOk={totaleOk}
          totaleWarn={totaleWarn}
          totaleErr={totaleErr}
        />
      )}
    </div>
  );
}

function SingleValidator({
  valore,
  setValore,
  result,
  totaleOk,
  totaleWarn,
  totaleErr,
}: {
  valore: string;
  setValore: (v: string) => void;
  result: ReturnType<typeof validaCodiceCompleto>;
  totaleOk: number;
  totaleWarn: number;
  totaleErr: number;
}) {
  const { t } = useAppState();
  return (
    <div className="space-y-5">
      <Card>
        <FieldLabel
          index={0}
          title={t("validator.input.title")}
          description={t("validator.input.hint")}
        />
        <Input
          monospace
          value={valore}
          onChange={(e) => setValore(e.target.value)}
          placeholder={t("validator.input.placeholder")}
          className="text-base"
        />

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-[color:var(--color-mase-text-muted)]">{t("validator.examples")}</span>
          {ESEMPI.map((e) => (
            <Button
              key={e}
              variant="subtle"
              className="px-2.5 py-1 text-xs"
              onClick={() => setValore(e)}
            >
              <span className="font-mono">{e}</span>
            </Button>
          ))}
        </div>
      </Card>

      {/* Pannello riassuntivo */}
      {valore && (
        <Card
          className={
            result.valid
              ? "border-[color:var(--color-mase-ok)]/40"
              : totaleErr > 0
              ? "border-[color:var(--color-mase-err)]/40"
              : "border-[color:var(--color-mase-warn)]/40"
          }
        >
          <div className="flex items-start gap-3">
            {result.valid ? (
              <CircleCheck className="h-7 w-7 flex-shrink-0 text-[color:var(--color-mase-ok)]" />
            ) : totaleErr > 0 ? (
              <CircleX className="h-7 w-7 flex-shrink-0 text-[color:var(--color-mase-err)]" />
            ) : (
              <AlertTriangle className="h-7 w-7 flex-shrink-0 text-[color:var(--color-mase-warn)]" />
            )}
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold">
                {result.valid
                  ? t("validator.result.valid")
                  : totaleErr > 0
                  ? t("validator.result.invalid")
                  : t("validator.result.warnings")}
              </h3>
              <p className="mt-0.5 text-sm text-[color:var(--color-mase-text-muted)]">
                {totaleOk} {t("validator.summary.ok")} · {totaleWarn} {t("validator.summary.warnings")} · {totaleErr} {t("validator.summary.errors")}
              </p>
              {result.descrizione && (
                <p className="mt-2 text-sm">
                  <span className="text-[color:var(--color-mase-text-muted)]">{t("validator.documento")}</span>{" "}
                  <strong>{result.descrizione}</strong>
                </p>
              )}

              {result.inCatalogo && (
                <div className="mt-3 flex items-start gap-2 rounded-lg border border-[color:var(--color-mase-ok)]/30 bg-[color:var(--color-mase-ok-soft)] px-3 py-2">
                  <BookMarked className="mt-0.5 h-4 w-4 flex-shrink-0 text-[color:var(--color-mase-ok)]" />
                  <div className="text-sm">
                    <p className="font-medium text-[color:var(--color-mase-ok)]">
                      {t("validator.inCatalog")}
                    </p>
                    <p className="mt-0.5 text-[color:var(--color-mase-text)]">
                      <strong>{result.descrizioneCatalogo}</strong>
                    </p>
                    {result.gruppoCatalogo && (
                      <p className="mt-0.5 text-xs text-[color:var(--color-mase-text-muted)]">
                        {t("validator.group")} <span className="font-mono">{result.gruppoCatalogo}</span>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {!result.inCatalogo && result.valid && (
                <p className="mt-3 text-xs text-[color:var(--color-mase-text-muted)]">
                  <BookMarked className="mr-1 inline h-3 w-3" />
                  {t("validator.notInCatalog")}
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Diagnostica dettagliata */}
      {valore && (
        <Card>
          <h3 className="mb-3 flex items-center gap-2 text-base font-semibold">
            <ShieldCheck className="h-4 w-4 text-[color:var(--color-mase-primary)]" />
            {t("validator.fieldByField")}
          </h3>
          <div className="space-y-2">
            {result.campi.map((f) => (
              <div
                key={f.campo}
                className="flex items-start gap-3 rounded-lg border border-[color:var(--color-mase-border)]/60 bg-[color:var(--color-mase-surface-elevated)]/60 px-3 py-2.5"
              >
                <Badge tone={TONE[f.status]}>{`Campo ${f.campo}`}</Badge>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-sm font-medium">{f.nome}</span>
                    {f.valore && (
                      <code className="rounded bg-[color:var(--color-mase-bg)] px-1.5 py-0.5 font-mono text-xs text-[color:var(--color-mase-text)]">
                        {f.valore}
                      </code>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-[color:var(--color-mase-text-muted)]">
                    {f.messaggio}
                  </p>
                  {f.suggerimento && (
                    <p className="mt-0.5 text-xs text-[color:var(--color-mase-primary)]">
                      → {f.suggerimento}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
