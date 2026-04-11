import { assertEquals, assertNotEquals } from "@std/assert";
import { detectDiagramLinks, findExistingMarker } from "../src/detector.ts";

Deno.test("detectDiagramLinks detects basic mmd link", () => {
  const lines = ["# Title", "", "[Flow](diagrams/flow.mmd)"];
  const links = detectDiagramLinks(lines);

  assertEquals(links.length, 1);
  assertEquals(links[0].mmdPath, "diagrams/flow.mmd");
  assertEquals(links[0].lineIndex, 2);
  assertEquals(links[0].linkText, "Flow");
});

Deno.test("detectDiagramLinks detects image-style mmd link", () => {
  const lines = ["![Alt](path/to/diagram.mmd)"];
  const links = detectDiagramLinks(lines);

  assertEquals(links.length, 1);
  assertEquals(links[0].mmdPath, "path/to/diagram.mmd");
});

Deno.test("detectDiagramLinks is case insensitive", () => {
  const lines = ["[Label](diagram.MMD)", "[Label](diagram.Mmd)"];
  const links = detectDiagramLinks(lines);

  assertEquals(links.length, 2);
});

Deno.test("detectDiagramLinks returns empty array when no links", () => {
  const lines = ["# Title", "Some text", "[Link](http://example.com)"];
  const links = detectDiagramLinks(lines);

  assertEquals(links.length, 0);
});

Deno.test("detectDiagramLinks detects multiple links", () => {
  const lines = ["# Title", "[First](a.mmd)", "Some text", "[Second](b.mmd)"];
  const links = detectDiagramLinks(lines);

  assertEquals(links.length, 2);
  assertEquals(links[0].mmdPath, "a.mmd");
  assertEquals(links[1].mmdPath, "b.mmd");
});

Deno.test("findExistingMarker finds marker before link", () => {
  const lines = [
    "<!-- MAAR: diagram.mmd -->",
    "```",
    "ascii",
    "```",
    "",
    "[Label](diagram.mmd)",
  ];
  const marker = findExistingMarker(lines, 5, "diagram.mmd");

  assertNotEquals(marker, null);
  assertEquals(marker!.mmdPath, "diagram.mmd");
  assertEquals(marker!.lineIndex, 0);
});

Deno.test("findExistingMarker returns null when no marker", () => {
  const lines = ["# Title", "", "[Label](diagram.mmd)"];
  const marker = findExistingMarker(lines, 2, "diagram.mmd");

  assertEquals(marker, null);
});

Deno.test("findExistingMarker finds marker within 4 lines (standard format)", () => {
  // Standard format: marker, code block, blank line, link
  const lines = [
    "# Title",
    "<!-- MAAR: diagram.mmd -->",
    "```",
    "line1",
    "```",
    "",
    "[Label](diagram.mmd)",
  ];
  const marker = findExistingMarker(lines, 6, "diagram.mmd");

  assertNotEquals(marker, null);
  assertEquals(marker!.mmdPath, "diagram.mmd");
});
