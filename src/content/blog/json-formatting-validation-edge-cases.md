---
title: "JSON Formatting and Validation: Edge Cases That Break Real Payloads"
description: "A practical guide to JSON parsing errors, numbers, Unicode, duplicate keys, and validation with reproducible examples."
pubDate: 2026-08-26
tags: ["json", "developer-tools", "validation"]
draft: false
---

JSON looks simple until an API response contains a trailing comma, an unescaped control character, or a number that JavaScript cannot represent precisely. Formatting makes structure readable; validation answers the more important question: can a standards-compliant parser accept the value?

Try this in the [JSON Formatter](/tools/json-formatter/):

```json
{"user":{"id":7,"name":"Ada"},"active":true}
```

The tool uses the browser's native `JSON.parse` and `JSON.stringify` behavior. It produces indented output because the input is valid JSON. Change `true` to `True`, add a comma after the final property, or wrap keys in single quotes and parsing will fail. Those forms may appear in JavaScript or Python, but they are not JSON.

With the two-space setting, the output is:

```json
{
  "user": {
    "id": 7,
    "name": "Ada"
  },
  "active": true
}
```

Try `{"active":True}` or `{"active":true,}` next. Both should produce a parsing error and no formatted result. The exact browser error wording can vary. Correct them to `{"active":true}` and format again. This validates syntax only; it cannot establish that `active` is the field your application expects.

## Edge cases worth checking

- JSON allows strings, numbers, objects, arrays, booleans, and `null`; it does not allow comments, `undefined`, `NaN`, or `Infinity`.
- Property names and string values require double quotes. Newlines inside strings must be escaped.
- Duplicate object keys are syntactically possible, but parsers commonly keep the last value. Avoid them because behavior and intent become ambiguous.
- Large integers can exceed JavaScript's safe integer range. An identifier such as `9007199254740993` may lose precision when treated as a number; transmit it as a string when every digit matters.
- A byte-order mark or invisible control character at the beginning of copied text can cause a confusing error.

Formatting is not schema validation. A payload can be valid JSON and still omit a required `email` field or use the wrong type. Use JSON Schema or application validation after syntax checking.

For repeatable pipelines, command-line `jq`, an IDE, or a schema validator is a better choice. For a private one-off payload, the browser formatter is useful because the text is parsed locally. Our [testing standards](/standards/) explain how that processing claim is verified.

Primary reference: [ECMA-404 JSON data interchange syntax](https://ecma-international.org/publications-and-standards/standards/ecma-404/).
