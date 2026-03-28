import { type Color, colorToCss } from "./color";

export type Shadow = {
  color: Color;
  x: number;
  y: number;
  blur: number;
  spread: number;
};

export type ShadowLayer = {
  id: string;
  shadow: Shadow;
};

function shadowValue(shadow: Shadow) {
  return `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${colorToCss(shadow.color)}`;
}

export function shadowStyle(shadow: Shadow) {
  return `box-shadow: ${shadowValue(shadow)}`;
}

export function shadowsStyle(shadows: Shadow[]) {
  if (shadows.length === 0) {
    return "";
  }
  return `box-shadow: ${shadows.map(shadowValue).join(", ")}`;
}

export function shadowLayersStyle(layers: ShadowLayer[]) {
  return shadowsStyle(layers.map((l) => l.shadow));
}

export function opacityStyle(opacity: number) {
  if (opacity === 1) {
    return "";
  }

  return `opacity: ${opacity}`;
}

export type BlendMode =
  | "normal"
  | "multiply"
  | "screen"
  | "overlay"
  | "darken"
  | "lighten"
  | "color-dodge"
  | "color-burn"
  | "hard-light"
  | "soft-light"
  | "difference"
  | "exclusion"
  | "hue"
  | "saturation"
  | "color"
  | "luminosity";

export function blendModeStyle(blendMode: BlendMode) {
  if (blendMode === "normal") {
    return "";
  }
  return `mix-blend-mode: ${blendMode}`;
}

export function blurStyle(blur: number) {
  if (blur === 0) {
    return "";
  }
  return `filter: blur(${blur}px)`;
}

export function backdropBlurStyle(backdropBlur: number) {
  if (backdropBlur === 0) {
    return "";
  }
  return `backdrop-filter: blur(${backdropBlur}px)`;
}

export type TextShadow = {
  color: Color;
  x: number;
  y: number;
  blur: number;
};

export type TextShadowLayer = {
  id: string;
  shadow: TextShadow;
};

function textShadowValue(shadow: TextShadow) {
  return `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${colorToCss(shadow.color)}`;
}

export function textShadowStyle(shadow: TextShadow) {
  return `text-shadow: ${textShadowValue(shadow)}`;
}

export function textShadowsStyle(shadows: TextShadow[]) {
  if (shadows.length === 0) {
    return "";
  }
  return `text-shadow: ${shadows.map(textShadowValue).join(", ")}`;
}

export function textShadowLayersStyle(layers: TextShadowLayer[]) {
  return textShadowsStyle(layers.map((l) => l.shadow));
}

export function rotationStyle(rotation: number) {
  if (rotation === 0) {
    return "";
  }
  return `transform: rotate(${rotation}deg)`;
}
