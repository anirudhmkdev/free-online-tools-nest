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

## A reproducible structural comparison

During local editorial review, we created two one-page fixtures with `pdf-lib` 1.17.1, saved them without object streams, then loaded and saved each with object streams enabled. The text fixture used Helvetica and repeated harmless text. The scan fixture embedded a 600 × 800 JPEG with synthetic paper noise and text, at JPEG quality 85. The JPEG itself was unchanged during the rewrite.

| Fixture | Original bytes | Rewritten bytes |
| --- | ---: | ---: |
| Text page | 2,362 | 1,403 |
| Synthetic scan page | 131,953 | 131,594 |

The resulting files could be parsed again and retained one page each. These measurements demonstrate structural savings for these fixtures only; they are not a forecast for your document or a full visual equivalence test. Repeat with your own harmless text PDF and image PDF, record the selected save mode and both byte sizes, then inspect the downloaded pages. Already optimized files may stay the same size or grow. A valid rewritten file counts as a completed operation even when it is larger.

Use the browser tool when privacy and convenience matter and the document fits comfortably in device memory. Use Ghostscript, Acrobat, or another specialist workflow when you need a target DPI, grayscale conversion, archival PDF profiles, font controls, or a guaranteed maximum size. Always open the result and inspect several pages before deleting the original.

For combining files without uploading them, see the [PDF Merger](/tools/pdf-merger/). Our [testing standards](/standards/) describe file guardrails and review methods.
