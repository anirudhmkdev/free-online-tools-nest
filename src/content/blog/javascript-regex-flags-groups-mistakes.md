---
title: "JavaScript Regular Expressions: Flags, Groups, and Common Mistakes"
description: "Test JavaScript regex patterns safely and understand flags, capture groups, escaping, and backtracking pitfalls."
pubDate: 2026-08-26
tags: ["regex", "javascript", "developer-tools"]
draft: false
---

Regular-expression syntax is not universal. Our [Regex Tester](/tools/regex-tester/) constructs the browser's native JavaScript `RegExp`, so its behavior follows ECMAScript rather than PCRE, Python, Java, or .NET.

Start with a small example. Pattern `\b\d{4}\b` against `Copyright 2026` matches `2026`. Add the `g` flag to find every four-digit token rather than stopping at the first. The `i` flag ignores case, `m` changes how line anchors behave, and `s` lets a dot match line terminators. Unicode-aware behavior may require `u`.

## Groups and replacements

Parentheses create capture groups. Pattern `(\w+)@(\w+\.\w+)` captures a local part and domain, but it is only a demonstration, not a complete email validator. Named groups such as `(?<year>\d{4})` can make replacements easier to read in supported browsers.

Common failures include:

- copying `/pattern/g` into a field that expects only `pattern`, then accidentally matching literal slashes;
- forgetting that a backslash inside JavaScript source code may need a second level of escaping;
- assuming `^` and `$` always mean line boundaries without the `m` flag;
- using a greedy `.*` where a narrower character class would be safer;
- writing nested ambiguous repetitions that cause catastrophic backtracking and freeze the tab.

Test with representative matches, near misses, empty strings, long strings, and Unicode text. A green match on one sample is not proof that a validator is correct. For production, run the expression in its target language and place time or input limits around untrusted patterns.

Primary reference: [MDN JavaScript regular expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions).
