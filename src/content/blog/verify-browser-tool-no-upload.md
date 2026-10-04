---
title: "How to Verify That a Browser Tool Is Not Uploading Your Files"
description: "Use browser DevTools and implementation checks to verify whether a local web tool sends your input over the network."
pubDate: 2026-08-26
tags: ["privacy", "browser-tools", "testing"]
draft: false
---

“Runs in your browser” should be a testable processing claim. It does not mean the page makes zero network requests: fonts, analytics, consent systems, and advertising can still load. The important question is whether the text or file supplied to a tool is transmitted to a processing server.

## A practical DevTools check

1. Open a tool such as the [Image Compressor](/tools/image-compressor/) and launch browser DevTools.
2. Select the Network panel, enable “Preserve log,” and clear existing requests.
3. Use a harmless test file with a distinctive filename or text marker. Do not use confidential data during the test.
4. First inspect all request types, then use Fetch/XHR and WebSocket filters to narrow the list. Inspect new URLs, methods, request payloads, form data and WebSocket frames while processing and downloading. Beacon, document and image requests can carry data too.
5. Search the captured request list for the distinctive marker and inspect request bodies. A filename may be absent even when file bytes are sent, so its absence alone proves little. Local `blob:` download URLs and in-memory canvas operations are not uploads.
6. Repeat after changing settings, copying output, and downloading the result.

Also inspect the implementation. File tools should read a user-selected `File` with browser APIs such as `FileReader`, `URL.createObjectURL`, Canvas, `pdf-lib`, or `pdfjs-dist`. Search for `fetch`, `XMLHttpRequest`, `sendBeacon`, form submissions, or third-party SDK calls in the tool workflow. A network request is not automatically harmful, but it must be understood.

DevTools has limits. Extensions, service workers, browser synchronization, and software outside the browser can affect traffic. For higher assurance, test in a clean profile and capture traffic with an operating-system proxy. Verify the deployed version because build and hosting configuration can differ from source.

Free Online Tools Nest documents analytics and advertising separately in the [Privacy Policy](/privacy-policy/). Our [testing standards](/standards/) define how reviewed tool pages substantiate local-processing claims.

The tool measurement events contain fixed tool, language, action, discovery tier and measurement-version fields. They do not include entered text, generated output, filenames or file details. Other page requests still require the same inspection. This guide's editorial review covers the instructions and source; it is not a network certification of every deployed release.

For the browser controls described here, see the [Chrome DevTools Network reference](https://developer.chrome.com/docs/devtools/network/reference/).
