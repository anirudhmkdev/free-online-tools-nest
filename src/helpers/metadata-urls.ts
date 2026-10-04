export function metadataUrlError(fields: Record<string,string>): string {
  for (const [label,value] of Object.entries(fields)) {
    if (!value.trim()) continue;
    try {
      const url = new URL(value.trim());
      if (!/^https?:\/\//i.test(value.trim()) || !["http:","https:"].includes(url.protocol) || !url.hostname || url.username || url.password || url.hash || /[\u0000-\u0020<>"']/u.test(value.trim())) throw new Error();
    } catch { return `${label}: use an absolute HTTP(S) URL without spaces, credentials or fragments.`; }
  }
  return "";
}
