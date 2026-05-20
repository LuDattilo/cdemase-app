"use client";

import { ReactNode, SelectHTMLAttributes, InputHTMLAttributes } from "react";
import { clsx } from "clsx";

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-[color:var(--color-mase-border)] bg-[color:var(--color-mase-surface)] p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_1px_2px_rgba(15,23,42,0.03)]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function FieldLabel({
  index,
  subindex,
  title,
  description,
  required,
}: {
  index: number;
  /** Indice secondario per sub-campi (es. 'a','b','c' per il Campo 7 composito) */
  subindex?: string;
  title: string;
  description?: string;
  required?: boolean;
}) {
  const badge = subindex ? `${index}${subindex}` : `${index}`;
  return (
    <div className="mb-1.5">
      <div className="flex items-center gap-2">
        <span
          className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-md bg-[color:var(--color-mase-primary-soft)] px-1.5 font-mono text-[10px] font-semibold text-[color:var(--color-mase-primary)]"
          title={`Campo ${index}${subindex ? ` (${subindex})` : ""}`}
        >
          {badge}
        </span>
        <label className="truncate text-sm font-medium text-[color:var(--color-mase-text)]">
          {title}
          {required && <span className="ml-0.5 text-[color:var(--color-mase-err)]">*</span>}
        </label>
      </div>
      {description && (
        <span className="ml-7 block text-[11px] text-[color:var(--color-mase-text-muted)]">
          {description}
        </span>
      )}
    </div>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function Select({ options, placeholder, className, ...rest }: SelectProps) {
  return (
    <select
      {...rest}
      className={clsx(
        "w-full rounded-xl border border-[color:var(--color-mase-border)] bg-[color:var(--color-mase-surface-elevated)] px-3 py-2.5 text-sm text-[color:var(--color-mase-text)]",
        "transition-colors hover:border-[color:var(--color-mase-primary)]/60",
        "appearance-none bg-[image:linear-gradient(45deg,transparent_50%,currentColor_50%),linear-gradient(135deg,currentColor_50%,transparent_50%)] bg-[size:6px_6px,6px_6px] bg-[position:calc(100%-15px)_50%,calc(100%-10px)_50%] bg-no-repeat pr-9",
        className
      )}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  monospace?: boolean;
}

export function Input({ monospace, className, ...rest }: InputProps) {
  return (
    <input
      {...rest}
      className={clsx(
        "w-full rounded-xl border border-[color:var(--color-mase-border)] bg-[color:var(--color-mase-surface-elevated)] px-3 py-2.5 text-sm text-[color:var(--color-mase-text)]",
        "transition-colors hover:border-[color:var(--color-mase-primary)]/60 placeholder:text-[color:var(--color-mase-text-muted)]/70",
        monospace && "font-mono tracking-[0.02em]",
        className
      )}
    />
  );
}

export function Button({
  children,
  variant = "primary",
  className,
  ...rest
}: {
  children: ReactNode;
  variant?: "primary" | "ghost" | "subtle";
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const styles = {
    primary:
      "bg-[color:var(--color-mase-primary)] text-[color:var(--color-mase-primary-text)] hover:bg-[color:var(--color-mase-primary-hover)] font-semibold",
    ghost:
      "bg-transparent text-[color:var(--color-mase-text)] hover:bg-[color:var(--color-mase-surface-elevated)] border border-[color:var(--color-mase-border)]",
    subtle:
      "bg-[color:var(--color-mase-primary-soft)] text-[color:var(--color-mase-primary)] hover:bg-[color:var(--color-mase-primary-soft)]/80",
  } as const;
  return (
    <button
      {...rest}
      className={clsx(
        "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        styles[variant],
        className
      )}
    >
      {children}
    </button>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "ok" | "warning" | "error";
}) {
  const styles = {
    neutral:
      "bg-[color:var(--color-mase-surface-elevated)] text-[color:var(--color-mase-text-muted)] border border-[color:var(--color-mase-border)]",
    ok: "bg-[color:var(--color-mase-ok)]/15 text-[color:var(--color-mase-ok)] border border-[color:var(--color-mase-ok)]/30",
    warning:
      "bg-[color:var(--color-mase-warn)]/15 text-[color:var(--color-mase-warn)] border border-[color:var(--color-mase-warn)]/30",
    error:
      "bg-[color:var(--color-mase-err)]/15 text-[color:var(--color-mase-err)] border border-[color:var(--color-mase-err)]/30",
  } as const;
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wider",
        styles[tone]
      )}
    >
      {children}
    </span>
  );
}

export function Divider({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="h-px flex-1 bg-[color:var(--color-mase-border)]" />
      {label && (
        <span className="text-xs font-medium uppercase tracking-wider text-[color:var(--color-mase-text-muted)]">
          {label}
        </span>
      )}
      <div className="h-px flex-1 bg-[color:var(--color-mase-border)]" />
    </div>
  );
}
