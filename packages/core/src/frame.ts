import {
  type BorderRadius,
  borderRadiusStyle,
  type Borders,
  bordersStyle,
} from "./styles/border";
import { opacityStyle, type Shadow, shadowStyle } from "./styles/effect";
import { type Fill, fillStyle } from "./styles/fill";
import {
  type Dimensions,
  dimensionsStyle,
  type Layout,
  layoutStyle,
  type Padding,
  paddingStyle,
} from "./styles/layout";

export type FrameStyle = {
  fill: Fill;
  borders: Borders;
  dimensions: Dimensions;
  borderRadius: BorderRadius;
  layout: Layout;
  padding: Padding;
  opacity: number;
  shadow: Shadow;
};

export type FrameNode = {
  id: string;
  name: string;
  type: "frame";
  children: string[];
} & FrameStyle;

const frameDefaults: Omit<FrameNode, "id" | "type"> = {
  name: "Frame",
  children: [],
  fill: { type: "solid", color: { r: 0, g: 0, b: 0, a: 0 } },
  borders: {
    color: { r: 0, g: 0, b: 0, a: 0 },
    style: "solid",
    widths: { top: 0, right: 0, bottom: 0, left: 0 },
  },
  dimensions: { width: { type: "hug" }, height: { type: "hug" } },
  borderRadius: { topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0 },
  layout: {
    type: "stack",
    direction: "vertical",
    gap: 0,
    align: "start",
    distribute: "start",
  },
  padding: { top: 0, right: 0, bottom: 0, left: 0 },
  opacity: 1,
  shadow: { color: { r: 0, g: 0, b: 0, a: 0 }, x: 0, y: 0, blur: 0, spread: 0 },
};

export function createFrame(
  opts: Pick<FrameNode, "id"> & Partial<Omit<FrameNode, "id" | "type">>,
): FrameNode {
  return { type: "frame", ...frameDefaults, ...opts };
}

export function frameStyle(style: FrameStyle) {
  const parts = [
    fillStyle(style.fill),
    bordersStyle(style.borders),
    borderRadiusStyle(style.borderRadius),
    dimensionsStyle(style.dimensions),
    layoutStyle(style.layout),
    paddingStyle(style.padding),
    opacityStyle(style.opacity),
    shadowStyle(style.shadow),
  ].filter((s) => s !== "");

  return parts.join("; ");
}
