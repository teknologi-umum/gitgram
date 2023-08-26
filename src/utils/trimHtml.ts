import * as cheerio from "cheerio";

/**
 * Find closest number, higher than needle, from an array
 * @param {number} needle
 * @param {number[]} haystack
 * @returns {number}
 */
const closest = (needle: number, haystack: number[]): number => {
  return haystack.length < 2
    ? haystack.at(-1)!
    : haystack.reduce((curr, acc) => {
      const aDiff = Math.abs(curr - needle);
      const bDiff = Math.abs(acc - needle);

      return bDiff < aDiff ? acc : curr;
    }, 0);
};

/**
 * Trim HTML according to tag
 * @param {string} content
 * @param {number} maxLength
 * @returns {string}
 */
export const trimHtml = (content: string, maxLength: number): string => {
  // if the string is shorter than the maxLength, just return it as is
  if (content.length < maxLength) return content.trim();

  // add wrapper div for cheerio.children selector to work
  // we want to select all tags _without_ their children
  const $ = cheerio.load(`<div>${content}</div>`, {
    xml: {
      withStartIndices: true,
      withEndIndices: true
    }
  });

  const endIndices = $("div")
    .children()
    .get()
    .map((el) => el.endIndex! + 1);

  // -5 because the first `<div>` tag counts but we don't actually use them
  return content.substring(0, endIndices.length < 1 ? content.length : closest(maxLength, endIndices) - 5).trim();
};