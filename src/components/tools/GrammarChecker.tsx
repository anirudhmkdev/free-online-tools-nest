import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useCallback } from "react";

interface GrammarIssue {
  type: string;
  line: number;
  context: string;
  suggestion: string;
}

interface CategoryCount {
  label: string;
  count: number;
  color: string;
}

const MISSPELLINGS: [RegExp, string][] = [
  [/\btheirs\b/gi, "theirs (possessive) → their (if ownership), there (if location)"],
  [/\btheir\b(?=\s+(gonna|gotta|wanna|is|are|was|were|has|have|had|will|would|could|should|do|does|did|can|shall|may|might|mustn't|don't|doesn't|didn't|won't|wouldn't|couldn't|shouldn't|isn't|aren't|wasn't|weren't|haven't|hasn't|hadn't|need|dare|ought))\b/gi, "their → there (existential)"],
  [/\byour\b(?=\s+(gonna|gotta|wanna|is|are|was|were|has|have|had|will|would|could|should|do|does|did|can|shall|may|might|isn't|aren't|wasn't|weren't|haven't|hasn't|hadn't))\b/gi, "your → you're (you are)"],
  [/\byou're\b(?=\s+(book|car|house|name|idea|work|job|life|time|way|day|friend|family|money|world|home|hand|mind|heart|eyes|face|body|plan|problem|solution|project|team|company|website|account|email))\b/gi, "you're → your (possessive)"],
  [/\bits\b(?=\s+(not|a|an|the|very|really|quite|too|so|more|most|also|just|only|even|still|already|always|never|often|sometimes|usually|going|been|being|having|doing|making|getting|taking|giving|finding|keeping|putting|setting|letting|looking|showing|trying|asking|needing|using|working|playing|running|moving|starting|stopping|helping|thinking|knowing|understanding|wanting|expecting|hoping)\b)/gi, "its (possessive) → it's (it is)"],
  [/\bit's\b(?=\s+(book|car|house|name|idea|work|job|life|time|way|day|friend|family|money|world|home|hand|mind|heart|eyes|face|body|plan|problem|solution|project|team|company|website|account|email|color|size|shape|weight|height|depth|width|length|value|price|cost|quality|status|type|kind|sort|style|form|version|edition|model|brand|maker|owner|user|member|part|side|top|bottom|inside|outside|front|back|middle|center|edge|corner|end|start|beginning|middle|end|left|right)\b)/gi, "it's → its (possessive)"],
  [/\baffect\b(?!\s+(the|a|an|his|her|its|our|their|this|that|these|those|each|every|some|any|no|many|much|few|little|more|most|several|all|both|neither|either)\s+(change|difference|improvement|reduction|increase|decrease|shift|variation|alteration|modification|adjustment|transformation|consequence|result|outcome|effect|impact)\b)/gi, "affect (verb) → effect (noun)"],
  [/\beffect\b(?=\s+(the|a|an|his|her|its|our|their|this|that|these|those|each|every|some|any|no|many|much|few|little|more|most|several|all|both|neither|either)\s+(change|improve|reduce|increase|decrease|shift|alter|modify|adjust|transform|result|impact)\b)/gi, "effect (noun) → affect (verb)"],
  [/\bthen\b(?=\s+(is|are|was|were|has|have|had|do|does|did|will|would|could|should|may|might|shall|can|of|a|an|the|this|that|these|those)\b)/gi, "then (time) → than (comparison)"],
  [/\bthan\b(?=\s+(I|we|you|he|she|it|they|we'll|you'll|he'll|she'll|they'll|we're|you're|he's|she's|it's|they're|we've|you've|they've)\b)/gi, "than (comparison) → then (time)"],
  [/\bloose\b/gi, "loose (not tight) → lose (misplace)"],
  [/\bdefinatly\b/gi, "definatly → definitely"],
  [/\bdefinately\b/gi, "definately → definitely"],
  [/\bseperate\b/gi, "seperate → separate"],
  [/\brecieve\b/gi, "recieve → receive"],
  [/\bacheive\b/gi, "acheive → achieve"],
  [/\baccomodate\b/gi, "accomodate → accommodate"],
  [/\bembarass\b/gi, "embarass → embarrass"],
  [/\boccured\b/gi, "occured → occurred"],
  [/\boccuring\b/gi, "occuring → occurring"],
  [/\btommorow\b/gi, "tommorow → tomorrow"],
  [/\bcalender\b/gi, "calender → calendar"],
  [/\bconcious\b/gi, "concious → conscious"],
  [/\bdefinately\b/gi, "definately → definitely"],
  [/\bdesparate\b/gi, "desparate → desperate"],
  [/\bdissapear\b/gi, "dissapear → disappear"],
  [/\bexistance\b/gi, "existance → existence"],
  [/\bgoverment\b/gi, "goverment → government"],
  [/\bguage\b/gi, "guage → gauge"],
  [/\bharass\b/gi, "harass → harass"],
  [/\bimmediately\b/gi, "immediatly → immediately"],
  [/\bindependant\b/gi, "independant → independent"],
  [/\blightening\b/gi, "lightening → lightning (weather) / lightening (weight)"],
  [/\bmaintainance\b/gi, "maintainance → maintenance"],
  [/\bneccessary\b/gi, "neccessary → necessary"],
  [/\bnoticable\b/gi, "noticable → noticeable"],
  [/\boccassion\b/gi, "occassion → occasion"],
  [/\bparalel\b/gi, "paralel → parallel"],
  [/\bpriviledge\b/gi, "priviledge → privilege"],
  [/\bpronounciation\b/gi, "pronounciation → pronunciation"],
  [/\bpublically\b/gi, "publically → publicly"],
  [/\breccommend\b/gi, "reccommend → recommend"],
  [/\brefering\b/gi, "refering → referring"],
  [/\brelevent\b/gi, "relevent → relevant"],
  [/\bresistence\b/gi, "resistince → resistance"],
  [/\bwierd\b/gi, "wierd → weird"],
  [/\bwritting\b/gi, "writting → writing"],
  [/\balthought\b/gi, "althought → although"],
  [/\bapparant\b/gi, "apparant → apparent"],
  [/\bcomission\b/gi, "comission → commission"],
  [/\bcommitee\b/gi, "commitee → committee"],
  [/\bconceed\b/gi, "conceed → concede"],
  [/\bconciousness\b/gi, "conciousness → consciousness"],
  [/\bcuriousity\b/gi, "curiousity → curiosity"],
  [/\bdefendent\b/gi, "defendent → defendant"],
  [/\bdilema\b/gi, "dilema → dilemma"],
  [/\bdisappear\b/gi, "dissapear → disappear"],
  [/\beight\b/gi, "eight (check: → eighth if ordinal)"],
];

const OVERUSED_WORDS = ["very", "really", "literally", "actually", "basically", "amazing", "incredible", "awesome"];

function getLineNumber(text: string, index: number): number {
  return text.slice(0, index).split("\n").length;
}

function getLineContext(text: string, index: number): string {
  const lines = text.split("\n");
  let charCount = 0;
  for (let i = 0; i < lines.length; i++) {
    charCount += lines[i].length + 1;
    if (charCount > index) {
      return lines[i].trim();
    }
  }
  return "";
}

function checkGrammar(text: string): { issues: GrammarIssue[]; categories: CategoryCount[] } {
  const issues: GrammarIssue[] = [];
  const categoryMap: Record<string, number> = {
    "Repeated Words": 0,
    "Misspellings": 0,
    "Capitalization": 0,
    "Double Spaces": 0,
    "Missing Punctuation": 0,
    "Overused Words": 0,
  };

  if (!text.trim()) return { issues, categories: [] };

  // Repeated words
  const repeatedRegex = /\b(\w+)\s+\1\b/gi;
  let match;
  while ((match = repeatedRegex.exec(text)) !== null) {
    issues.push({
      type: "Repeated Words",
      line: getLineNumber(text, match.index),
      context: getLineContext(text, match.index),
      suggestion: `Remove duplicate "${match[1]}"`,
    });
    categoryMap["Repeated Words"]++;
  }

  // Misspellings
  for (const [pattern, suggestion] of MISSPELLINGS) {
    const ms = [...text.matchAll(pattern)];
    for (const m of ms) {
      const start = Math.max(0, (m.index || 0) - 20);
      issues.push({
        type: "Misspellings",
        line: getLineNumber(text, m.index || 0),
        context: text.slice(start, (m.index || 0) + (m[0]?.length || 0) + 20).replace(/\n/g, " ").trim(),
        suggestion,
      });
      categoryMap["Misspellings"]++;
    }
  }

  // Capitalization errors (first word of sentence)
  const sentences = text.split("\n").map((line, idx) => ({ line, idx }));
  for (const { line: l, idx } of sentences) {
    const trimmed = l.trim();
    if (!trimmed) continue;
    const firstWordMatch = trimmed.match(/^[a-z]/);
    if (firstWordMatch) {
      issues.push({
        type: "Capitalization",
        line: idx + 1,
        context: trimmed.slice(0, 50),
        suggestion: `Capitalize "${trimmed.charAt(0)}" at start of sentence`,
      });
      categoryMap["Capitalization"]++;
    }
  }

  // Double spaces
  const doubleSpaceRegex = /  +/g;
  while ((match = doubleSpaceRegex.exec(text)) !== null) {
    issues.push({
      type: "Double Spaces",
      line: getLineNumber(text, match.index),
      context: getLineContext(text, match.index),
      suggestion: "Replace double spaces with single space",
    });
    categoryMap["Double Spaces"]++;
  }

  // Missing punctuation at end of sentence
  for (const { line: l, idx } of sentences) {
    const trimmed = l.trim();
    if (!trimmed || trimmed.length < 3) continue;
    const lastChar = trimmed[trimmed.length - 1];
    if (/[a-zA-Z0-9'"\]]/.test(lastChar) && !trimmed.endsWith("...") && !trimmed.endsWith("?")) {
      issues.push({
        type: "Missing Punctuation",
        line: idx + 1,
        context: trimmed.slice(-40),
        suggestion: `Add punctuation at end of sentence`,
      });
      categoryMap["Missing Punctuation"]++;
    }
  }

  // Overused words
  const words = text.split(/\s+/);
  const overusedRegex = new RegExp(`\\b(${OVERUSED_WORDS.join("|")})\\b`, "gi");
  while ((match = overusedRegex.exec(text)) !== null) {
    issues.push({
      type: "Overused Words",
      line: getLineNumber(text, match.index),
      context: getLineContext(text, match.index),
      suggestion: `Consider removing or replacing "${match[0]}" — it adds little meaning`,
    });
    categoryMap["Overused Words"]++;
  }

  const categoryColors: Record<string, string> = {
    "Repeated Words": "#ef4444",
    "Misspellings": "#f59e0b",
    "Capitalization": "#3b82f6",
    "Double Spaces": "#8b5cf6",
    "Missing Punctuation": "#10b981",
    "Overused Words": "#ec4899",
  };

  const categories: CategoryCount[] = Object.entries(categoryMap)
    .filter(([, count]) => count > 0)
    .map(([label, count]) => ({
      label,
      count,
      color: categoryColors[label] || "var(--color-mute)",
    }));

  return { issues, categories };
}

export default function GrammarChecker() {
  const { markInteraction, recordSuccess } = useToolTelemetry();
  const [text, setText] = useState("");
  const [issues, setIssues] = useState<GrammarIssue[]>([]);
  const [categories, setCategories] = useState<CategoryCount[]>([]);
  const [checked, setChecked] = useState(false);

  const handleCheck = useCallback(() => {
    markInteraction();
    if (!text.trim()) {
      setIssues([]);
      setCategories([]);
      setChecked(false);
      return;
    }
    const result = checkGrammar(text);
    setIssues(result.issues);
    setCategories(result.categories);
    recordSuccess("check");
    setChecked(true);
  }, [text, markInteraction, recordSuccess]);

  const totalIssues = issues.length;

  return (
    <div className="space-y-6">
      {/* Input */}
      <div>
        <label htmlFor="gc-input" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
          Text to Check
        </label>
        <textarea
          id="gc-input"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setChecked(false);
          }}
          placeholder="Paste English text to review common pattern suggestions..."
          rows={8}
          className="w-full p-4 border rounded-lg text-base resize-y outline-none transition-colors duration-150"
          style={{
            backgroundColor: "var(--color-canvas-soft)",
            borderColor: "var(--color-hairline)",
            color: "var(--color-ink)",
            fontFamily: "var(--font-sans)",
          }}
        />
        <div className="mt-1 text-xs" style={{ color: "var(--color-mute)" }}>
          {text.length} characters | {text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0} words
        </div>
      </div>

      {/* Check button */}
      <button
        type="button"
        onClick={handleCheck}
        className="px-6 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150"
        style={{ backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)" }}
      >
        Check Grammar
      </button>

      {/* Results */}
      {checked && (
        <>
          {totalIssues > 0 ? (
            <div className="space-y-6">
              {/* Summary */}
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-sm font-semibold" style={{ color: "var(--color-ink)" }}>
                  Found <span style={{ color: "var(--color-error)" }}>{totalIssues}</span> issue{totalIssues !== 1 ? "s" : ""}
                </span>
                {categories.map((cat) => (
                  <span
                    key={cat.label}
                    className="text-xs px-2.5 py-1 rounded-full"
                    style={{
                      backgroundColor: cat.color + "18",
                      color: cat.color,
                      border: `1px solid ${cat.color}40`,
                    }}
                  >
                    {cat.label}: {cat.count}
                  </span>
                ))}
              </div>

              {/* Issues list */}
              <div className="space-y-2.5">
                {issues.map((issue, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg border text-sm"
                    style={{
                      backgroundColor: "var(--color-canvas-soft)",
                      borderColor: "var(--color-hairline)",
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold"
                        style={{
                          backgroundColor: (() => {
                            const m: Record<string, string> = {
                              "Repeated Words": "#ef4444",
                              "Misspellings": "#f59e0b",
                              "Capitalization": "#3b82f6",
                              "Double Spaces": "#8b5cf6",
                              "Missing Punctuation": "#10b981",
                              "Overused Words": "#ec4899",
                            };
                            return (m[issue.type] || "var(--color-mute)") + "20";
                          })(),
                          color: (() => {
                            const m: Record<string, string> = {
                              "Repeated Words": "#ef4444",
                              "Misspellings": "#f59e0b",
                              "Capitalization": "#3b82f6",
                              "Double Spaces": "#8b5cf6",
                              "Missing Punctuation": "#10b981",
                              "Overused Words": "#ec4899",
                            };
                            return m[issue.type] || "var(--color-mute)";
                          })(),
                        }}
                      >
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="text-xs font-semibold uppercase tracking-wider"
                            style={{ color: (() => {
                              const m: Record<string, string> = {
                                "Repeated Words": "#ef4444",
                                "Misspellings": "#f59e0b",
                                "Capitalization": "#3b82f6",
                                "Double Spaces": "#8b5cf6",
                                "Missing Punctuation": "#10b981",
                                "Overused Words": "#ec4899",
                              };
                              return m[issue.type] || "var(--color-mute)";
                            })() }}
                          >
                            {issue.type}
                          </span>
                          <span style={{ color: "var(--color-mute)" }}>
                            Line {issue.line}
                          </span>
                        </div>
                        <div className="mb-1 font-mono text-xs break-all" style={{ color: "var(--color-body)" }}>
                          "...{issue.context}..."
                        </div>
                        <div style={{ color: "var(--color-ink)" }}>
                          <span className="font-medium">Suggestion: </span>{issue.suggestion}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div
              className="p-6 rounded-lg text-center"
              style={{ backgroundColor: "var(--color-canvas-soft-2)" }}
            >
              <div className="text-xl mb-1">👍</div>
              <div className="text-sm font-medium" style={{ color: "#22c55e" }}>
                No issues found by these checks.
              </div>
              <div className="text-xs mt-1" style={{ color: "var(--color-mute)" }}>
                These limited English pattern checks do not certify that your text is correct. Review it manually.
              </div>
            </div>
          )}
        </>
      )}

      {!checked && (
        <div className="py-8 text-center text-sm" style={{ color: "var(--color-mute)" }}>
          Enter English text and click "Check Grammar" to review common patterns.
        </div>
      )}
    </div>
  );
}
