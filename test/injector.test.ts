import { assertEquals } from "jsr:@std/assert";
import { createInjectionBlock, injectAscii } from "../src/injector.ts";
import { DiagramLink } from "../src/types.ts";

Deno.test("createInjectionBlock creates properly formatted block", () => {
  const block = createInjectionBlock("path.mmd", "ASCII");

  assertEquals(block[0], "<!-- MAAR: path.mmd -->");
  assertEquals(block[1], "```");
  assertEquals(block[2], "ASCII");
  assertEquals(block[3], "```");
  assertEquals(block[4], "");
});

Deno.test("injectAscii inserts block before link for new diagram", () => {
  const lines = ["# Title", "[Label](path.mmd)"];
  const link: DiagramLink = {
    lineIndex: 1,
    mmdPath: "path.mmd",
    originalLine: "[Label](path.mmd)",
    linkText: "Label",
  };

  const result = injectAscii(lines, link, "ASCII", false);

  assertEquals(result[0], "# Title");
  assertEquals(result[1], "<!-- MAAR: path.mmd -->");
  assertEquals(result[2], "```");
  assertEquals(result[3], "ASCII");
  assertEquals(result[4], "```");
  assertEquals(result[5], "");
  assertEquals(result[6], "[Label](path.mmd)");
});

Deno.test("injectAscii preserves surrounding content", () => {
  const lines = ["# Title", "", "[Label](path.mmd)", "", "Footer"];
  const link: DiagramLink = {
    lineIndex: 2,
    mmdPath: "path.mmd",
    originalLine: "[Label](path.mmd)",
    linkText: "Label",
  };

  const result = injectAscii(lines, link, "ASCII", false);

  assertEquals(result[0], "# Title");
  assertEquals(result[result.length - 1], "Footer");
});
