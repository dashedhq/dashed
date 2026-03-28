import { describe, expect, test } from "vitest";

import {
  colorEquals,
  colorToCss,
  colorToHex,
  colorToHsva,
  cssToColor,
  hexToColor,
  hsvaToColor,
  tryCssToColor,
  tryHexToColor,
} from "./color";

describe("colorEquals", () => {
  test("equal colors", () => {
    expect(
      colorEquals({ r: 255, g: 0, b: 0, a: 1 }, { r: 255, g: 0, b: 0, a: 1 }),
    ).toBe(true);
  });

  test("different colors", () => {
    expect(
      colorEquals({ r: 255, g: 0, b: 0, a: 1 }, { r: 0, g: 255, b: 0, a: 1 }),
    ).toBe(false);
  });

  test("different alpha", () => {
    expect(
      colorEquals({ r: 255, g: 0, b: 0, a: 1 }, { r: 255, g: 0, b: 0, a: 0.5 }),
    ).toBe(false);
  });
});

describe("colorToHex", () => {
  test("red", () => {
    expect(colorToHex({ r: 255, g: 0, b: 0, a: 1 })).toBe("#ff0000");
  });

  test("black", () => {
    expect(colorToHex({ r: 0, g: 0, b: 0, a: 1 })).toBe("#000000");
  });

  test("white", () => {
    expect(colorToHex({ r: 255, g: 255, b: 255, a: 1 })).toBe("#ffffff");
  });

  test("ignores alpha", () => {
    expect(colorToHex({ r: 255, g: 0, b: 0, a: 0.5 })).toBe("#ff0000");
  });
});

describe("colorToCss", () => {
  test("opaque color", () => {
    expect(colorToCss({ r: 255, g: 128, b: 0, a: 1 })).toBe(
      "rgba(255,128,0,1)",
    );
  });

  test("transparent color", () => {
    expect(colorToCss({ r: 0, g: 0, b: 0, a: 0 })).toBe("rgba(0,0,0,0)");
  });
});

describe("tryCssToColor", () => {
  test("valid rgba", () => {
    expect(tryCssToColor("rgba(255,0,0,1)")).toEqual({
      r: 255,
      g: 0,
      b: 0,
      a: 1,
    });
  });

  test("decimal alpha", () => {
    expect(tryCssToColor("rgba(0,0,0,0.5)")).toEqual({
      r: 0,
      g: 0,
      b: 0,
      a: 0.5,
    });
  });

  test("invalid string returns null", () => {
    expect(tryCssToColor("not-a-color")).toBeNull();
  });

  test("hex string returns null", () => {
    expect(tryCssToColor("#ff0000")).toBeNull();
  });
});

describe("cssToColor", () => {
  test("valid rgba", () => {
    expect(cssToColor("rgba(255,0,0,1)")).toEqual({
      r: 255,
      g: 0,
      b: 0,
      a: 1,
    });
  });

  test("invalid string throws", () => {
    expect(() => cssToColor("bad")).toThrow();
  });
});

describe("tryHexToColor", () => {
  test("with hash", () => {
    expect(tryHexToColor("#ff0000")).toEqual({
      r: 255,
      g: 0,
      b: 0,
      a: 1,
    });
  });

  test("without hash", () => {
    expect(tryHexToColor("00ff00")).toEqual({
      r: 0,
      g: 255,
      b: 0,
      a: 1,
    });
  });

  test("uppercase", () => {
    expect(tryHexToColor("#FF00FF")).toEqual({
      r: 255,
      g: 0,
      b: 255,
      a: 1,
    });
  });

  test("invalid returns null", () => {
    expect(tryHexToColor("nope")).toBeNull();
  });

  test("short hex returns null", () => {
    expect(tryHexToColor("#fff")).toBeNull();
  });

  test("alpha is always 1", () => {
    expect(tryHexToColor("#000000")?.a).toBe(1);
  });
});

describe("hexToColor", () => {
  test("valid hex", () => {
    expect(hexToColor("#0000ff")).toEqual({ r: 0, g: 0, b: 255, a: 1 });
  });

  test("invalid hex throws", () => {
    expect(() => hexToColor("bad")).toThrow();
  });
});

describe("colorToHsva / hsvaToColor roundtrip", () => {
  test("red", () => {
    const red = { r: 255, g: 0, b: 0, a: 1 };
    const hsva = colorToHsva(red);
    expect(hsva.h).toBe(0);
    expect(hsva.s).toBe(100);
    expect(hsva.v).toBe(100);
    expect(hsvaToColor(hsva)).toEqual(red);
  });

  test("green", () => {
    const green = { r: 0, g: 255, b: 0, a: 1 };
    const hsva = colorToHsva(green);
    expect(hsva.h).toBe(120);
    expect(hsvaToColor(hsva)).toEqual(green);
  });

  test("blue", () => {
    const blue = { r: 0, g: 0, b: 255, a: 1 };
    const hsva = colorToHsva(blue);
    expect(hsva.h).toBe(240);
    expect(hsvaToColor(hsva)).toEqual(blue);
  });

  test("black", () => {
    const black = { r: 0, g: 0, b: 0, a: 1 };
    const hsva = colorToHsva(black);
    expect(hsva.s).toBe(0);
    expect(hsva.v).toBe(0);
    expect(hsvaToColor(hsva)).toEqual(black);
  });

  test("white", () => {
    const white = { r: 255, g: 255, b: 255, a: 1 };
    const hsva = colorToHsva(white);
    expect(hsva.s).toBe(0);
    expect(hsva.v).toBe(100);
    expect(hsvaToColor(hsva)).toEqual(white);
  });

  test("preserves alpha", () => {
    const c = { r: 100, g: 150, b: 200, a: 0.7 };
    const hsva = colorToHsva(c);
    expect(hsva.a).toBe(0.7);
    expect(hsvaToColor(hsva).a).toBe(0.7);
  });

  test("colorToHsva rounds h/s/v to integers", () => {
    // r:100 g:150 b:200 would produce s=50.000... and v=78.431...
    const hsva = colorToHsva({ r: 100, g: 150, b: 200, a: 1 });
    expect(Number.isInteger(hsva.h)).toBe(true);
    expect(Number.isInteger(hsva.s)).toBe(true);
    expect(Number.isInteger(hsva.v)).toBe(true);
  });

  test("hsvaToColor rounds alpha to 2dp", () => {
    const color = hsvaToColor({ h: 210, s: 50, v: 78, a: 0.333333 });
    expect(color.a).toBe(0.33);
  });
});
