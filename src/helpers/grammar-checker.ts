export interface GrammarIssue {
  type: string;
  line: number;
  context: string;
  suggestion: string;
}

export interface CategoryCount {
  label: string;
  count: number;
  color: string;
}

const MISSPELLINGS: [RegExp, string][] = [
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
  [/\bdesparate\b/gi, "desparate → desperate"],
  [/\bdissapear\b/gi, "dissapear → disappear"],
  [/\bexistance\b/gi, "existance → existence"],
  [/\bgoverment\b/gi, "goverment → government"],
  [/\bimmediatly\b/gi, "immediatly → immediately"],
  [/\bindependant\b/gi, "independant → independent"],
  [/\bmaintainance\b/gi, "maintainance → maintenance"],
  [/\bneccessary\b/gi, "neccessary → necessary"],
  [/\bnoticable\b/gi, "noticable → noticeable"],
  [/\boccassion\b/gi, "occassion → occasion"],
  [/\bparalel\b/gi, "paralel → parallel"],
  [/\bpriviledge\b/gi, "priviledge → privilege"],
  [/\bpronounciation\b/gi, "pronounciation → pronunciation"],
  [/\breccommend\b/gi, "reccommend → recommend"],
  [/\brefering\b/gi, "refering → referring"],
  [/\brelevent\b/gi, "relevent → relevant"],
  [/\bwierd\b/gi, "wierd → weird"],
  [/\bwritting\b/gi, "writting → writing"],
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

export function checkGrammar(text: string): { issues: GrammarIssue[]; categories: CategoryCount[] } {
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
      suggestion: `Check whether to remove duplicate "${match[1]}"`,
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
        suggestion: `Capitalize "${trimmed.charAt(0)}" at start of line`,
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
        suggestion: `Check whether this line needs ending punctuation`,
      });
      categoryMap["Missing Punctuation"]++;
    }
  }

  // Overused words
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

