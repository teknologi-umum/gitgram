import { describe, test, expect } from "vitest";
import { markdownToHTML } from "~/utils/markdown";

test("should be able to convert markdown to html", () => {
  const md = "This is some **bold** text and _italic_ text. `monospaced stuff`";
  const result = markdownToHTML(md);
  expect(result).toBe(
    "This is some <strong>bold</strong> text and <em>italic</em> text. <code>monospaced stuff</code>"
  );
});

describe("remove blacklisted elements", (it) => {
  it("should remove image tag from markdown", () => {
    const md = "Some ![image](url-to-image) image";
    const result = markdownToHTML(md);
    expect(result).toBe("Some  image");
  });

  it("should strips html tag", () => {
    const md = "This is an <img src='foo' />";
    const result = markdownToHTML(md);
    expect(result).toBe("This is an");
  });
});

test("should trim long markdown after converting to html", () => {
  const md =
    "Lorem ipsum dolor sit amet, **consectetur** adipiscing elit. Suspendisse fermentum _finibus_ ipsum.\n\n`Donec in sem vitae ex condimentum imperdiet in in ante.` Vivamus ultricies tempor placerat. Vivamus gravida mollis lacinia. Morbi orci purus, laoreet id venenatis a, eleifend eget turpis. Etiam pretium ultrices leo eu consequat.\n\nDonec tristique at purus non volutpat. Curabitur egestas ex vitae congue fringilla. Ut tellus sapien, ultrices a orci in, faucibus rhoncus sapien. In interdum dapibus dolor at rutrum.";
  const result = markdownToHTML(md);
  expect(result).toBe(
    "Lorem ipsum dolor sit amet, <strong>consectetur</strong> adipiscing elit. Suspendisse fermentum <em>finibus</em> ipsum.\n<code>Donec in sem vitae ex condimentum imperdiet in in ante.</code>"
  );
});

test("should do nothing on a valid html", () => {
  const md = "<strong>something here</strong>";
  const result = markdownToHTML(md);
  expect(result).toBe("<strong>something here</strong>");
});

// TODO: why is this failing???
// test("should be able to parse real world case", () => {
//   const md =
//     "For #52 \r\n\r\n![localhost_5173_](https://user-images.githubusercontent.com/42563517/193398396-005147e0-79fd-4fde-9ef1-ddd9ccdce47e.jpg)\r\n\r\n~~Masih mikir cara ngasih tahu user kalau yg ungu itu merged PR, sisanya pending PR~~\r\nJadinya pakai popup gini aja\r\n\r\n![hacktober-contributor-popup](https://user-images.githubusercontent.com/42563517/193399117-8a0b5fba-75af-4650-8a13-2036705e386b.gif)\r\n";
//   const result = markdownToHTML(md);
//   expect(result).toBe(
//     "For #52\n\n<del>Masih mikir cara ngasih tahu user kalau yg ungu itu merged PR, sisanya pending PR</del>\nJadinya pakai popup gini aja"
//   );
// });
