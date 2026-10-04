import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useCallback } from "react";
import ErrorBanner from "../ErrorBanner";

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!word) return 0;

  const vowels = "aeiouy";
  let count = 0;
  let prevVowel = false;

  for (let i = 0; i < word.length; i++) {
    const isVowel = vowels.includes(word[i]);
    if (isVowel && !prevVowel) count++;
    prevVowel = isVowel;
  }

  if (word.endsWith("e") && count > 1) count--;
  if (word.endsWith("le") && word.length > 2 && !"aeiouy".includes(word[word.length - 3])) count++;

  return Math.max(count, 1);
}

function countSentences(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => /[a-zA-Z]/.test(s));
  return Math.max(sentences.length, 1);
}

function englishStyleWords(text: string): string[] {
  // This is an input guard, not language detection or a dictionary-based tokenizer.
  return text.trim().split(/\s+/).filter(word => /[a-zA-Z]/.test(word));
}

function countComplexWords(words: string[]): number {
  return words.filter(w => countSyllables(w) >= 3).length;
}

function countCharacters(text: string): number {
  return text.replace(/[^a-zA-Z0-9]/g, "").length;
}

function countLetters(text: string): number {
  return text.replace(/[^a-zA-Z]/g, "").length;
}

interface ReadabilityScores {
  fleschKincaidGrade: number;
  fleschReadingEase: number;
  gunningFog: number;
  colemanLiau: number;
  smog: number;
  ari: number;
  wordCount: number;
  sentenceCount: number;
  syllableCount: number;
  avgWordsPerSentence: number;
  avgSyllablesPerWord: number;
  complexWordCount: number;
}

export function calculateScores(text: string): ReadabilityScores | null {
  const words = englishStyleWords(text);
  if (words.length < 10) return null;
  const wordCount = words.length;
  const sentenceCount = countSentences(text);
  const totalSyllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
  const complexWordCount = countComplexWords(words);
  const scoredWords = words.join(" ");
  const charCount = countCharacters(scoredWords);
  const letterCount = countLetters(scoredWords);

  const avgWordsPerSentence = wordCount / sentenceCount;
  const avgSyllablesPerWord = totalSyllables / wordCount;
  const polysyllablePercent = (complexWordCount / wordCount) * 100;

  const fleschKincaidGrade = Math.round((0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59) * 10) / 10;
  const fleschReadingEase = Math.round((206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord) * 10) / 10;
  const gunningFog = Math.round((0.4 * (avgWordsPerSentence + polysyllablePercent)) * 10) / 10;
  const colemanLiau = Math.round((0.0588 * (letterCount / wordCount * 100) - 0.296 * (sentenceCount / wordCount * 100) - 15.8) * 10) / 10;
  const smog = Math.round((1.043 * Math.sqrt(complexWordCount * (30 / sentenceCount)) + 3.1291) * 10) / 10;
  const ari = Math.round((4.71 * (charCount / wordCount) + 0.5 * avgWordsPerSentence - 21.43) * 10) / 10;

  return {
    fleschKincaidGrade,
    fleschReadingEase,
    gunningFog,
    colemanLiau,
    smog,
    ari,
    wordCount,
    sentenceCount,
    syllableCount: totalSyllables,
    avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
    avgSyllablesPerWord: Math.round(avgSyllablesPerWord * 10) / 10,
    complexWordCount,
  };
}

function getGradeLabel(grade: number): string {
  if (grade < 0) return "Below typical grade range";
  if (grade <= 1) return "Kindergarten";
  if (grade <= 2) return "1st-2nd Grade";
  if (grade <= 3) return "3rd Grade";
  if (grade <= 4) return "4th Grade";
  if (grade <= 5) return "5th Grade";
  if (grade <= 6) return "6th Grade";
  if (grade <= 7) return "7th Grade";
  if (grade <= 8) return "8th Grade";
  if (grade <= 9) return "9th Grade";
  if (grade <= 10) return "10th Grade";
  if (grade <= 12) return "11th-12th Grade";
  if (grade <= 14) return "College (Freshman-Sophomore)";
  if (grade <= 16) return "College (Junior-Senior)";
  return "Graduate Level";
}

function getReadingEaseLabel(score: number): string {
  if (score >= 90) return "Very Easy (5th grade)";
  if (score >= 80) return "Easy (6th grade)";
  if (score >= 70) return "Fairly Easy (7th grade)";
  if (score >= 60) return "Standard (8th-9th grade)";
  if (score >= 50) return "Fairly Difficult (10th-12th grade)";
  if (score >= 30) return "Difficult (College)";
  return "Very Difficult (College Graduate)";
}

interface ScoreCardProps {
  name: string;
  score: string | number;
  label: string;
  color?: string;
}

function ScoreCard({ name, score, label, color }: ScoreCardProps) {
  return (
    <div
      className="p-4 rounded-lg border"
      style={{
        borderColor: "var(--color-hairline)",
        backgroundColor: "var(--color-canvas-soft)",
      }}
    >
      <div className="text-xs font-medium mb-1" style={{ color: "var(--color-mute)" }}>
        {name}
      </div>
      <div className="text-2xl font-bold mb-1" style={{ color: color || "var(--color-ink)" }}>
        {score}
      </div>
      <div className="text-xs" style={{ color: "var(--color-body)" }}>
        {label}
      </div>
    </div>
  );
}

