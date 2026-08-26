---
title: "Why Some PDFs Compress Better Than Others"
description: "Understand PDF size, embedded images, fonts, object streams, and why browser compression results vary by document."
pubDate: 2026-08-26
tags: ["pdf", "compression", "privacy"]
draft: false
---

Two PDFs with the same page count can have radically different file sizes. A text-first report might already use compact fonts and compressed streams, while a scanned document can contain one high-resolution image per page. Compression results depend on what is inside the file, not the number of pages alone.

The [PDF Compressor](/tools/pdf-compressor/) loads and rewrites documents with `pdf-lib` in the browser. Rewriting can remove some structural overhead, but it cannot promise a dramatic reduction for every source. A PDF dominated by JPEG scans may already contain compressed image data. Saving that structure again can produce little change.

## What usually affects PDF size

- **Raster images:** pixel dimensions, color depth, and codec quality usually dominate scanned documents.
- **Fonts:** embedded full font programs can be larger than subset fonts containing only used glyphs.
- **Repeated objects:** efficient PDFs reuse resources; inefficient exports can duplicate them.
- **Metadata and attachments:** embedded files, thumbnails, and editing history add bytes that are not visible on the page.
- **Existing compression:** object streams and image codecs may already have done most of the available work.

A useful test is to compare a text report and a scanned report of similar length. The first may shrink modestly or not at all. The scanned version needs image downsampling to achieve large savings, which is a different operation from lossless structural rewriting.

Use the browser tool when privacy and convenience matter and the document fits comfortably in device memory. Use Ghostscript, Acrobat, or another specialist workflow when you need a target DPI, grayscale conversion, archival PDF profiles, font controls, or a guaranteed maximum size. Always open the result and inspect several pages before deleting the original.

For combining files without uploading them, see the [PDF Merger](/tools/pdf-merger/). Our [testing standards](/standards/) describe file guardrails and review methods.
