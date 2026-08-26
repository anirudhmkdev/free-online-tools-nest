---
title: "CSV to JSON: Delimiters, Quotes, Headers, and Type Pitfalls"
description: "Convert CSV to JSON reliably by handling delimiters, quoted fields, headers, missing values, and data types."
pubDate: 2026-08-26
tags: ["csv", "json", "data-conversion"]
draft: false
---

CSV is a family of conventions, not one perfectly uniform format. Commas are common, but exports may use semicolons or tabs. Quoted fields can contain delimiters, quotes, and sometimes line breaks. Those details determine whether a conversion produces useful JSON or a shifted table.

Paste this into the [CSV to JSON Converter](/tools/csv-to-json/):

```csv
name,role,note
Ada,Engineer,"Uses commas, safely"
```

The expected result is an array containing one object with keys from the header row. The comma inside the quoted note belongs to the value and must not create another column.

## Checks before converting

- Confirm the delimiter. A European spreadsheet export may use semicolons because commas are decimal separators.
- Make headers unique and non-empty. Duplicate names cannot map cleanly to distinct object properties.
- Inspect quote escaping. In conventional CSV, a quote inside a quoted field is represented by two quotes.
- Decide how to handle blank cells. Empty string, `null`, and missing property have different meanings.
- Remember that CSV has weak type information. The value `00123` may be an identifier that must remain a string, not the number 123.

The browser converter processes the whole input locally and is useful for small exports, test fixtures, and one-off transformations. Review several records near the beginning and end, especially rows containing quotes or missing fields. For large files, unknown encodings, multiline records, strict schemas, or automated pipelines, use a mature CSV library in Python, Node, or your database.

To move in the other direction, use [JSON to CSV](/tools/json-to-csv/), keeping in mind that nested objects need a deliberate flattening strategy.
