export type DocRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type GapLine = {
  /** 'x' = horizontal measurement; 'y' = vertical measurement */
  axis: "x" | "y";
  from: number;
  to: number;
  /** Position on the perpendicular axis (where the label sits) */
  position: number;
};

/**
 * Compute edge-to-edge gap distances between two non-overlapping rects.
 * - Side-by-side → horizontal gap
 * - Stacked → vertical gap
 * - Diagonal → both
 * - Overlapping → nothing
 */
export function computeGap(selected: DocRect, hovered: DocRect): GapLine[] {
  const sL = selected.x;
  const sR = selected.x + selected.width;
  const sT = selected.y;
  const sB = selected.y + selected.height;
  const hL = hovered.x;
  const hR = hovered.x + hovered.width;
  const hT = hovered.y;
  const hB = hovered.y + hovered.height;

  const overlapX = sR > hL && sL < hR;
  const overlapY = sB > hT && sT < hB;

  const lines: GapLine[] = [];

  // Horizontal gap
  let hFrom: number | undefined;
  let hTo: number | undefined;
  if (sR <= hL) {
    hFrom = sR;
    hTo = hL;
  } else if (hR <= sL) {
    hFrom = hR;
    hTo = sL;
  }

  if (hFrom !== undefined && hTo !== undefined && hTo > hFrom) {
    const posY = overlapY
      ? (Math.max(sT, hT) + Math.min(sB, hB)) / 2
      : (sT + sB) / 2;
    lines.push({ axis: "x", from: hFrom, to: hTo, position: posY });
  }

  // Vertical gap
  let vFrom: number | undefined;
  let vTo: number | undefined;
  if (sB <= hT) {
    vFrom = sB;
    vTo = hT;
  } else if (hB <= sT) {
    vFrom = hB;
    vTo = sT;
  }

  if (vFrom !== undefined && vTo !== undefined && vTo > vFrom) {
    const posX = overlapX
      ? (Math.max(sL, hL) + Math.min(sR, hR)) / 2
      : (sL + sR) / 2;
    lines.push({ axis: "y", from: vFrom, to: vTo, position: posX });
  }

  return lines;
}

/**
 * Compute inset distances from a child rect to all four sides of its parent.
 * Only includes sides where the gap is positive.
 */
export function computeInsets(child: DocRect, parent: DocRect): GapLine[] {
  const lines: GapLine[] = [];
  const midX = child.x + child.width / 2;
  const midY = child.y + child.height / 2;

  const left = child.x - parent.x;
  if (left > 0) {
    lines.push({ axis: "x", from: parent.x, to: child.x, position: midY });
  }

  const right = parent.x + parent.width - (child.x + child.width);
  if (right > 0) {
    lines.push({
      axis: "x",
      from: child.x + child.width,
      to: parent.x + parent.width,
      position: midY,
    });
  }

  const top = child.y - parent.y;
  if (top > 0) {
    lines.push({ axis: "y", from: parent.y, to: child.y, position: midX });
  }

  const bottom = parent.y + parent.height - (child.y + child.height);
  if (bottom > 0) {
    lines.push({
      axis: "y",
      from: child.y + child.height,
      to: parent.y + parent.height,
      position: midX,
    });
  }

  return lines;
}
