const STOP_WORDS: Set<string> = new Set([
  "the","a","an","and","or","but","in","on","at","to","for","of","by","with","from",
  "is","are","was","were","be","been","being","have","has","had","do","does","did",
  "will","would","shall","should","may","might","must","i","you","he","she","it",
  "we","they","this","that","these","those","am","its","my","your","his","her",
  "our","their","me","him","us","them","not","no","nor","so","if","as","than",
  "then","up","down","out","off","over","under","again","further","once","here",
  "there","when","where","why","how","all","each","every","both","few","more",
  "most","other","some","such","only","own","same","too","very","just","about",
  "above","after","before","between","through","during","without","within","along",
  "around","among","because","into","onto","upon","also","any","into","now",
]);

function splitSentences(text: string): string[] {
  const raw = text.match(/[^.!?\n]+[.!?\n]*/g);
  return (raw || []).map((s) => s.trim()).filter((s) => s.length > 0);
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 0 && !STOP_WORDS.has(w));
}

export interface ScoredSentence {
  text: string;
  score: number;
}

export function summarize(text: string, sentenceCount: number): ScoredSentence[] {
  if (!Number.isInteger(sentenceCount) || sentenceCount < 1 || sentenceCount > 100) throw new Error("Choose between 1 and 100 sentences.");
  if (text.length > 100000) throw new Error("Use at most 100,000 characters for this browser tool.");
  if ([...text].some(char => /\p{L}/u.test(char) && !/\p{Script=Latin}/u.test(char))) throw new Error("This sentence selector supports English text only.");
  const sentences = splitSentences(text);
  if (sentences.length === 0) return [];

  // Count word frequencies across the entire text
  const wordFreq: Record<string, number> = {};
  sentences.forEach((s) => {
    tokenize(s).forEach((w) => {
      wordFreq[w] = (wordFreq[w] || 0) + 1;
    });
  });

  // Score each sentence by sum of word frequencies
  const scored: ScoredSentence[] = sentences.map((s) => {
    const words = tokenize(s);
    if (words.length === 0) return { text: s, score: 0 };
    const rawScore = words.reduce((sum, w) => sum + (wordFreq[w] || 0), 0);
    const score = rawScore / words.length; // normalize by sentence length
    return { text: s, score };
  });

  return scored.map((sentence, index) => ({ sentence, index }))
    .sort((a, b) => b.sentence.score - a.sentence.score || a.index - b.index)
    .slice(0, sentenceCount)
    .sort((a, b) => a.index - b.index)
    .map(item => item.sentence);
}
