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

With a comma delimiter and the header option enabled, the expected result is:

```json
[
  {
    "name": "Ada",
    "role": "Engineer",
    "note": "Uses commas, safely"
  }
]
```

The comma inside the quoted note belongs to the value and must not create another column. Values stay strings: `00123` stays `"00123"`.

## Checks before converting

- Confirm the delimiter. A European spreadsheet export may use semicolons because commas are decimal separators.
- Make headers unique and non-empty. Duplicate names cannot map cleanly to distinct object properties.
- Inspect quote escaping. In conventional CSV, a quote inside a quoted field is represented by two quotes.
- Decide how to handle blank cells. Empty string, `null`, and missing property have different meanings.
- Remember that CSV has weak type information. The value `00123` may be an identifier that must remain a string, not the number 123.

## Inputs that need manual review

Do not rely on this converter to validate every CSV dialect. For example, `name,name` uses duplicate property names; a JSON object cannot preserve both columns under the same key. An unfinished quoted field such as `Ada,"unfinished` is malformed. Check for an error before using the output, and repair the source rather than guessing where the quote belongs. Rows with a different number of fields than the header also need correction. A successful conversion is not schema validation.

The browser converter processes the whole input locally and is useful for small exports, test fixtures, and one-off transformations. It trims cell edges, keeps values as strings and skips wholly blank rows; review whether those choices fit your data. Review records near the beginning and end, especially quotes and missing fields. For unknown encodings, strict schemas or automated pipelines, use a mature CSV library with an explicit dialect and validation rules.

To move in the other direction, use [JSON to CSV](/tools/json-to-csv/), keeping in mind that nested objects need a deliberate flattening strategy.