export default function ReadabilityScore() {
  const { markInteraction, recordSuccess, clearInteraction } = useToolTelemetry();
  const [input, setInput] = useState("");
  const [scores, setScores] = useState<ReadabilityScores | null>(null);
  const [error, setError] = useState("");

  const handleAnalyze = useCallback(() => {
    markInteraction();
    if (!input.trim()) {
      setError("Please enter some text to analyze.");
      setScores(null);
      return;
    }
    const result = calculateScores(input);
    if (!result) {
      setError("Enter English prose with at least 10 words containing A–Z letters. Numbers or punctuation alone cannot be scored.");
      setScores(null);
      return;
    }
    setError("");
    setScores(result);
    recordSuccess("analyze");
  }, [input]);

  const handleClear = useCallback(() => {
    clearInteraction();
    setInput("");
    setScores(null);
    setError("");
  }, []);

  return (
    <div onChangeCapture={markInteraction} className="space-y-6">
      <div>
        <label htmlFor="readability-input" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
          Paste your text
        </label>
        <textarea
          id="readability-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste English prose with at least 10 words..."
          rows={8}
          className="w-full p-4 border rounded-lg text-sm resize-y outline-none transition-colors duration-150"
          style={{
            backgroundColor: "var(--color-canvas-soft)",
            borderColor: "var(--color-hairline)",
            color: "var(--color-ink)",
          }}
        />
      </div>

      <ErrorBanner message={error} />

      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-lg border" style={{ borderColor: "var(--color-hairline)", backgroundColor: "var(--color-canvas)" }}>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleAnalyze}
            className="btn-primary btn-sm"
            style={{ backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)" }}
          >
            Analyze readability
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="text-xs px-3 py-1.5 rounded transition-colors duration-150 border"
            style={{ borderColor: "var(--color-hairline)", color: "var(--color-mute)" }}
          >
            Clear
          </button>
        </div>
      </div>

      {scores && (
        <div className="space-y-6">
          <p className="text-sm leading-relaxed text-body">
            These are heuristic estimates for English prose, not a language or comprehension test.
            Short samples, names and abbreviations make the estimates less reliable. Formula results
            are shown without clamping, so they can fall outside the usual score bands.
            {scores.sentenceCount < 30 && <> The <a href="https://ogg.osu.edu/media/documents/health_lit/WRRSMOG_Readability_Formula_G._Harry_McLaughlin__1969_.pdf" className="text-link underline">original SMOG method</a> uses a 30-sentence sample; this shorter-sample value is exploratory.</>}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <ScoreCard
              name="Flesch-Kincaid Grade Level"
              score={scores.fleschKincaidGrade}
              label={getGradeLabel(scores.fleschKincaidGrade)}
            />
            <ScoreCard
              name="Flesch Reading Ease"
              score={scores.fleschReadingEase}
              label={getReadingEaseLabel(scores.fleschReadingEase)}
              color="var(--color-link)"
            />
            <ScoreCard
              name="Gunning Fog Index"
              score={scores.gunningFog}
              label={getGradeLabel(scores.gunningFog)}
            />
            <ScoreCard
              name="Coleman-Liau Index"
              score={scores.colemanLiau}
              label={getGradeLabel(scores.colemanLiau)}
            />
            <ScoreCard
              name="SMOG Index"
              score={scores.smog}
              label={scores.sentenceCount < 30 ? "Exploratory · fewer than 30 sentences" : getGradeLabel(scores.smog)}
            />
            <ScoreCard
              name="Automated Readability Index"
              score={scores.ari}
              label={getGradeLabel(scores.ari)}
            />
          </div>

          <div
            className="p-4 rounded-lg border"
            style={{ borderColor: "var(--color-hairline)", backgroundColor: "var(--color-canvas-soft-2)" }}
          >
            <span className="block text-sm font-medium mb-3" style={{ color: "var(--color-ink)" }}>
              Text statistics
            </span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-xs" style={{ color: "var(--color-mute)" }}>Words</span>
                <p className="text-lg font-semibold" style={{ color: "var(--color-ink)" }}>{scores.wordCount.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-xs" style={{ color: "var(--color-mute)" }}>Sentences</span>
                <p className="text-lg font-semibold" style={{ color: "var(--color-ink)" }}>{scores.sentenceCount.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-xs" style={{ color: "var(--color-mute)" }}>Syllables</span>
                <p className="text-lg font-semibold" style={{ color: "var(--color-ink)" }}>{scores.syllableCount.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-xs" style={{ color: "var(--color-mute)" }}>Complex words (3+ syllables)</span>
                <p className="text-lg font-semibold" style={{ color: "var(--color-ink)" }}>{scores.complexWordCount.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-xs" style={{ color: "var(--color-mute)" }}>Avg words per sentence</span>
                <p className="text-lg font-semibold" style={{ color: "var(--color-ink)" }}>{scores.avgWordsPerSentence}</p>
              </div>
              <div>
                <span className="text-xs" style={{ color: "var(--color-mute)" }}>Avg syllables per word</span>
                <p className="text-lg font-semibold" style={{ color: "var(--color-ink)" }}>{scores.avgSyllablesPerWord}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
