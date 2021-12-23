import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";
import remarkParse from "remark-parse";
import DOMPurify from "dompurify";
import { unified } from "unified";

/**
 * Converts markdown to html with convinience!💃💃
 * @param {String} payload dirty markdown
 * @returns {String} sanitized html
 */
export function markdownToHTML(payload: string): string {
  // Blazing quick return if the payload is an empty
  // string or any other types which I don't know.
  if (!payload) return "";

  const result = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkHtml)
    .processSync(payload);
  return DOMPurify.sanitize(
    result.toString("utf-8"), 
    {
      ALLOWED_TAGS: [
        "a",
        "b",
        "i",
        "s",
        "u",
        "em",
        "strong",
        "strike",
        "del",
        "code",
        "pre",
        "br"], 
      ALLOWED_ATTR: ["href"],
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false
    }
  );
}
