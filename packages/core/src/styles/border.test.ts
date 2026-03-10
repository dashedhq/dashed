import { describe, expect, test } from "vitest";

import { borderRadiusStyle, bordersStyle } from "./border";

describe("bordersStyle", () => {
  test("zero widths returns empty", () => {
    expect(
      bordersStyle({
        color: { r: 0, g: 0, b: 0, a: 1 },
        style: "solid",
        widths: { top: 0, right: 0, bottom: 0, left: 0 },
      }),
    ).toBe("");
  });

  test("all sides", () => {
    const result = bordersStyle({
      color: { r: 0, g: 0, b: 0, a: 1 },
      style: "solid",
      widths: { top: 1, right: 1, bottom: 1, left: 1 },
    });
    expect(result).toContain("border-top: 1px solid rgba(0,0,0,1)");
    expect(result).toContain("border-right: 1px solid rgba(0,0,0,1)");
    expect(result).toContain("border-bottom: 1px solid rgba(0,0,0,1)");
    expect(result).toContain("border-left: 1px solid rgba(0,0,0,1)");
  });

  test("single side", () => {
    const result = bordersStyle({
      color: { r: 255, g: 0, b: 0, a: 1 },
      style: "dashed",
      widths: { top: 2, right: 0, bottom: 0, left: 0 },
    });
    expect(result).toBe("border-top: 2px dashed rgba(255,0,0,1)");
  });

  test("dotted style", () => {
    const result = bordersStyle({
      color: { r: 0, g: 0, b: 0, a: 1 },
      style: "dotted",
      widths: { top: 1, right: 0, bottom: 0, left: 0 },
    });
    expect(result).toContain("dotted");
  });
});

describe("borderRadiusStyle", () => {
  test("zero radius returns empty", () => {
    expect(
      borderRadiusStyle({
        topLeft: 0,
        topRight: 0,
        bottomRight: 0,
        bottomLeft: 0,
      }),
    ).toBe("");
  });

  test("uniform radius", () => {
    expect(
      borderRadiusStyle({
        topLeft: 8,
        topRight: 8,
        bottomRight: 8,
        bottomLeft: 8,
      }),
    ).toBe("border-radius: 8px 8px 8px 8px");
  });

  test("mixed radius", () => {
    expect(
      borderRadiusStyle({
        topLeft: 4,
        topRight: 8,
        bottomRight: 12,
        bottomLeft: 16,
      }),
    ).toBe("border-radius: 4px 8px 12px 16px");
  });
});
