import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useMemo, useCallback, useEffect } from "react";

interface MonthlyBreakdown {
  principalAndInterest: number;
  propertyTax: number;
  insurance: number;
  pmi: number;
  total: number;
}

function calculateMortgage(
  homePrice: number,
  downPayment: number,
  annualRate: number,
  years: number,
  annualTaxRate: number,
  annualInsurance: number,
  monthlyPmiRate: number
): { breakdown: MonthlyBreakdown; totalInterest: number; loanAmount: number; monthlyRate: number } | null {
  const loanAmount = homePrice - downPayment;
  if (loanAmount <= 0 || annualRate < 0 || years <= 0 || homePrice <= 0) return null;

  const monthlyRate = annualRate / 100 / 12;
  const totalPayments = years * 12;

  let principalAndInterest: number;
  if (monthlyRate === 0) {
    principalAndInterest = loanAmount / totalPayments;
  } else {
    principalAndInterest =
      (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments))) /
      (Math.pow(1 + monthlyRate, totalPayments) - 1);
  }

  const propertyTax = (homePrice * (annualTaxRate / 100)) / 12;
  const insurance = annualInsurance / 12;
  const pmi = loanAmount * (monthlyPmiRate / 100);

  const total = principalAndInterest + propertyTax + insurance + pmi;

  const totalInterest = parseFloat((principalAndInterest * totalPayments - loanAmount).toFixed(2));

  return {
    breakdown: {
      principalAndInterest: parseFloat(principalAndInterest.toFixed(2)),
      propertyTax: parseFloat(propertyTax.toFixed(2)),
      insurance: parseFloat(insurance.toFixed(2)),
      pmi: parseFloat(pmi.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
    },
    totalInterest,
    loanAmount: parseFloat(loanAmount.toFixed(2)),
    monthlyRate,
  };
}

