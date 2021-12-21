import type { Label } from "@octokit/webhooks-types";

/**
 * `transformLabels` will transfrom a list of `Label` into a comma separated string
 * @param {Label[]} labels - List of `Label` from `@octokit/webhooks`
 * @return transformed label
 */
export function transformLabels(labels: Label[] | undefined): string {
  if (labels && labels.length > 0) {
    return "\n<b>Tags</b>: " + labels.map((l) => l.name).join(", ");
  }
  return "";
}
