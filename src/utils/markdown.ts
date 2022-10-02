import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";
import remarkParse from "remark-parse";
import sanitize from "sanitize-html";
import { unified } from "unified";
import { trimHtml } from "./trimHtml";

/**
 * Converts markdown to html with convenience!💃💃
 * @param {String} payload dirty markdown
 * @returns {String} sanitized html
 */
export function markdownToHTML(payload: string): string {
  // Blazing quick return if the payload is an empty
  // string or any other types which I don't know.
  if (!payload) return "";

  const html = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkHtml, { allowDangerousHtml: true, sanitize: false })
    .processSync(payload)
    .toString("utf-8");

  const sanitized = sanitize(html, {
    allowedTags: ["a", "b", "i", "s", "u", "em", "strong", "strike", "del", "code", "pre", "br"],
    allowedAttributes: { a: ["href"] }
  });

  return trimHtml(sanitized, 200);
}
