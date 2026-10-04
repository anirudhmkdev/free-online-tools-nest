import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useMemo, useEffect } from "react";

const PRESET_PERCENTS = [10, 15, 18, 20, 25];

export default function TipCalculator() {
  const { markInteraction, recordSuccess } = useToolTelemetry();
  const [bill, setBill] = useState("");
  const [tipPercent, setTipPercent] = useState(15);
  const [customTip, setCustomTip] = useState("");
  const [people, setPeople] = useState("1");

  const useCustom = tipPercent === -1;

  const result = useMemo(() => {
    const billNum = parseFloat(bill);
    const pct = useCustom ? parseFloat(customTip) : tipPercent;
    const numPeople = parseInt(people, 10);

    if (isNaN(billNum) || billNum <= 0) return null;
    if (isNaN(pct) || pct < 0) return null;
    if (isNaN(numPeople) || numPeople < 1) return null;

    const tipAmount = billNum * (pct / 100);
    const total = billNum + tipAmount;
    const tipPerPerson = tipAmount / numPeople;
    const totalPerPerson = total / numPeople;

    return {
      tipAmount,
      total,
      tipPerPerson,
      totalPerPerson,
      percent: pct,
    };
  }, [bill, tipPercent, customTip, people]);

  useEffect(() => {
    if (result && Object.values(result).every(Number.isFinite) && Number.isInteger(Number(people))) recordSuccess("calculate");
  }, [result, people, recordSuccess]);

  return (
    <div onChangeCapture={markInteraction} className="space-y-6">
      {/* Bill amount */}
      <div>
        <label htmlFor="bill-amount" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
          Bill Amount ($)
        </label>
        <input
          id="bill-amount"
          type="number"
          value={bill}
          onChange={(e) => setBill(e.target.value)}
          placeholder="0.00"
          className="w-full h-12 px-4 border rounded-lg text-base outline-none transition-colors duration-150"
          style={{
            backgroundColor: "var(--color-canvas-soft)",
            borderColor: "var(--color-hairline)",
            color: "var(--color-ink)",
          }}
          inputMode="decimal"
        />
      </div>

      {/* Tip percentage presets */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
          Tip Percentage
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESET_PERCENTS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => { setTipPercent(p); setCustomTip(""); }}
              className="px-4 py-2 text-sm rounded-full border transition-all duration-150"
              style={{
                backgroundColor: tipPercent === p ? "var(--color-primary)" : "var(--color-canvas)",
                color: tipPercent === p ? "var(--color-on-primary)" : "var(--color-body)",
                borderColor: tipPercent === p ? "var(--color-primary)" : "var(--color-hairline)",
              }}
            >
              {p}%
            </button>
          ))}
          <button
            type="button"
            onClick={() => setTipPercent(-1)}
            className="px-4 py-2 text-sm rounded-full border transition-all duration-150"
            style={{
              backgroundColor: useCustom ? "var(--color-primary)" : "var(--color-canvas)",
              color: useCustom ? "var(--color-on-primary)" : "var(--color-body)",
              borderColor: useCustom ? "var(--color-primary)" : "var(--color-hairline)",
            }}
          >
            Custom
          </button>
        </div>
        {useCustom && (
          <div className="mt-3">
            <input
              id="custom-tip"
              type="number"
              value={customTip}
              onChange={(e) => setCustomTip(e.target.value)}
              placeholder="Enter tip %"
              className="w-full h-10 px-3 border rounded-lg text-sm outline-none transition-colors duration-150"
              style={{
                backgroundColor: "var(--color-canvas-soft)",
                borderColor: "var(--color-hairline)",
                color: "var(--color-ink)",
              }}
              inputMode="decimal"
            />
          </div>
        )}
      </div>

      {/* Number of people */}
      <div>
        <label htmlFor="num-people" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
          Number of People
        </label>
        <input
          id="num-people"
          type="number"
          min="1"
          value={people}
          onChange={(e) => setPeople(e.target.value)}
          placeholder="1"
          className="w-full h-12 px-4 border rounded-lg text-base outline-none transition-colors duration-150"
          style={{
            backgroundColor: "var(--color-canvas-soft)",
            borderColor: "var(--color-hairline)",
            color: "var(--color-ink)",
          }}
        />
      </div>

      {/* Results */}
      {result && (
        <div className="p-6 rounded-lg space-y-4" style={{ backgroundColor: "var(--color-canvas-soft-2)" }}>
          <div className="text-xs uppercase tracking-wider" style={{ color: "var(--color-mute)", fontFamily: "var(--font-mono)" }}>
            Summary ({result.percent}% tip)
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg text-center" style={{ backgroundColor: "var(--color-canvas)" }}>
              <div className="text-xs" style={{ color: "var(--color-mute)" }}>Tip Amount</div>
              <div className="text-xl font-semibold mt-1" style={{ color: "var(--color-primary)" }}>
                ${result.tipAmount.toFixed(2)}
              </div>
            </div>
            <div className="p-3 rounded-lg text-center" style={{ backgroundColor: "var(--color-canvas)" }}>
              <div className="text-xs" style={{ color: "var(--color-mute)" }}>Total</div>
              <div className="text-xl font-semibold mt-1" style={{ color: "var(--color-ink)" }}>
                ${result.total.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="border-t pt-4" style={{ borderColor: "var(--color-hairline)" }}>
            <div className="text-xs uppercase tracking-wider mb-3" style={{ color: "var(--color-mute)", fontFamily: "var(--font-mono)" }}>
              Per Person
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg text-center" style={{ backgroundColor: "var(--color-canvas)" }}>
                <div className="text-xs" style={{ color: "var(--color-mute)" }}>Tip</div>
                <div className="text-xl font-semibold mt-1" style={{ color: "var(--color-primary)" }}>
                  ${result.tipPerPerson.toFixed(2)}
                </div>
              </div>
              <div className="p-3 rounded-lg text-center" style={{ backgroundColor: "var(--color-canvas)" }}>
                <div className="text-xs" style={{ color: "var(--color-mute)" }}>Total</div>
                <div className="text-xl font-semibold mt-1" style={{ color: "var(--color-ink)" }}>
                  ${result.totalPerPerson.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
