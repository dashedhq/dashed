import {
  type BorderRadius,
  borderRadiusStyle,
  type Borders,
  bordersStyle,
} from "./styles/border";
import {
  type BlendMode,
  blendModeStyle,
  type EffectLayer,
  effectLayersStyle,
  opacityStyle,
  rotationStyle,
} from "./styles/effect";
import { type FillLayer, fillLayersStyle } from "./styles/fill";
import {
  type Dimensions,
  dimensionsStyle,
  type Layout,
  layoutStyle,
  type Overflow,
  overflowStyle,
  type Padding,
  paddingStyle,
  type Position,
  positionStyle,
} from "./styles/layout";

export type FrameStyle = {
  fills: FillLayer[];
  borders: Borders;
  dimensions: Dimensions;
  borderRadius: BorderRadius;
  layout: Layout;
  padding: Padding;
  opacity: number;
  effects: EffectLayer[];
  position: Position;
  overflow: Overflow;
  blendMode: BlendMode;
  rotation: number;
};

export type FrameNode = {
  id: string;
  name: string;
  type: "frame";
  visible: boolean;
  children: string[];
} & FrameStyle;

const frameDefaults: Omit<FrameNode, "id" | "type"> = {
  name: "Frame",
  visible: true,
  children: [],
  fills: [],
  borders: {
    color: { r: 0, g: 0, b: 0, a: 0 },
    style: "solid",
    widths: { top: 0, right: 0, bottom: 0, left: 0 },
  },
  dimensions: {
    width: { type: "hug" },
    height: { type: "hug" },
    minWidth: 0,
    maxWidth: "none",
    minHeight: 0,
    maxHeight: "none",
  },
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
  effects: [],
  position: { type: "auto" },
  overflow: "visible",
  blendMode: "normal",
  rotation: 0,
};

export function createFrame(
  opts: Pick<FrameNode, "id"> & Partial<Omit<FrameNode, "id" | "type">>,
): FrameNode {
  return { type: "frame", ...frameDefaults, ...opts };
}

export function frameStyle(style: FrameStyle) {
  const parts = [
    fillLayersStyle(style.fills),
    bordersStyle(style.borders),
    borderRadiusStyle(style.borderRadius),
    dimensionsStyle(style.dimensions),
    layoutStyle(style.layout),
    paddingStyle(style.padding),
    opacityStyle(style.opacity),
    effectLayersStyle(style.effects),
    positionStyle(style.position),
    overflowStyle(style.overflow),
    blendModeStyle(style.blendMode),
    rotationStyle(style.rotation),
  ].filter((s) => s !== "");

  return parts.join("; ");
}
