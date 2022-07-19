import type { Values } from "templite";
import templite from "templite";

/**
 * A wrapper that removes leading whitespace on linebreak and feed the result
 * to template. This is a temporary workaround until I find a proper way to remove leading
 * whitespace and put this function somewhere else.
 */
export function interpolate(text: string, values: Values) {
  const cleanedText = text
    .split("\n")
    .map((l) => l.trim())
    .join("\n");
  return templite(cleanedText, values);
}
