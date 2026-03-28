import { round } from "../utils/math";

export type Color = {
  r: number;
  g: number;
  b: number;
  a: number;
};

export type Hsva = {
  h: number;
  s: number;
  v: number;
  a: number;
};

export function colorEquals(c1: Color, c2: Color) {
  return c1.r === c2.r && c1.g === c2.g && c1.b === c2.b && c1.a === c2.a;
}

export function colorToHex(c: Color) {
  const r = c.r.toString(16).padStart(2, "0");
  const g = c.g.toString(16).padStart(2, "0");
  const b = c.b.toString(16).padStart(2, "0");
  return `#${r}${g}${b}`;
}

export function colorToCss(c: Color) {
  return `rgba(${c.r},${c.g},${c.b},${c.a})`;
}

export function tryCssToColor(s: string): Color | null {
  const m = s.match(/rgba?\((\d+),(\d+),(\d+),([\d.]+)\)/);
  if (!m) {
    return null;
  }
  return {
    r: parseInt(m[1]),
    g: parseInt(m[2]),
    b: parseInt(m[3]),
    a: parseFloat(m[4]),
  };
}

export function cssToColor(s: string) {
  const color = tryCssToColor(s);
  if (!color) {
    throw new Error(`CSS string ${s} cannot be parsed to a Color`);
  }

  return color;
}

export function tryHexToColor(hex: string): Color | null {
  const match = hex.match(/^#?([0-9a-fA-F]{6})$/);
  if (!match) {
    return null;
  }
  const h = match[1];
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
    a: 1,
  };
}

export function hexToColor(hex: string) {
  const color = tryHexToColor(hex);
  if (!color) {
    throw new Error(`Hex string ${hex} cannot be parsed to a Color`);
  }

  return color;
}

export function colorToHsva(c: Color): Hsva {
  const r = c.r / 255;
  const g = c.g / 255;
  const b = c.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h = 0;
  if (d !== 0) {
    if (max === r) {
      h = ((g - b) / d) % 6;
    } else if (max === g) {
      h = (b - r) / d + 2;
    } else {
      h = (r - g) / d + 4;
    }
    h = round(h * 60, 0);
    if (h < 0) {
      h += 360;
    }
  }

  const s = round(max === 0 ? 0 : (d / max) * 100, 0);
  const v = round(max * 100, 0);

  return { h, s, v, a: c.a };
}

export function hsvaToColor(hsva: Hsva): Color {
  const s = hsva.s / 100;
  const v = hsva.v / 100;
  const c = v * s;
  const x = c * (1 - Math.abs(((hsva.h / 60) % 2) - 1));
  const m = v - c;

  let r = 0,
    g = 0,
    b = 0;
  const h = hsva.h;

  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  return {
    r: round((r + m) * 255, 0),
    g: round((g + m) * 255, 0),
    b: round((b + m) * 255, 0),
    a: round(hsva.a, 2),
  };
}
