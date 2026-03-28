import { type Color, colorToCss } from "./color";

export type BorderStyle = "solid" | "dashed" | "dotted";

export type BorderWidths = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type Borders = {
  color: Color;
  style: BorderStyle;
  widths: BorderWidths;
};

export type BorderRadius = {
  topLeft: number;
  topRight: number;
  bottomRight: number;
  bottomLeft: number;
};

export function bordersStyle(borders: Borders) {
  const { widths, style, color } = borders;

  if (
    widths.top === 0 &&
    widths.right === 0 &&
    widths.bottom === 0 &&
    widths.left === 0
  ) {
    return "";
  }

  const css = colorToCss(color);
  const parts: string[] = [];

  if (widths.top > 0) {
    parts.push(`border-top: ${widths.top}px ${style} ${css}`);
  }
  if (widths.right > 0) {
    parts.push(`border-right: ${widths.right}px ${style} ${css}`);
  }
  if (widths.bottom > 0) {
    parts.push(`border-bottom: ${widths.bottom}px ${style} ${css}`);
  }
  if (widths.left > 0) {
    parts.push(`border-left: ${widths.left}px ${style} ${css}`);
  }

  return parts.join("; ");
}

export function borderRadiusStyle(radius: BorderRadius) {
  if (
    radius.topLeft === 0 &&
    radius.topRight === 0 &&
    radius.bottomRight === 0 &&
    radius.bottomLeft === 0
  ) {
    return "";
  }

  return `border-radius: ${radius.topLeft}px ${radius.topRight}px ${radius.bottomRight}px ${radius.bottomLeft}px`;
}
