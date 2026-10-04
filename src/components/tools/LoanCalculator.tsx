import { calculateAmortization } from "../../helpers/quality-calculators";
import ErrorBanner from "../ErrorBanner";
import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useMemo, useCallback, useEffect } from "react";

export default function LoanCalculator() {
  const { markInteraction, recordSuccess } = useToolTelemetry();
  const [loanAmount, setLoanAmount] = useState("20000");
  const [interestRate, setInterestRate] = useState("5");
  const [loanTerm, setLoanTerm] = useState("5");
  const [extraPayment, setExtraPayment] = useState("0");
  const [calculated, setCalculated] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const result = useMemo(() => {
    if (!calculated) return null;
    const amount = parseFloat(loanAmount);
    const rate = parseFloat(interestRate);
    const years = parseFloat(loanTerm);
    const extra = extraPayment.trim() ? Number(extraPayment) : 0;

    if (isNaN(amount) || isNaN(rate) || isNaN(years) || amount <= 0 || rate < 0 || years <= 0) return null;

    try { return calculateAmortization(amount, rate, years, extra); } catch { return null; }
  }, [loanAmount, interestRate, loanTerm, extraPayment, calculated]);

  const handleCalculate = useCallback(() => {
    markInteraction();
    setCalculated(true);
    setShowAll(false);
  }, [markInteraction]);

  const displaySchedule = useMemo(() => {
    if (!result) return [];
    if (showAll) return result.schedule;
    return result.schedule.slice(0, 12);
  }, [result, showAll]);

  const formatCurrency = (val: number): string => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val);
  };

  useEffect(() => {
    if (result && [result.monthlyPayment, result.totalInterest, result.totalCost].every(Number.isFinite)) recordSuccess("calculate");
  }, [result, recordSuccess]);

  return (
    <div className="space-y-6">
      <p className="text-sm">Fixed nominal annual rate with monthly payments. Fees are excluded. The schedule rounds each payment to cents and settles any rounding residual in the final payment.</p>
      <ErrorBanner message={calculated && !result ? "Use a positive loan up to $1 trillion, 0–100% annual interest, a term of 1–1200 whole months, and a nonnegative extra payment." : ""} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label htmlFor="loan-amount" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
            Loan Amount ($)
          </label>
          <input
            id="loan-amount"
            type="number"
            value={loanAmount}
            onChange={(e) => { setLoanAmount(e.target.value); setCalculated(false); }}
            placeholder="20000"
            className="w-full h-12 px-4 border rounded-lg text-base outline-none transition-colors duration-150"
            style={{
              backgroundColor: "var(--color-canvas-soft)",
              borderColor: "var(--color-hairline)",
              color: "var(--color-ink)",
            }}
            inputMode="decimal"
            min="0"
          />
        </div>
        <div>
          <label htmlFor="loan-rate" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
            Interest Rate (% annual)
          </label>
          <input
            id="loan-rate"
            type="number"
            value={interestRate}
            onChange={(e) => { setInterestRate(e.target.value); setCalculated(false); }}
            placeholder="5"
            className="w-full h-12 px-4 border rounded-lg text-base outline-none transition-colors duration-150"
            style={{
              backgroundColor: "var(--color-canvas-soft)",
              borderColor: "var(--color-hairline)",
              color: "var(--color-ink)",
            }}
            inputMode="decimal"
            min="0"
            step="0.1"
          />
        </div>
        <div>
          <label htmlFor="loan-term" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
            Loan Term (years)
          </label>
          <input
            id="loan-term"
            type="number"
            value={loanTerm}
            onChange={(e) => { setLoanTerm(e.target.value); setCalculated(false); }}
            placeholder="5"
            className="w-full h-12 px-4 border rounded-lg text-base outline-none transition-colors duration-150"
            style={{
              backgroundColor: "var(--color-canvas-soft)",
              borderColor: "var(--color-hairline)",
              color: "var(--color-ink)",
            }}
            inputMode="numeric"
            min="1"
          />
        </div>
        <div>
          <label htmlFor="loan-extra" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
            Extra Payment ($/mo, optional)
          </label>
          <input
            id="loan-extra"
            type="number"
            value={extraPayment}
            onChange={(e) => {
              setExtraPayment(e.target.value);
              setCalculated(false);
            }}
            placeholder="0"
            className="w-full h-12 px-4 border rounded-lg text-base outline-none transition-colors duration-150"
            style={{
              backgroundColor: "var(--color-canvas-soft)",
              borderColor: "var(--color-hairline)",
              color: "var(--color-ink)",
            }}
            inputMode="decimal"
            min="0"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleCalculate}
        className="btn-primary btn-sm"
        style={{ backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)" }}
      >
        Calculate
      </button>

      {result && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg text-center" style={{ backgroundColor: "var(--color-canvas-soft-2)" }}>
              <div className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--color-mute)", fontFamily: "var(--font-mono)" }}>
                Monthly Payment
              </div>
              <div className="text-xl font-semibold" style={{ color: "var(--color-ink)" }}>
                {formatCurrency(result.monthlyPayment)}
              </div>
            </div>
            <div className="p-4 rounded-lg text-center" style={{ backgroundColor: "var(--color-canvas-soft-2)" }}>
              <div className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--color-mute)", fontFamily: "var(--font-mono)" }}>
                Total Interest
              </div>
              <div className="text-xl font-semibold" style={{ color: "var(--color-warning)" }}>
                {formatCurrency(result.totalInterest)}
              </div>
            </div>
            <div className="p-4 rounded-lg text-center" style={{ backgroundColor: "var(--color-canvas-soft-2)" }}>
              <div className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--color-mute)", fontFamily: "var(--font-mono)" }}>
                Total Cost
              </div>
              <div className="text-xl font-semibold" style={{ color: "var(--color-ink)" }}>
                {formatCurrency(result.totalCost)}
              </div>
            </div>
            <div className="p-4 rounded-lg text-center" style={{ backgroundColor: "var(--color-canvas-soft-2)" }}>
              <div className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--color-mute)", fontFamily: "var(--font-mono)" }}>
                Payoff Date
              </div>
              <div className="text-xl font-semibold" style={{ color: "var(--color-ink)" }}>
                {(() => {
                  const today = new Date();
                  const months = result.schedule.length;
                  today.setMonth(today.getMonth() + months);
                  return today.toLocaleDateString("en-US", { month: "short", year: "numeric" });
                })()}
              </div>
            </div>
          </div>

          {/* Amortization Schedule */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--color-mute)", fontFamily: "var(--font-mono)" }}>
                Amortization Schedule {!showAll && `(first ${displaySchedule.length} of ${result.schedule.length})`}
              </h3>
              {result.schedule.length > 12 && !showAll && (
                <button
                  type="button"
                  onClick={() => setShowAll(true)}
                  className="text-xs px-3 py-1.5 rounded border transition-colors duration-150"
                  style={{
                    color: "var(--color-link)",
                    borderColor: "var(--color-hairline)",
                    backgroundColor: "var(--color-canvas)",
                  }}
                >
                  Show All ({result.schedule.length} payments)
                </button>
              )}
            </div>
            <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "var(--color-hairline)" }}>
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr style={{ backgroundColor: "var(--color-canvas-soft-2)", color: "var(--color-mute)", borderBottom: "1px solid var(--color-hairline)" }}>
                    <th className="p-3 font-medium">#</th>
                    <th className="p-3 font-medium">Principal</th>
                    <th className="p-3 font-medium">Interest</th>
                    <th className="p-3 font-medium">Total</th>
                    <th className="p-3 font-medium">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {displaySchedule.map((row) => (
                    <tr
                      key={row.payment}
                      style={{
                        borderBottom: "1px solid var(--color-hairline)",
                        backgroundColor: "var(--color-canvas)",
                      }}
                    >
                      <td className="p-3 font-medium" style={{ color: "var(--color-ink)" }}>{row.payment}</td>
                      <td className="p-3" style={{ color: "var(--color-body)" }}>{formatCurrency(row.principal)}</td>
                      <td className="p-3" style={{ color: "var(--color-body)" }}>{formatCurrency(row.interest)}</td>
                      <td className="p-3" style={{ color: "var(--color-body)" }}>{formatCurrency(row.totalPayment)}</td>
                      <td className="p-3" style={{ color: "var(--color-ink)" }}>{formatCurrency(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