export default function MortgageCalculator() {
  const { markInteraction, recordSuccess } = useToolTelemetry();
  const [homePrice, setHomePrice] = useState("300000");
  const [downPaymentDollar, setDownPaymentDollar] = useState("60000");
  const [downPaymentPercent, setDownPaymentPercent] = useState("20");
  const [interestRate, setInterestRate] = useState("6.5");
  const [loanTerm, setLoanTerm] = useState("30");
  const [propertyTax, setPropertyTax] = useState("1.2");
  const [homeInsurance, setHomeInsurance] = useState("1200");
  const [pmiRate, setPmiRate] = useState("0.5");
  const [syncSource, setSyncSource] = useState<"dollar" | "percent">("percent");

  const result = useMemo(() => {
    const price = parseFloat(homePrice);
    if (isNaN(price) || price <= 0) return null;

    let downPay: number;
    if (syncSource === "percent") {
      const pct = parseFloat(downPaymentPercent);
      if (isNaN(pct)) return null;
      downPay = price * (pct / 100);
    } else {
      downPay = parseFloat(downPaymentDollar);
      if (isNaN(downPay)) return null;
    }

    const rate = parseFloat(interestRate);
    const years = parseFloat(loanTerm);
    const taxPct = parseFloat(propertyTax);
    const ins = parseFloat(homeInsurance);
    const pmi = parseFloat(pmiRate);

    if (isNaN(rate) || isNaN(years) || isNaN(taxPct) || isNaN(ins) || isNaN(pmi) || years <= 0) return null;

    return calculateMortgage(price, downPay, rate, years, taxPct, ins, pmi);
  }, [homePrice, downPaymentDollar, downPaymentPercent, interestRate, loanTerm, propertyTax, homeInsurance, pmiRate, syncSource]);

  const handleDownPaymentDollarChange = (val: string) => {
    setDownPaymentDollar(val);
    setSyncSource("dollar");
    const price = parseFloat(homePrice);
    const dp = parseFloat(val);
    if (!isNaN(price) && price > 0 && !isNaN(dp)) {
      setDownPaymentPercent(((dp / price) * 100).toFixed(2));
    }
  };

  const handleDownPaymentPercentChange = (val: string) => {
    setDownPaymentPercent(val);
    setSyncSource("percent");
    const price = parseFloat(homePrice);
    const pct = parseFloat(val);
    if (!isNaN(price) && price > 0 && !isNaN(pct)) {
      setDownPaymentDollar((price * (pct / 100)).toFixed(2));
    }
  };

  const formatCurrency = (val: number): string => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val);
  };

  const breakdownItems = result
    ? [
        { label: "Principal & Interest", value: result.breakdown.principalAndInterest, color: "#171717" },
        { label: "Property Tax", value: result.breakdown.propertyTax, color: "#0070f3" },
        { label: "Insurance", value: result.breakdown.insurance, color: "#7928ca" },
        { label: "PMI", value: result.breakdown.pmi, color: "#f5a623" },
      ]
    : [];

  const totalMonthly = result?.breakdown.total ?? 0;

  useEffect(() => {
    if (result && Object.values(result.breakdown).every(Number.isFinite) && Number.isFinite(result.totalInterest) && Number(downPaymentDollar) >= 0 && Number(downPaymentPercent) >= 0 && Number(propertyTax) >= 0 && Number(homeInsurance) >= 0 && Number(pmiRate) >= 0) recordSuccess("calculate");
  }, [result, downPaymentDollar, downPaymentPercent, propertyTax, homeInsurance, pmiRate, recordSuccess]);

  return (
    <div onChangeCapture={markInteraction} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label htmlFor="mc-price" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
            Home Price ($)
          </label>
          <input
            id="mc-price"
            type="number"
            value={homePrice}
            onChange={(e) => {
              const val = e.target.value;
              setHomePrice(val);
              if (syncSource === "percent") {
                const pct = parseFloat(downPaymentPercent);
                if (!isNaN(pct)) {
                  const price = parseFloat(val);
                  setDownPaymentDollar(!isNaN(price) ? (price * (pct / 100)).toFixed(2) : "0");
                }
              }
            }}
            placeholder="300000"
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
          <label htmlFor="mc-down-dollar" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
            Down Payment ($)
          </label>
          <input
            id="mc-down-dollar"
            type="number"
            value={downPaymentDollar}
            onChange={(e) => handleDownPaymentDollarChange(e.target.value)}
            placeholder="60000"
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
          <label htmlFor="mc-down-pct" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
            Down Payment (%)
          </label>
          <input
            id="mc-down-pct"
            type="number"
            value={downPaymentPercent}
            onChange={(e) => handleDownPaymentPercentChange(e.target.value)}
            placeholder="20"
            className="w-full h-12 px-4 border rounded-lg text-base outline-none transition-colors duration-150"
            style={{
              backgroundColor: "var(--color-canvas-soft)",
              borderColor: "var(--color-hairline)",
              color: "var(--color-ink)",
            }}
            inputMode="decimal"
            min="0"
            max="100"
          />
        </div>
        <div>
          <label htmlFor="mc-rate" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
            Interest Rate (%)
          </label>
          <input
            id="mc-rate"
            type="number"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            placeholder="6.5"
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
          <label htmlFor="mc-term" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
            Loan Term (years)
          </label>
          <input
            id="mc-term"
            type="number"
            value={loanTerm}
            onChange={(e) => setLoanTerm(e.target.value)}
            placeholder="30"
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
          <label htmlFor="mc-tax" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
            Property Tax (% annual)
          </label>
          <input
            id="mc-tax"
            type="number"
            value={propertyTax}
            onChange={(e) => setPropertyTax(e.target.value)}
            placeholder="1.2"
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
          <label htmlFor="mc-ins" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
            Home Insurance ($/year)
          </label>
          <input
            id="mc-ins"
            type="number"
            value={homeInsurance}
            onChange={(e) => setHomeInsurance(e.target.value)}
            placeholder="1200"
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
          <label htmlFor="mc-pmi" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
            PMI (% monthly)
          </label>
          <input
            id="mc-pmi"
            type="number"
            value={pmiRate}
            onChange={(e) => setPmiRate(e.target.value)}
            placeholder="0.5"
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
      </div>

      {result && (
        <div className="space-y-6">
          {/* Total Monthly Payment */}
          <div className="p-6 rounded-lg text-center" style={{ backgroundColor: "var(--color-canvas-soft-2)" }}>
            <div className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--color-mute)", fontFamily: "var(--font-mono)" }}>
              Total Monthly Payment
            </div>
            <div className="text-4xl font-semibold" style={{ color: "var(--color-ink)", letterSpacing: "-1.28px" }}>
              {formatCurrency(totalMonthly)}
            </div>
          </div>

          {/* Donut chart + Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            {/* CSS Donut Chart */}
            <div className="flex justify-center">
              <div className="relative w-48 h-48">
                {(() => {
                  const total = breakdownItems.reduce((s, i) => s + i.value, 0);
                  if (total === 0) return null;
                  let cumulativePercent = 0;
                  const slices = breakdownItems.map((item) => {
                    const percent = (item.value / total) * 100;
                    const start = cumulativePercent;
                    cumulativePercent += percent;
                    return { ...item, percent, start };
                  });

                  const conicGradient = slices
                    .map((s) => `${s.color} ${s.start}% ${s.start + s.percent}%`)
                    .join(", ");

                  return (
                    <>
                      <div
                        className="w-48 h-48 rounded-full"
                        style={{
                          background: `conic-gradient(${conicGradient})`,
                          border: "1px solid var(--color-hairline)",
                        }}
                        aria-label="Payment breakdown donut chart"
                      />
                      <div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full flex items-center justify-center flex-col"
                        style={{ backgroundColor: "var(--color-canvas)" }}
                      >
                        <span className="text-[10px] uppercase tracking-wider" style={{ color: "var(--color-mute)" }}>
                          Monthly
                        </span>
                        <span className="text-sm font-semibold" style={{ color: "var(--color-ink)" }}>
                          {formatCurrency(total)}
                        </span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-3">
              {breakdownItems.map((item) => (
                <div key={item.label} className="flex items-center justify-between px-4 py-3 rounded-lg" style={{ backgroundColor: "var(--color-canvas-soft-2)" }}>
                  <div className="flex items-center gap-3">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm" style={{ color: "var(--color-ink)" }}>{item.label}</span>
                  </div>
                  <span className="text-sm font-medium" style={{ color: "var(--color-ink)" }}>
                    {formatCurrency(item.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Amortization Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg text-center" style={{ backgroundColor: "var(--color-canvas-soft-2)" }}>
              <div className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--color-mute)", fontFamily: "var(--font-mono)" }}>
                Loan Amount
              </div>
              <div className="text-xl font-semibold" style={{ color: "var(--color-ink)" }}>
                {formatCurrency(result.loanAmount)}
              </div>
            </div>
            <div className="p-4 rounded-lg text-center" style={{ backgroundColor: "var(--color-canvas-soft-2)" }}>
              <div className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--color-mute)", fontFamily: "var(--font-mono)" }}>
                Total Interest Paid
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
                {formatCurrency(result.loanAmount + result.totalInterest)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
