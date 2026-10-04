import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";

/** Convert detached markup; never attach supplied HTML to the live document. */
export function htmlToMarkdown(html: string): string {
  if (html.length > 1000000) throw new Error("Use at most 1,000,000 HTML characters per conversion.");
  const converter = new TurndownService({headingStyle:"atx",codeBlockStyle:"fenced",bulletListMarker:"-"});
  converter.use(gfm);
  converter.remove(["script","style","iframe","object","embed","form"]);
  const unsafe = (value: string | null) => {
    const url = (value ?? "").replace(/[\u0000-\u0020]/g,"");
    return /^[a-z][a-z0-9+.-]*:/i.test(url) && !/^(https?:|mailto:|tel:)/i.test(url);
  };
  converter.addRule("unsafeLinks",{filter:node=>node.nodeName === "A" && unsafe(node.getAttribute("href")),replacement:content=>content});
  converter.addRule("unsafeImages",{filter:node=>node.nodeName === "IMG" && unsafe(node.getAttribute("src")),replacement:(_,node)=> (node as HTMLElement).getAttribute("alt") ?? ""});
  if (typeof document === "undefined") return converter.turndown(html);
  const template = document.createElement("template");
  template.innerHTML = html;
  return converter.turndown(template.content);
}
