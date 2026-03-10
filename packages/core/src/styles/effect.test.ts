import { describe, expect, test } from "vitest";

import { opacityStyle, shadowStyle } from "./effect";

describe("shadowStyle", () => {
  test("no shadow returns empty", () => {
    expect(
      shadowStyle({
        color: { r: 0, g: 0, b: 0, a: 0 },
        x: 0,
        y: 0,
        blur: 0,
        spread: 0,
      }),
    ).toBe("");
  });

  test("shadow with offset", () => {
    expect(
      shadowStyle({
        color: { r: 0, g: 0, b: 0, a: 0.5 },
        x: 2,
        y: 4,
        blur: 8,
        spread: 0,
      }),
    ).toBe("box-shadow: 2px 4px 8px 0px rgba(0,0,0,0.5)");
  });

  test("shadow with spread", () => {
    expect(
      shadowStyle({
        color: { r: 255, g: 0, b: 0, a: 1 },
        x: 0,
        y: 0,
        blur: 0,
        spread: 4,
      }),
    ).toBe("box-shadow: 0px 0px 0px 4px rgba(255,0,0,1)");
  });
});

describe("opacityStyle", () => {
  test("fully opaque returns empty", () => {
    expect(opacityStyle(1)).toBe("");
  });

  test("partial opacity", () => {
    expect(opacityStyle(0.5)).toBe("opacity: 0.5");
  });

  test("zero opacity", () => {
    expect(opacityStyle(0)).toBe("opacity: 0");
  });
});
