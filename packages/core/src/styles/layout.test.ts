import { describe, expect, test } from "vitest";

import {
  dimensionsStyle,
  layoutStyle,
  overflowStyle,
  paddingStyle,
  positionStyle,
} from "./layout";

describe("layoutStyle", () => {
  test("vertical stack", () => {
    const result = layoutStyle({
      type: "stack",
      direction: "vertical",
      gap: 0,
      align: "start",
      distribute: "start",
    });
    expect(result).toContain("display: flex");
    expect(result).toContain("flex-direction: column");
    expect(result).toContain("align-items: flex-start");
    expect(result).toContain("justify-content: flex-start");
    expect(result).not.toContain("gap");
  });

  test("horizontal stack", () => {
    const result = layoutStyle({
      type: "stack",
      direction: "horizontal",
      gap: 0,
      align: "center",
      distribute: "center",
    });
    expect(result).toContain("flex-direction: row");
    expect(result).toContain("align-items: center");
    expect(result).toContain("justify-content: center");
  });

  test("stack with gap", () => {
    const result = layoutStyle({
      type: "stack",
      direction: "vertical",
      gap: 16,
      align: "start",
      distribute: "start",
    });
    expect(result).toContain("gap: 16px");
  });

  test("end alignment", () => {
    const result = layoutStyle({
      type: "stack",
      direction: "vertical",
      gap: 0,
      align: "end",
      distribute: "end",
    });
    expect(result).toContain("align-items: flex-end");
    expect(result).toContain("justify-content: flex-end");
  });

  test("space-between distribution", () => {
    const result = layoutStyle({
      type: "stack",
      direction: "vertical",
      gap: 0,
      align: "start",
      distribute: "space-between",
    });
    expect(result).toContain("justify-content: space-between");
  });
});

const noConstraints = {
  minWidth: 0,
  maxWidth: "none",
  minHeight: 0,
  maxHeight: "none",
} as const;

describe("dimensionsStyle", () => {
  test("fixed dimensions", () => {
    expect(
      dimensionsStyle({
        width: { type: "fixed", value: 100 },
        height: { type: "fixed", value: 200 },
        ...noConstraints,
      }),
    ).toBe("width: 100px; height: 200px");
  });

  test("hug dimensions", () => {
    expect(
      dimensionsStyle({
        width: { type: "hug" },
        height: { type: "hug" },
        ...noConstraints,
      }),
    ).toBe("width: fit-content; height: fit-content");
  });

  test("fill dimensions", () => {
    expect(
      dimensionsStyle({
        width: { type: "fill" },
        height: { type: "fill" },
        ...noConstraints,
      }),
    ).toBe("width: 100%; height: 100%");
  });

  test("mixed dimensions", () => {
    expect(
      dimensionsStyle({
        width: { type: "fixed", value: 300 },
        height: { type: "hug" },
        ...noConstraints,
      }),
    ).toBe("width: 300px; height: fit-content");
  });

  test("min/max constraints", () => {
    expect(
      dimensionsStyle({
        width: { type: "fill" },
        height: { type: "fill" },
        minWidth: 200,
        maxWidth: 800,
        minHeight: 0,
        maxHeight: "none",
      }),
    ).toBe("width: 100%; height: 100%; min-width: 200px; max-width: 800px");
  });
});

describe("paddingStyle", () => {
  test("zero padding returns empty", () => {
    expect(paddingStyle({ top: 0, right: 0, bottom: 0, left: 0 })).toBe("");
  });

  test("uniform padding", () => {
    expect(paddingStyle({ top: 16, right: 16, bottom: 16, left: 16 })).toBe(
      "padding: 16px 16px 16px 16px",
    );
  });

  test("mixed padding", () => {
    expect(paddingStyle({ top: 8, right: 16, bottom: 24, left: 32 })).toBe(
      "padding: 8px 16px 24px 32px",
    );
  });
});

describe("positionStyle", () => {
  test("auto returns empty", () => {
    expect(positionStyle({ type: "auto" })).toBe("");
  });

  test("absolute with insets", () => {
    const result = positionStyle({
      type: "absolute",
      insets: { top: 10, right: "auto", bottom: "auto", left: 20 },
    });
    expect(result).toContain("position: absolute");
    expect(result).toContain("top: 10px");
    expect(result).toContain("left: 20px");
    expect(result).not.toContain("right");
    expect(result).not.toContain("bottom");
  });

  test("absolute with all auto insets", () => {
    const result = positionStyle({
      type: "absolute",
      insets: { top: "auto", right: "auto", bottom: "auto", left: "auto" },
    });
    expect(result).toBe("position: absolute");
  });
});

describe("overflowStyle", () => {
  test("visible returns empty", () => {
    expect(overflowStyle("visible")).toBe("");
  });

  test("hidden", () => {
    expect(overflowStyle("hidden")).toBe("overflow: hidden");
  });

  test("scroll emits auto", () => {
    expect(overflowStyle("scroll")).toBe("overflow: auto");
  });
});
