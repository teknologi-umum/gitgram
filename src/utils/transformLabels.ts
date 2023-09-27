/**
 * `transformLabels` will transfrom a list of `Label` into a comma separated string
 * @param labels - List of `Label`
 * @return transformed label
 */
export function transformLabels(labels: { name: string }[] | undefined): string {
  if (labels && labels.length > 0) {
    return `<b>Tags</b>: ${labels.map((l) => l.name).join(", ")}\n`;
  }

  return "";
}