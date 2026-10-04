interface StrengthResult {
  score: number;
  label: string;
  color: string;
  segments: StrengthSegment[];
}

interface StrengthSegment {
  label: string;
  score: number;
  max: number;
  color: string;
}

export function analyzeStrength(password: string): StrengthResult {
  const length = password.length;
  let totalScore = 0;

  const segments: StrengthSegment[] = [];

  const lengthScore = Math.min(40, Math.floor((length / 64) * 40));
  segments.push({ label: "Length", score: lengthScore, max: 40, color: "var(--color-primary)" });
  totalScore += lengthScore;

  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);
  const varietyCount = [hasUpper, hasLower, hasDigit, hasSymbol].filter(Boolean).length;
  const varietyScore = Math.min(25, varietyCount * 6.25);
  segments.push({ label: "Character Variety", score: varietyScore, max: 25, color: "#8b5cf6" });
  totalScore += varietyScore;

  let patternScore = 25;
  const commonPatterns = [
    /12345|password|qwerty|abcde|letmein|admin|welcome|login/i,
    /(.)\1{2,}/,
    /0123|abcd|9876|dcba/i,
  ];
  for (const pat of commonPatterns) {
    if (pat.test(password)) {
      patternScore -= 8;
    }
  }
  if (length < 8) patternScore -= 5;
  if (varietyCount < 2) patternScore -= 5;
  patternScore = Math.max(0, patternScore);
  segments.push({ label: "Pattern Detection", score: patternScore, max: 25, color: "#f59e0b" });
  totalScore += patternScore;

  const entropyScore = Math.min(10, Math.floor(length / 4));
  segments.push({ label: "Length bonus", score: entropyScore, max: 10, color: "#10b981" });
  totalScore += entropyScore;

  const repeated = /^(.{1,32})\1+$/.test(password);
  const common = /password|qwerty|letmein|welcome|123456|admin/i.test(password);
  const capped = Math.min(repeated || common ? 24 : length < 8 ? 24 : 100, Math.round(totalScore));
  const label =
    capped < 25 ? "Very Weak" :
    capped < 50 ? "Weak" :
    capped < 65 ? "Fair" :
    capped < 80 ? "Strong" :
    "Very Strong";
  const color =
    capped < 25 ? "var(--color-error)" :
    capped < 50 ? "#ef4444" :
    capped < 65 ? "#f59e0b" :
    capped < 80 ? "#22c55e" :
    "#16a34a";

  return { score: capped, label, color, segments };
}
