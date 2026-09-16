import type { ComponentProps, ReactNode } from "react";
export const inputClass =
  "w-full min-w-0 rounded-lg border border-hairline bg-canvas px-3 py-3 text-base text-ink";
export function NumberField({
  id,
  label,
  value,
  onChange,
  hint,
  disabled = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  disabled?: boolean;
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        step="any"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
        aria-describedby={hint ? id + "-hint" : undefined}
      />
      <p id={id + "-hint"} className="mt-1 text-xs leading-relaxed text-body">
        {hint}
      </p>
    </div>
  );
}
export function CalculatorForm({
  children,
  onSubmit,
  onEdit,
  error,
}: {
  children: ReactNode;
  onSubmit: NonNullable<ComponentProps<"form">["onSubmit"]>;
  onEdit: () => void;
  error: string;
}) {
  return (
    <form
      noValidate
      onSubmit={onSubmit}
      onChangeCapture={onEdit}
      className="space-y-5"
    >
      {children}
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-hairline bg-canvas-soft-2 p-4 text-sm text-ink"
        >
          <strong>Check your entries.</strong> {error}
        </div>
      )}
    </form>
  );
}
export default function CalculationResult({
  label,
  value,
  lines,
  notes = [],
  impossible = false,
}: {
  label: string;
  value: string;
  lines: string[];
  notes?: string[];
  impossible?: boolean;
}) {
  return (
    <section
      aria-label="Calculation result"
      aria-live="polite"
      className="mt-6 rounded-xl border border-hairline bg-canvas-soft-2 p-5 sm:p-6"
    >
      <p className="text-sm font-medium text-body">{label}</p>
      <p
        className="mt-2 break-words text-3xl font-semibold tracking-tight text-ink"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {value}
      </p>
      {impossible && (
        <p className="mt-3 font-medium text-ink">
          The target is not achievable with these entries.
        </p>
      )}
      <h2 className="mt-6 text-sm font-semibold text-ink">
        Calculation breakdown
      </h2>
      <ol className="mt-3 space-y-3 text-sm leading-relaxed text-body">
        {lines.map((line, i) => (
          <li
            key={i}
            className="break-words border-t border-hairline pt-3"
            style={{
              overflowWrap: "anywhere",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {line}
          </li>
        ))}
      </ol>
      {notes.length > 0 && (
        <ul className="mt-5 list-disc space-y-2 pl-5 text-xs leading-relaxed text-body">
          {notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
