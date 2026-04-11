import { assertEquals } from "@std/assert";
import { createInjectionBlock, injectAscii } from "../src/injector.ts";
import type { DiagramLink } from "../src/types.ts";

Deno.test("createInjectionBlock creates properly formatted block with blank line after marker", () => {
  const block = createInjectionBlock("path.mmd", "ASCII");

  assertEquals(block[0], "<!-- MAAR: path.mmd -->");
  assertEquals(block[1], ""); // Blank line after marker
  assertEquals(block[2], "```");
  assertEquals(block[3], "ASCII");
  assertEquals(block[4], "```");
  assertEquals(block[5], "");
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
  assertEquals(result[2], ""); // Blank line after marker
  assertEquals(result[3], "```");
  assertEquals(result[4], "ASCII");
  assertEquals(result[5], "```");
  assertEquals(result[6], "");
  assertEquals(result[7], "[Label](path.mmd)");
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

Deno.test("injectAscii re-renders large diagram (>100 lines) idempotently without duplication", () => {
  // Create a large ASCII diagram (>100 lines)
  const largeAscii = Array(150).fill("│ Line content │").join("\n");
  
  // Simulate already-injected content
  const lines = [
    "# Document",
    "",
    "<!-- MAAR: big-diagram.mmd -->",
    "", // Blank line after marker
    "```",
    ...largeAscii.split("\n"),
    "```",
    "",
    "[View Diagram](big-diagram.mmd)",
    "",
    "# Footer",
  ];
  
  const link: DiagramLink = {
    lineIndex: lines.length - 3, // Position of the link
    mmdPath: "big-diagram.mmd",
    originalLine: "[View Diagram](big-diagram.mmd)",
    linkText: "View Diagram",
  };
  
  // Re-render with hasExistingMarker = true
  const result = injectAscii(lines, link, largeAscii, true);
  
  // Count MAAR markers - should be exactly 1
  const markerCount = result.filter(line => line.includes("<!-- MAAR: big-diagram.mmd -->")).length;
  assertEquals(markerCount, 1);
  
  // Count code fences - should be exactly 2 (opening and closing)
  const codeFenceCount = result.filter(line => line.trim() === "```").length;
  assertEquals(codeFenceCount, 2);
  
  // Verify the document structure is preserved
  assertEquals(result[0], "# Document");
  assertEquals(result[result.length - 1], "# Footer");
});

Deno.test("injectAscii handles multiple diagrams in same file correctly", () => {
  const ascii1 = "Diagram 1";
  const ascii2 = "Diagram 2";
  
  // Start with two diagrams
  const lines = [
    "# Document",
    "",
    "<!-- MAAR: diagram1.mmd -->",
    "", // Blank line after marker
    "```",
    ascii1,
    "```",
    "",
    "[View Diagram 1](diagram1.mmd)",
    "",
    "Some text between diagrams",
    "",
    "<!-- MAAR: diagram2.mmd -->",
    "", // Blank line after marker
    "```",
    ascii2,
    "```",
    "",
    "[View Diagram 2](diagram2.mmd)",
    "",
    "# Footer",
  ];
  
  // Update first diagram
  const link1: DiagramLink = {
    lineIndex: 8, // Position of first link
    mmdPath: "diagram1.mmd",
    originalLine: "[View Diagram 1](diagram1.mmd)",
    linkText: "View Diagram 1",
  };
  
  const result1 = injectAscii(lines, link1, "Updated Diagram 1", true);
  
  // Count markers for each diagram - should be exactly 1 each
  const marker1Count = result1.filter(line => line.includes("<!-- MAAR: diagram1.mmd -->")).length;
  const marker2Count = result1.filter(line => line.includes("<!-- MAAR: diagram2.mmd -->")).length;
  assertEquals(marker1Count, 1);
  assertEquals(marker2Count, 1);
  
  // Update second diagram
  const link2Index = result1.findIndex(line => line.includes("[View Diagram 2](diagram2.mmd)"));
  const link2: DiagramLink = {
    lineIndex: link2Index,
    mmdPath: "diagram2.mmd",
    originalLine: "[View Diagram 2](diagram2.mmd)",
    linkText: "View Diagram 2",
  };
  
  const result2 = injectAscii(result1, link2, "Updated Diagram 2", true);
  
  // Verify both markers still exist exactly once
  const finalMarker1Count = result2.filter(line => line.includes("<!-- MAAR: diagram1.mmd -->")).length;
  const finalMarker2Count = result2.filter(line => line.includes("<!-- MAAR: diagram2.mmd -->")).length;
  assertEquals(finalMarker1Count, 1);
  assertEquals(finalMarker2Count, 1);
  
  // Verify content is updated
  assertEquals(result2.some(line => line.includes("Updated Diagram 1")), true);
  assertEquals(result2.some(line => line.includes("Updated Diagram 2")), true);
});

Deno.test("injectAscii early terminates at other mmd links and doesn't cross boundaries", () => {
  // Simulate searching for a marker that doesn't exist
  // because we've crossed into another diagram's territory
  const lines = [
    "# Document",
    "",
    "<!-- MAAR: first-diagram.mmd -->",
    "", // Blank line after marker
    "```",
    "First diagram content",
    "```",
    "",
    "[First Diagram](first-diagram.mmd)",
    "",
    // No marker for second-diagram.mmd exists
    "[Second Diagram](second-diagram.mmd)",
  ];
  
  const link: DiagramLink = {
    lineIndex: 10, // Position of second link
    mmdPath: "second-diagram.mmd",
    originalLine: "[Second Diagram](second-diagram.mmd)",
    linkText: "Second Diagram",
  };
  
  // Try to inject with hasExistingMarker = true (simulating a re-render)
  // But the marker doesn't exist, so it should insert as new
  const result = injectAscii(lines, link, "Second diagram ASCII", true);
  
  // Should insert new block before the second link
  const linkIndex = result.findIndex(line => line.includes("[Second Diagram](second-diagram.mmd)"));
  assertEquals(result[linkIndex - 1], "");
  assertEquals(result[linkIndex - 2], "```");
  assertEquals(result[linkIndex - 3], "Second diagram ASCII");
  assertEquals(result[linkIndex - 4], "```");
  assertEquals(result[linkIndex - 5], "");
  assertEquals(result[linkIndex - 6], "<!-- MAAR: second-diagram.mmd -->");
});
