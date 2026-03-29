export type ScreenRect = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Guide = {
  /** 'x' = vertical line at this x-position; 'y' = horizontal line at this y-position */
  axis: "x" | "y";
  position: number;
  start: number;
  end: number;
};

export type DistanceIndicator = {
  /** 'x' = horizontal measurement; 'y' = vertical measurement */
  axis: "x" | "y";
  from: number;
  to: number;
  /** Position on the perpendicular axis (where the label sits) */
  position: number;
};

export type AlignResult = {
  snappedX: number;
  snappedY: number;
  guides: Guide[];
  distances: DistanceIndicator[];
};

const SNAP_THRESHOLD = 5;
const GUIDE_PADDING = 20;

function xEdges(r: ScreenRect): number[] {
  return [r.x, r.x + r.width / 2, r.x + r.width];
}

function yEdges(r: ScreenRect): number[] {
  return [r.y, r.y + r.height / 2, r.y + r.height];
}

export function computeAlignment(
  dragged: ScreenRect,
  others: ScreenRect[],
  threshold = SNAP_THRESHOLD,
): AlignResult {
  if (others.length === 0) {
    return {
      snappedX: dragged.x,
      snappedY: dragged.y,
      guides: [],
      distances: [],
    };
  }

  // --- Find best X snap (produces vertical guides) ---
  let bestXOffset = 0;
  let bestXDist = Infinity;

  const dxEdges = xEdges(dragged);
  for (const other of others) {
    for (const de of dxEdges) {
      for (const oe of xEdges(other)) {
        const d = Math.abs(de - oe);
        if (d < bestXDist) {
          bestXDist = d;
          bestXOffset = oe - de;
        }
      }
    }
  }

  // --- Find best Y snap (produces horizontal guides) ---
  let bestYOffset = 0;
  let bestYDist = Infinity;

  const dyEdges = yEdges(dragged);
  for (const other of others) {
    for (const de of dyEdges) {
      for (const oe of yEdges(other)) {
        const d = Math.abs(de - oe);
        if (d < bestYDist) {
          bestYDist = d;
          bestYOffset = oe - de;
        }
      }
    }
  }

  const snapX = bestXDist <= threshold;
  const snapY = bestYDist <= threshold;

  const snappedX = snapX ? dragged.x + bestXOffset : dragged.x;
  const snappedY = snapY ? dragged.y + bestYOffset : dragged.y;

  const snapped: ScreenRect = { ...dragged, x: snappedX, y: snappedY };
  const guides: Guide[] = [];
  const distances: DistanceIndicator[] = [];

  // After snapping, find ALL edges that now align (not just the one that
  // triggered the snap). This surfaces center guides and equal-size guides
  // automatically — e.g. if two screens share the same height and their tops
  // are snapped, the bottom edges also match and get their own guide.

  if (snapX) {
    const snappedXEdges = xEdges(snapped);
    const seen = new Set<number>();
    for (const de of snappedXEdges) {
      for (const o of others) {
        if (xEdges(o).some((oe) => Math.abs(de - oe) < 1) && !seen.has(de)) {
          seen.add(de);
          let minY = snapped.y;
          let maxY = snapped.y + snapped.height;
          for (const o2 of others) {
            if (xEdges(o2).some((e) => Math.abs(e - de) < 1)) {
              minY = Math.min(minY, o2.y);
              maxY = Math.max(maxY, o2.y + o2.height);
            }
          }
          guides.push({
            axis: "x",
            position: de,
            start: minY - GUIDE_PADDING,
            end: maxY + GUIDE_PADDING,
          });
        }
      }
    }
    addDistances(snapped, others, "y", distances);
  }

  if (snapY) {
    const snappedYEdges = yEdges(snapped);
    const seen = new Set<number>();
    for (const de of snappedYEdges) {
      for (const o of others) {
        if (yEdges(o).some((oe) => Math.abs(de - oe) < 1) && !seen.has(de)) {
          seen.add(de);
          let minX = snapped.x;
          let maxX = snapped.x + snapped.width;
          for (const o2 of others) {
            if (yEdges(o2).some((e) => Math.abs(e - de) < 1)) {
              minX = Math.min(minX, o2.x);
              maxX = Math.max(maxX, o2.x + o2.width);
            }
          }
          guides.push({
            axis: "y",
            position: de,
            start: minX - GUIDE_PADDING,
            end: maxX + GUIDE_PADDING,
          });
        }
      }
    }
    addDistances(snapped, others, "x", distances);
  }

  return { snappedX, snappedY, guides, distances };
}

function addDistances(
  snapped: ScreenRect,
  others: ScreenRect[],
  measureAxis: "x" | "y",
  out: DistanceIndicator[],
) {
  if (measureAxis === "x") {
    const sL = snapped.x;
    const sR = snapped.x + snapped.width;
    const sMidY = snapped.y + snapped.height / 2;

    let closestLeftEdge: number | null = null;
    let closestRightEdge: number | null = null;

    for (const o of others) {
      if (o.y + o.height <= snapped.y || o.y >= snapped.y + snapped.height)
        {continue;}
      const oR = o.x + o.width;
      const oL = o.x;
      if (oR <= sL && (closestLeftEdge === null || oR > closestLeftEdge))
        {closestLeftEdge = oR;}
      if (oL >= sR && (closestRightEdge === null || oL < closestRightEdge))
        {closestRightEdge = oL;}
    }

    if (closestLeftEdge !== null && sL - closestLeftEdge > 0) {
      out.push({ axis: "x", from: closestLeftEdge, to: sL, position: sMidY });
    }
    if (closestRightEdge !== null && closestRightEdge - sR > 0) {
      out.push({ axis: "x", from: sR, to: closestRightEdge, position: sMidY });
    }
  } else {
    const sT = snapped.y;
    const sB = snapped.y + snapped.height;
    const sMidX = snapped.x + snapped.width / 2;

    let closestAboveEdge: number | null = null;
    let closestBelowEdge: number | null = null;

    for (const o of others) {
      if (o.x + o.width <= snapped.x || o.x >= snapped.x + snapped.width)
        {continue;}
      const oB = o.y + o.height;
      const oT = o.y;
      if (oB <= sT && (closestAboveEdge === null || oB > closestAboveEdge))
        {closestAboveEdge = oB;}
      if (oT >= sB && (closestBelowEdge === null || oT < closestBelowEdge))
        {closestBelowEdge = oT;}
    }

    if (closestAboveEdge !== null && sT - closestAboveEdge > 0) {
      out.push({ axis: "y", from: closestAboveEdge, to: sT, position: sMidX });
    }
    if (closestBelowEdge !== null && closestBelowEdge - sB > 0) {
      out.push({
        axis: "y",
        from: sB,
        to: closestBelowEdge,
        position: sMidX,
      });
    }
  }
}
