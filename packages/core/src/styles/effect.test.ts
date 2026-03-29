import { describe, expect, test } from "vitest";

import {
  backdropBlurStyle,
  blendModeStyle,
  blurStyle,
  dropShadowStyle,
  effectLayersStyle,
  innerShadowStyle,
  opacityStyle,
  rotationStyle,
  shadowLayersStyle,
  shadowsStyle,
  textEffectLayersStyle,
  textShadowLayersStyle,
  textShadowsStyle,
  textShadowStyle,
} from "./effect";

describe("dropShadowStyle", () => {
  test("single shadow", () => {
    expect(
      dropShadowStyle({
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
      dropShadowStyle({
        color: { r: 255, g: 0, b: 0, a: 1 },
        x: 0,
        y: 0,
        blur: 0,
        spread: 4,
      }),
    ).toBe("box-shadow: 0px 0px 0px 4px rgba(255,0,0,1)");
  });
});

describe("innerShadowStyle", () => {
  test("single inner shadow", () => {
    expect(
      innerShadowStyle({
        color: { r: 0, g: 0, b: 0, a: 0.5 },
        x: 0,
        y: 2,
        blur: 4,
        spread: 0,
      }),
    ).toBe("box-shadow: inset 0px 2px 4px 0px rgba(0,0,0,0.5)");
  });
});

describe("shadowsStyle", () => {
  test("empty array returns empty string", () => {
    expect(shadowsStyle([])).toBe("");
  });

  test("single shadow", () => {
    expect(
      shadowsStyle([
        {
          color: { r: 0, g: 0, b: 0, a: 0.5 },
          x: 2,
          y: 4,
          blur: 8,
          spread: 0,
        },
      ]),
    ).toBe("box-shadow: 2px 4px 8px 0px rgba(0,0,0,0.5)");
  });

  test("multiple shadows", () => {
    const result = shadowsStyle([
      {
        color: { r: 0, g: 0, b: 0, a: 0.1 },
        x: 0,
        y: 2,
        blur: 4,
        spread: 0,
      },
      {
        color: { r: 0, g: 0, b: 0, a: 0.2 },
        x: 0,
        y: 4,
        blur: 16,
        spread: 0,
      },
    ]);
    expect(result).toBe(
      "box-shadow: 0px 2px 4px 0px rgba(0,0,0,0.1), 0px 4px 16px 0px rgba(0,0,0,0.2)",
    );
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

describe("blendModeStyle", () => {
  test("normal returns empty", () => {
    expect(blendModeStyle("normal")).toBe("");
  });

  test("multiply", () => {
    expect(blendModeStyle("multiply")).toBe("mix-blend-mode: multiply");
  });

  test("screen", () => {
    expect(blendModeStyle("screen")).toBe("mix-blend-mode: screen");
  });
});

describe("blurStyle", () => {
  test("zero returns empty", () => {
    expect(blurStyle(0)).toBe("");
  });

  test("non-zero blur", () => {
    expect(blurStyle(4)).toBe("filter: blur(4px)");
  });
});

describe("backdropBlurStyle", () => {
  test("zero returns empty", () => {
    expect(backdropBlurStyle(0)).toBe("");
  });

  test("non-zero backdrop blur", () => {
    expect(backdropBlurStyle(10)).toBe("backdrop-filter: blur(10px)");
  });
});

describe("rotationStyle", () => {
  test("zero returns empty", () => {
    expect(rotationStyle(0)).toBe("");
  });

  test("positive rotation", () => {
    expect(rotationStyle(45)).toBe("transform: rotate(45deg)");
  });

  test("negative rotation", () => {
    expect(rotationStyle(-90)).toBe("transform: rotate(-90deg)");
  });
});

describe("textShadowStyle", () => {
  test("single text shadow", () => {
    expect(
      textShadowStyle({
        color: { r: 0, g: 0, b: 0, a: 0.5 },
        x: 1,
        y: 2,
        blur: 4,
      }),
    ).toBe("text-shadow: 1px 2px 4px rgba(0,0,0,0.5)");
  });
});

describe("textShadowsStyle", () => {
  test("empty array returns empty", () => {
    expect(textShadowsStyle([])).toBe("");
  });

  test("multiple text shadows", () => {
    expect(
      textShadowsStyle([
        { color: { r: 0, g: 0, b: 0, a: 0.3 }, x: 0, y: 1, blur: 2 },
        { color: { r: 255, g: 0, b: 0, a: 1 }, x: 2, y: 2, blur: 0 },
      ]),
    ).toBe(
      "text-shadow: 0px 1px 2px rgba(0,0,0,0.3), 2px 2px 0px rgba(255,0,0,1)",
    );
  });
});

describe("shadowLayersStyle", () => {
  test("delegates to shadowsStyle", () => {
    expect(
      shadowLayersStyle([
        {
          id: "s1",
          shadow: {
            color: { r: 0, g: 0, b: 0, a: 0.5 },
            x: 2,
            y: 4,
            blur: 8,
            spread: 0,
          },
        },
      ]),
    ).toBe("box-shadow: 2px 4px 8px 0px rgba(0,0,0,0.5)");
  });

  test("empty layers returns empty string", () => {
    expect(shadowLayersStyle([])).toBe("");
  });
});

describe("effectLayersStyle", () => {
  test("empty array returns empty string", () => {
    expect(effectLayersStyle([])).toBe("");
  });

  test("blur effect", () => {
    expect(
      effectLayersStyle([
        { id: "e1", effect: { type: "blur", blur: 4 }, visible: true },
      ]),
    ).toBe("filter: blur(4px)");
  });

  test("blur of 0 returns empty", () => {
    expect(
      effectLayersStyle([
        { id: "e1", effect: { type: "blur", blur: 0 }, visible: true },
      ]),
    ).toBe("");
  });

  test("backdrop blur effect", () => {
    expect(
      effectLayersStyle([
        {
          id: "e1",
          effect: { type: "backdrop-blur", blur: 10 },
          visible: true,
        },
      ]),
    ).toBe("backdrop-filter: blur(10px)");
  });

  test("drop shadow effect", () => {
    expect(
      effectLayersStyle([
        {
          id: "e1",
          visible: true,
          effect: {
            type: "drop-shadow",
            shadow: {
              color: { r: 0, g: 0, b: 0, a: 0.5 },
              x: 2,
              y: 4,
              blur: 8,
              spread: 0,
            },
          },
        },
      ]),
    ).toBe("box-shadow: 2px 4px 8px 0px rgba(0,0,0,0.5)");
  });

  test("inner shadow effect", () => {
    expect(
      effectLayersStyle([
        {
          id: "e1",
          visible: true,
          effect: {
            type: "inner-shadow",
            shadow: {
              color: { r: 0, g: 0, b: 0, a: 0.25 },
              x: 0,
              y: 2,
              blur: 4,
              spread: 0,
            },
          },
        },
      ]),
    ).toBe("box-shadow: inset 0px 2px 4px 0px rgba(0,0,0,0.25)");
  });

  test("drop shadow and inner shadow combine into one box-shadow", () => {
    expect(
      effectLayersStyle([
        {
          id: "e1",
          visible: true,
          effect: {
            type: "drop-shadow",
            shadow: {
              color: { r: 0, g: 0, b: 0, a: 0.5 },
              x: 0,
              y: 2,
              blur: 4,
              spread: 0,
            },
          },
        },
        {
          id: "e2",
          visible: true,
          effect: {
            type: "inner-shadow",
            shadow: {
              color: { r: 0, g: 0, b: 0, a: 0.1 },
              x: 0,
              y: 1,
              blur: 2,
              spread: 0,
            },
          },
        },
      ]),
    ).toBe(
      "box-shadow: 0px 2px 4px 0px rgba(0,0,0,0.5), inset 0px 1px 2px 0px rgba(0,0,0,0.1)",
    );
  });

  test("mixed effects produce combined CSS", () => {
    expect(
      effectLayersStyle([
        { id: "e1", effect: { type: "blur", blur: 4 }, visible: true },
        {
          id: "e2",
          effect: { type: "backdrop-blur", blur: 10 },
          visible: true,
        },
        {
          id: "e3",
          visible: true,
          effect: {
            type: "drop-shadow",
            shadow: {
              color: { r: 0, g: 0, b: 0, a: 0.5 },
              x: 0,
              y: 2,
              blur: 8,
              spread: 0,
            },
          },
        },
      ]),
    ).toBe(
      "filter: blur(4px); backdrop-filter: blur(10px); box-shadow: 0px 2px 8px 0px rgba(0,0,0,0.5)",
    );
  });

  test("hidden layers are excluded", () => {
    expect(
      effectLayersStyle([
        { id: "e1", effect: { type: "blur", blur: 4 }, visible: false },
        {
          id: "e2",
          visible: true,
          effect: {
            type: "drop-shadow",
            shadow: {
              color: { r: 0, g: 0, b: 0, a: 0.5 },
              x: 0,
              y: 2,
              blur: 8,
              spread: 0,
            },
          },
        },
      ]),
    ).toBe("box-shadow: 0px 2px 8px 0px rgba(0,0,0,0.5)");
  });
});

describe("textShadowLayersStyle", () => {
  test("delegates to textShadowsStyle", () => {
    expect(
      textShadowLayersStyle([
        {
          id: "ts1",
          shadow: { color: { r: 0, g: 0, b: 0, a: 0.5 }, x: 1, y: 2, blur: 4 },
        },
      ]),
    ).toBe("text-shadow: 1px 2px 4px rgba(0,0,0,0.5)");
  });

  test("empty layers returns empty string", () => {
    expect(textShadowLayersStyle([])).toBe("");
  });
});

describe("textEffectLayersStyle", () => {
  test("empty array returns empty string", () => {
    expect(textEffectLayersStyle([])).toBe("");
  });

  test("blur effect", () => {
    expect(
      textEffectLayersStyle([
        { id: "e1", effect: { type: "blur", blur: 4 }, visible: true },
      ]),
    ).toBe("filter: blur(4px)");
  });

  test("backdrop blur effect", () => {
    expect(
      textEffectLayersStyle([
        { id: "e1", effect: { type: "backdrop-blur", blur: 10 }, visible: true },
      ]),
    ).toBe("backdrop-filter: blur(10px)");
  });

  test("text drop shadow effect", () => {
    expect(
      textEffectLayersStyle([
        {
          id: "e1",
          visible: true,
          effect: {
            type: "drop-shadow",
            shadow: {
              color: { r: 0, g: 0, b: 0, a: 0.5 },
              x: 1,
              y: 2,
              blur: 4,
            },
          },
        },
      ]),
    ).toBe("text-shadow: 1px 2px 4px rgba(0,0,0,0.5)");
  });

  test("multiple text shadows combine", () => {
    expect(
      textEffectLayersStyle([
        {
          id: "e1",
          visible: true,
          effect: {
            type: "drop-shadow",
            shadow: { color: { r: 0, g: 0, b: 0, a: 0.3 }, x: 0, y: 1, blur: 2 },
          },
        },
        {
          id: "e2",
          visible: true,
          effect: {
            type: "drop-shadow",
            shadow: { color: { r: 255, g: 0, b: 0, a: 1 }, x: 2, y: 2, blur: 0 },
          },
        },
      ]),
    ).toBe(
      "text-shadow: 0px 1px 2px rgba(0,0,0,0.3), 2px 2px 0px rgba(255,0,0,1)",
    );
  });

  test("mixed text effects produce combined CSS", () => {
    expect(
      textEffectLayersStyle([
        { id: "e1", effect: { type: "blur", blur: 4 }, visible: true },
        {
          id: "e2",
          visible: true,
          effect: {
            type: "drop-shadow",
            shadow: { color: { r: 0, g: 0, b: 0, a: 0.5 }, x: 0, y: 2, blur: 8 },
          },
        },
      ]),
    ).toBe(
      "filter: blur(4px); text-shadow: 0px 2px 8px rgba(0,0,0,0.5)",
    );
  });

  test("hidden layers are excluded", () => {
    expect(
      textEffectLayersStyle([
        { id: "e1", effect: { type: "blur", blur: 4 }, visible: false },
        {
          id: "e2",
          visible: true,
          effect: {
            type: "drop-shadow",
            shadow: { color: { r: 0, g: 0, b: 0, a: 0.5 }, x: 0, y: 2, blur: 8 },
          },
        },
      ]),
    ).toBe("text-shadow: 0px 2px 8px rgba(0,0,0,0.5)");
  });
});
