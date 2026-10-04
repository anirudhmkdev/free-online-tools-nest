export interface AmortizationRow { payment: number; principal: number; interest: number; totalPayment: number; balance: number; }
const money = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;
function validLoan(amount: number, rate: number, years: number): boolean {
  return [amount,rate,years].every(Number.isFinite) && amount > 0 && amount <= 1e12 && rate >= 0 && rate <= 100 && Number.isInteger(years * 12) && years * 12 >= 1 && years * 12 <= 1200;
}
export function monthlyLoanPayment(amount: number, rate: number, years: number): number {
  if (!validLoan(amount,rate,years)) throw new Error("Use a positive loan up to $1 trillion, 0–100% annual interest, and a term of 1–1200 whole months.");
  const r = rate / 1200;
  return r === 0 ? amount / (years * 12) : amount * r / -Math.expm1(-years * 12 * Math.log1p(r));
}
export function calculateAmortization(amount: number, rate: number, years: number, extra: number) {
  const payment = monthlyLoanPayment(amount,rate,years);
  if (!Number.isFinite(extra) || extra < 0 || extra > 1e12) throw new Error("Extra monthly payment must be between $0 and $1 trillion.");
  const schedule: AmortizationRow[] = [];
  let balance = money(amount);
  let totalInterest = 0;
  for (let month = 1; month <= years * 12 && balance > 0; month++) {
    const interest = money(balance * rate / 1200);
    // Settle any cent rounding residual in the final contractual payment.
    const principal = month === years * 12 ? balance : Math.min(balance, money(payment + extra - interest));
    if (principal <= 0) throw new Error("Payment is below the cent precision needed to reduce this balance.");
    balance = money(balance - principal);
    totalInterest = money(totalInterest + interest);
    schedule.push({payment:month,principal,interest,totalPayment:money(principal+interest),balance});
  }
  return {monthlyPayment:money(payment),totalInterest,totalCost:money(amount+totalInterest),schedule};
}
export function calculateMortgage(homePrice: number, downPayment: number, rate: number, years: number, taxRate: number, insurance: number, monthlyPmiRate: number) {
  if (![homePrice,downPayment,taxRate,insurance,monthlyPmiRate].every(Number.isFinite) || homePrice <= 0 || downPayment < 0 || downPayment >= homePrice || taxRate < 0 || insurance < 0 || monthlyPmiRate < 0) return null;
  const amount = homePrice - downPayment;
  try {
    const pi = monthlyLoanPayment(amount,rate,years);
    const tax = homePrice * taxRate / 1200;
    const ins = insurance / 12;
    const pmi = amount * monthlyPmiRate / 100;
    if (![pi,tax,ins,pmi,pi+tax+ins+pmi].every(Number.isFinite)) return null;
    return {breakdown:{principalAndInterest:money(pi),propertyTax:money(tax),insurance:money(ins),pmi:money(pmi),total:money(pi+tax+ins+pmi)},totalInterest:money(Math.max(0,pi*years*12-amount)),loanAmount:money(amount),monthlyRate:rate/1200};
  } catch { return null; }
}
export function computeDiscount(mode: "savings" | "discount-pct" | "final-price", a: string, b: string) {
  if (!a.trim() || !b.trim()) return null;
  const original = Number(a), value = Number(b);
  if (![original,value].every(Number.isFinite) || original <= 0 || value < 0) return null;
  if (mode === "savings" && value > 100 || mode !== "savings" && value > original) return null;
  const savings = mode === "savings" ? original * value / 100 : mode === "discount-pct" ? original - value : value;
  return {savings:money(savings),finalPrice:money(original-savings),discountPct:money(savings/original*100)};
}
export function bmiCategory(bmi: number): {label:string; color:string} {
  if (bmi < 18.5) return {label:"Underweight",color:"#60a5fa"};
  if (bmi < 25) return {label:"Healthy weight",color:"#22c55e"};
  if (bmi < 30) return {label:"Overweight",color:"#eab308"};
  if (bmi < 35) return {label:"Obesity class I",color:"#f97316"};
  if (bmi < 40) return {label:"Obesity class II",color:"#ef4444"};
  return {label:"Obesity class III",color:"#dc2626"};
}
