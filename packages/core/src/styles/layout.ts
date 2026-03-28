export type StackDirection = "horizontal" | "vertical";
export type StackAlignment = "start" | "center" | "end";
export type StackDistribution = "start" | "center" | "end" | "space-between";

export type StackLayout = {
  type: "stack";
  direction: StackDirection;
  gap: number;
  align: StackAlignment;
  distribute: StackDistribution;
};

export type Layout = StackLayout;

export type FixedSize = { type: "fixed"; value: number };
export type HugSize = { type: "hug" };
export type FillSize = { type: "fill" };

export type Size = FixedSize | HugSize | FillSize;

export type Dimensions = {
  width: Size;
  height: Size;
  minWidth: number;
  maxWidth: number | "none";
  minHeight: number;
  maxHeight: number | "none";
};

export type Padding = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

const alignMap: Record<StackAlignment, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
};

const distributeMap: Record<StackDistribution, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  "space-between": "space-between",
};

function sizeToCss(size: Size) {
  if (size.type === "fixed") {
    return `${size.value}px`;
  }
  if (size.type === "hug") {
    return "fit-content";
  }
  return "100%";
}

export function layoutStyle(layout: Layout) {
  if (layout.type === "stack") {
    const direction = layout.direction === "horizontal" ? "row" : "column";
    const parts = [
      "display: flex",
      `flex-direction: ${direction}`,
      `align-items: ${alignMap[layout.align]}`,
      `justify-content: ${distributeMap[layout.distribute]}`,
    ];

    if (layout.gap > 0) {
      parts.push(`gap: ${layout.gap}px`);
    }

    return parts.join("; ");
  }

  return "";
}

export function dimensionsStyle(dimensions: Dimensions) {
  const parts = [
    `width: ${sizeToCss(dimensions.width)}`,
    `height: ${sizeToCss(dimensions.height)}`,
  ];
  if (dimensions.minWidth > 0) {
    parts.push(`min-width: ${dimensions.minWidth}px`);
  }
  if (dimensions.maxWidth !== "none") {
    parts.push(`max-width: ${dimensions.maxWidth}px`);
  }
  if (dimensions.minHeight > 0) {
    parts.push(`min-height: ${dimensions.minHeight}px`);
  }
  if (dimensions.maxHeight !== "none") {
    parts.push(`max-height: ${dimensions.maxHeight}px`);
  }
  return parts.join("; ");
}

export type InsetValue = number | "auto";

export type Insets = {
  top: InsetValue;
  right: InsetValue;
  bottom: InsetValue;
  left: InsetValue;
};

export type AutoPosition = { type: "auto" };
export type AbsolutePosition = { type: "absolute"; insets: Insets };

export type Position = AutoPosition | AbsolutePosition;

export function positionStyle(position: Position) {
  if (position.type === "auto") {
    return "";
  }
  const parts: string[] = ["position: absolute"];
  const { top, right, bottom, left } = position.insets;
  if (top !== "auto") {
    parts.push(`top: ${top}px`);
  }
  if (right !== "auto") {
    parts.push(`right: ${right}px`);
  }
  if (bottom !== "auto") {
    parts.push(`bottom: ${bottom}px`);
  }
  if (left !== "auto") {
    parts.push(`left: ${left}px`);
  }
  return parts.join("; ");
}

export function paddingStyle(padding: Padding) {
  if (
    padding.top === 0 &&
    padding.right === 0 &&
    padding.bottom === 0 &&
    padding.left === 0
  ) {
    return "";
  }

  return `padding: ${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`;
}

export type Overflow = "visible" | "hidden" | "scroll";

export function overflowStyle(overflow: Overflow) {
  if (overflow === "visible") {
    return "";
  }
  if (overflow === "scroll") {
    return "overflow: auto";
  }
  return `overflow: ${overflow}`;
}
