"use client";

import { useState } from "react";
import { Wand2, ShieldCheck, BookOpen, Library } from "lucide-react";
import { Generator } from "@/components/Generator";
import { Validator } from "@/components/Validator";
import { Reference } from "@/components/Reference";
import { Catalog } from "@/components/Catalog";
import { AppHeader } from "@/components/AppHeader";
import { useAppState } from "@/lib/useAppState";

type Tab = "catalogo" | "genera" | "verifica" | "riferimenti";

export default function Home() {
  const { t } = useAppState();
  const [tab, setTab] = useState<Tab>("catalogo");

  const TABS: { key: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: "catalogo", label: t("tab.catalogo"), icon: Library },
    { key: "genera", label: t("tab.genera"), icon: Wand2 },
    { key: "verifica", label: t("tab.verifica"), icon: ShieldCheck },
    { key: "riferimenti", label: t("tab.riferimenti"), icon: BookOpen },
  ];

  return (
    <main className="min-h-screen bg-[color:var(--color-mase-bg)]">
      <AppHeader />

      {/* Tab navigation */}
      <div className="sticky top-0 z-10 border-b border-[color:var(--color-mase-border)] bg-[color:var(--color-mase-bg)]/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 sm:px-6">
          {TABS.map((tabItem) => {
            const Icon = tabItem.icon;
            const active = tab === tabItem.key;
            return (
              <button
                key={tabItem.key}
                onClick={() => setTab(tabItem.key)}
                className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm transition-colors ${
                  active
                    ? "border-[color:var(--color-mase-primary)] text-[color:var(--color-mase-text)]"
                    : "border-transparent text-[color:var(--color-mase-text-muted)] hover:text-[color:var(--color-mase-text)]"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tabItem.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        {tab === "catalogo" && <Catalog />}
        {tab === "genera" && <Generator />}
        {tab === "verifica" && <Validator />}
        {tab === "riferimenti" && <Reference />}
      </div>
    </main>
  );
}
