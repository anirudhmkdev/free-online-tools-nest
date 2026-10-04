export interface SitemapEntry { url: string; priority: string; changeFreq: string; lastmod: string; }
export function generateSitemap(entries: SitemapEntry[]): string {
  const populated = entries.filter(entry => entry.url.trim());
  if (!populated.length) return "";
  if (populated.length > 50000) throw new Error("A sitemap can contain at most 50,000 URLs.");
  let origin = "";
  const escape = (text: string) => text.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;");
  const content = populated.map((entry, i) => {
    const fail = (message: string): never => { throw new Error(`URL ${i + 1}: ${message}`); };
    const text = entry.url.trim();
    let url: URL;
    try { url = new URL(text); } catch { return fail("enter an absolute http:// or https:// URL."); }
    if (!/^https?:\/\//i.test(text) || !["http:","https:"].includes(url.protocol) || url.username || url.password || url.hash || /[\s<>"\u0000-\u001f]/.test(text)) fail("use an absolute HTTP(S) URL without credentials, fragments or spaces.");
    if (text.length >= 2048) fail("keep the URL shorter than 2,048 characters.");
    if (origin && url.origin !== origin) fail("all URLs must use the same protocol and host.");
    origin = url.origin;
    const priority = Number(entry.priority);
    if (!entry.priority.trim() || !Number.isFinite(priority) || priority < 0 || priority > 1) fail("priority must be between 0 and 1.");
    if (!["always","hourly","daily","weekly","monthly","yearly","never"].includes(entry.changeFreq)) fail("choose a supported change frequency.");
    if (entry.lastmod && (!/^\d{4}-\d{2}-\d{2}$/.test(entry.lastmod) || !Number.isFinite(new Date(entry.lastmod).getTime()) || new Date(entry.lastmod).toISOString().slice(0,10) !== entry.lastmod)) fail("last modification must be a real YYYY-MM-DD date, or left blank.");
    return `  <url>\n    <loc>${escape(url.href)}</loc>${entry.lastmod ? `\n    <lastmod>${entry.lastmod}</lastmod>` : ""}\n    <changefreq>${entry.changeFreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
  });
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + content.join("\n") + '\n</urlset>';
  if (new TextEncoder().encode(xml).length > 50 * 1024 * 1024) throw new Error("Uncompressed sitemap exceeds 50 MB.");
  return xml;
}
