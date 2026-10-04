import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
type FieldError = { label: string; message: string };
const FieldErrors = createContext<Record<string, FieldError>>({});
/** Keep programmatic focus visible below the site's fixed navigation. */
export function focusToolElement(
  element: HTMLElement | null,
  block: ScrollLogicalPosition = "center",
) {
  if (!element) return;
  element.focus({ preventScroll: true });
  element.scrollIntoView({ block, behavior: "instant" });
}
export const inputClass =
  "w-full min-w-0 rounded-lg border border-hairline bg-canvas px-3 py-3 text-base text-ink disabled:cursor-not-allowed disabled:opacity-50";
export function NumberField({
  id,
  label,
  value,
  onChange,
  hint,
  disabled = false,
  required = true,
  min = 0,
  max,
  step = "any",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  disabled?: boolean;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number | "any";
}) {
  const error = useContext(FieldErrors)[id];
  const descriptions = [hint && id + "-hint", error && id + "-error"]
    .filter(Boolean)
    .join(" ");
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        type="number"
        inputMode={step === 1 ? "numeric" : "decimal"}
        step={step}
        min={min}
        max={max}
        required={required}
        data-number-field={label}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
        aria-describedby={descriptions || undefined}
        aria-invalid={error ? true : undefined}
      />
      {hint && (
        <p id={id + "-hint"} className="mt-2 text-sm leading-relaxed text-body">
          {hint}
        </p>
      )}
      {error && (
        <p id={id + "-error"} className="mt-2 text-sm font-medium text-ink">
          {error.message}
        </p>
      )}
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, FieldError>>(
    {},
  );
  const [submission, setSubmission] = useState(0);
  const form = useRef<HTMLFormElement>(null);
  const summary = useRef<HTMLDivElement>(null);
  const summaryId = useId();
  useEffect(() => {
    const first = Object.keys(fieldErrors)[0];
    if (first)
      focusToolElement(
        form.current?.querySelector<HTMLInputElement>(`[id="${first}"]`) ??
          null,
      );
    else if (error) focusToolElement(summary.current, "start");
  }, [fieldErrors, error, submission]);
  return (
    <FieldErrors.Provider value={fieldErrors}>
      <form
        ref={form}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          const errors: Record<string, FieldError> = {};
          for (const field of event.currentTarget.querySelectorAll<HTMLInputElement>(
            "input[data-number-field]",
          )) {
            if (field.matches(":disabled") || field.validity.valid) continue;
            const label = field.dataset.numberField!;
            const validity = field.validity;
            const message = validity.badInput
              ? "Enter a valid number."
              : validity.valueMissing
                ? `Enter ${label.toLowerCase()}.`
                : validity.rangeUnderflow
                  ? `Use ${field.min} or more.`
                  : validity.rangeOverflow
                    ? `Use ${field.max} or less.`
                    : validity.stepMismatch
                      ? field.step === "1"
                        ? "Use a whole number."
                        : `Use increments of ${field.step}.`
                      : "Check this number and try again.";
            errors[field.id] = { label, message };
          }
          setFieldErrors(errors);
          setSubmission((count) => count + 1);
          if (Object.keys(errors).length) onEdit();
          else onSubmit(event);
        }}
        onChangeCapture={() => {
          setFieldErrors({});
          onEdit();
        }}
        onClickCapture={(event) => {
          if ((event.target as HTMLElement).closest('button[type="button"]'))
            setFieldErrors({});
        }}
        className="space-y-5"
      >
        {children}
        {(error || Object.keys(fieldErrors).length > 0) && (
          <div
            ref={summary}
            tabIndex={-1}
            aria-labelledby={summaryId}
            role="alert"
            className="scroll-mt-24 rounded-lg border border-hairline bg-canvas-soft-2 p-4 text-sm text-ink"
          >
            <p id={summaryId} className="font-semibold">
              Check your entries.
            </p>
            {Object.keys(fieldErrors).length > 0 ? (
              <ul className="mt-2">
                {Object.entries(fieldErrors).map(([id, issue]) => (
                  <li key={id}>
                    <a
                      href={`#${id}`}
                      className="inline-flex min-h-11 items-center text-link underline"
                      onClick={(event) => {
                        event.preventDefault();
                        focusToolElement(
                          form.current?.querySelector<HTMLInputElement>(
                            `[id="${id}"]`,
                          ) ?? null,
                        );
                      }}
                    >
                      {issue.label}: {issue.message}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 leading-relaxed">{error}</p>
            )}
          </div>
        )}
      </form>
    </FieldErrors.Provider>
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
  const result = useRef<HTMLElement>(null);
  const resultValue = useRef<HTMLParagraphElement>(null);
  const resultId = useId();
  useEffect(() => {
    focusToolElement(result.current, "start");
    const element = resultValue.current;
    if (!element || typeof element.animate !== "function") return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const style = getComputedStyle(element);
    // A short color acknowledgment marks each submission, including identical answers.
    // Never count through invented intermediate values or delay the breakdown.
    const feedback = element.animate(
      [
        { color: style.getPropertyValue("--color-link").trim() },
        { color: style.color },
      ],
      {
        duration: preference.matches ? 100 : 280,
        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    );
    const cancelFeedback = () => feedback.cancel();
    preference.addEventListener("change", cancelFeedback);
    return () => {
      feedback.cancel();
      preference.removeEventListener("change", cancelFeedback);
    };
  }, [value, label, lines]);
  return (
    <section
      ref={result}
      tabIndex={-1}
      aria-labelledby={`${resultId}-label ${resultId}-value`}
      data-calculation-result
      className="mt-6 scroll-mt-24 rounded-xl border border-hairline bg-canvas-soft-2 p-5 sm:p-6"
    >
      <p id={`${resultId}-label`} className="text-sm font-medium text-body">
        {label}
      </p>
      <p
        ref={resultValue}
        id={`${resultId}-value`}
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
        <ul className="mt-5 list-disc space-y-2 pl-5 text-sm leading-relaxed text-body">
          {notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
