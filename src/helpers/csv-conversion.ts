/** Parse delimited text without discarding cells or coercing string values. */
export function parseCsv(text: string, delimiter = ","): string[][] {
  if (delimiter.length !== 1 || /["\r\n]/.test(delimiter)) {
    throw new Error("Choose a single valid delimiter.");
  }
  const input = text.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  let closedQuote = false;
  let rowTouched = false;

  const finishField = () => {
    row.push(field);
    field = "";
    closedQuote = false;
  };
  const finishRow = () => {
    finishField();
    // Ignore blank physical lines, but retain quoted empty fields and empty cells.
    if (rowTouched) rows.push(row);
    row = [];
    rowTouched = false;
  };

  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (quoted) {
      if (char === '"') {
        if (input[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          quoted = false;
          closedQuote = true;
        }
      } else {
        field += char;
      }
      continue;
    }
    if (char === delimiter) {
      rowTouched = true;
      finishField();
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && input[i + 1] === "\n") i++;
      finishRow();
    } else if (char === '"') {
      if (field !== "" || closedQuote) throw new Error("A quoted field must start with a quote.");
      quoted = true;
      rowTouched = true;
    } else {
      if (closedQuote) throw new Error("Unexpected text after a closing quote.");
      field += char;
      if (char.trim()) rowTouched = true;
    }
  }
  if (quoted) throw new Error("A quoted field is missing its closing quote.");
  if (rowTouched || row.length > 0) finishRow();
  return rows;
}

/** Validate table shape before creating JSON, preserving every source value. */
export function csvToRecords(rows: string[][], hasHeader: boolean): Record<string, string>[] | string[][] {
  if (rows.length === 0) return [];
  const width = rows[0].length;
  rows.forEach((row, index) => {
    if (row.length !== width) {
      throw new Error(`Row ${index + 1} has ${row.length} fields; expected ${width}.`);
    }
  });
  if (!hasHeader) return rows;
  const headers = rows[0].map((header) => header.trim());
  if (headers.some((header) => !header)) throw new Error("Each header must have a name.");
  if (new Set(headers).size !== headers.length) throw new Error("Header names must be unique.");
  return rows.slice(1).map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index]])));
}
