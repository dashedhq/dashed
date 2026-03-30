<script lang="ts">
  import type { Node, Size } from "@dashedhq/core";

  import { clampMin } from "$lib/utils";

  import type { Guide } from "./alignment-guides";
  import {
    type CanvasMeasurements,
    getEditorState,
    type NodeMeasurements,
  } from "./editor-state.svelte";

  type Props = {
    node: Node;
    nodeMeasurements: NodeMeasurements;
    canvasMeasurements: CanvasMeasurements;
  };

  let { node, nodeMeasurements, canvasMeasurements }: Props = $props();
  const editor = getEditorState();

  // -- Resize snap helpers --

  const SNAP_THRESHOLD = 5;
  const GUIDE_PADDING = 20;

  type Rect = { x: number; y: number; width: number; height: number };

  function domToDoc(r: DOMRect): Rect {
    return {
      x:
        (r.x -
          canvasMeasurements.boundingRect.x -
          canvasMeasurements.clientLeft -
          editor.panX) /
        editor.zoom,
      y:
        (r.y -
          canvasMeasurements.boundingRect.y -
          canvasMeasurements.clientTop -
          editor.panY) /
        editor.zoom,
      width: r.width / editor.zoom,
      height: r.height / editor.zoom,
    };
  }

  function findSnapEdge(
    proposed: number,
    edges: number[],
  ): number | null {
    let best: number | null = null;
    let bestDist = SNAP_THRESHOLD + 1;
    for (const edge of edges) {
      const d = Math.abs(proposed - edge);
      if (d <= SNAP_THRESHOLD && d < bestDist) {
        best = edge;
        bestDist = d;
      }
    }
    return best;
  }

  function makeGuide(
    axis: "x" | "y",
    position: number,
    nr: Rect,
    sibRects: Rect[],
  ): Guide {
    if (axis === "x") {
      let minY = nr.y;
      let maxY = nr.y + nr.height;
      for (const r of sibRects) {
        if (
          Math.abs(r.x - position) < 1 ||
          Math.abs(r.x + r.width - position) < 1
        ) {
          minY = Math.min(minY, r.y);
          maxY = Math.max(maxY, r.y + r.height);
        }
      }
      return { axis, position, start: minY - GUIDE_PADDING, end: maxY + GUIDE_PADDING };
    }
    let minX = nr.x;
    let maxX = nr.x + nr.width;
    for (const r of sibRects) {
      if (
        Math.abs(r.y - position) < 1 ||
        Math.abs(r.y + r.height - position) < 1
      ) {
        minX = Math.min(minX, r.x);
        maxX = Math.max(maxX, r.x + r.width);
      }
    }
    return { axis, position, start: minX - GUIDE_PADDING, end: maxX + GUIDE_PADDING };
  }

  const overlay = $derived.by(() => ({
    x: nodeMeasurements.boundingRect.x - canvasMeasurements.boundingRect.x - canvasMeasurements.clientLeft,
    y: nodeMeasurements.boundingRect.y - canvasMeasurements.boundingRect.y - canvasMeasurements.clientTop,
    width: nodeMeasurements.boundingRect.width,
    height: nodeMeasurements.boundingRect.height,
  }));

  // -- Resize --

  type ResizeHandle =
    | "top"
    | "bottom"
    | "left"
    | "right"
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right";

  let resizeHandle = $state<ResizeHandle | null>(null);
  let resizeSiblingIds: string[] = [];
  let rawWidth = 0;
  let rawHeight = 0;
  let resizeGuides = $state<Guide[]>([]);

  function resizesRight(h: ResizeHandle): boolean {
    return h === "right" || h === "top-right" || h === "bottom-right";
  }

  function resizesLeft(h: ResizeHandle): boolean {
    return h === "left" || h === "top-left" || h === "bottom-left";
  }

  function resizesBottom(h: ResizeHandle): boolean {
    return h === "bottom" || h === "bottom-left" || h === "bottom-right";
  }

  function resizesTop(h: ResizeHandle): boolean {
    return h === "top" || h === "top-left" || h === "top-right";
  }

  function resizesX(h: ResizeHandle): boolean {
    return resizesLeft(h) || resizesRight(h);
  }

  function resizesY(h: ResizeHandle): boolean {
    return resizesTop(h) || resizesBottom(h);
  }

  function startResize(e: PointerEvent, handle: ResizeHandle) {
    e.preventDefault();
    e.stopPropagation();
    if (node.type !== "frame" && node.type !== "text") {
      return;
    }

    // Convert hug/fill to fixed using current rendered size
    if (resizesX(handle) && node.dimensions.width.type !== "fixed") {
      editor.resizeNode(node.id, {
        width: { type: "fixed", value: nodeMeasurements.offsetWidth },
      });
    }
    if (resizesY(handle) && node.dimensions.height.type !== "fixed") {
      editor.resizeNode(node.id, {
        height: { type: "fixed", value: nodeMeasurements.offsetHeight },
      });
    }

    // Capture raw dimensions and siblings for snap
    rawWidth = nodeMeasurements.offsetWidth;
    rawHeight = nodeMeasurements.offsetHeight;
    const parent = editor.findParent(node.id);
    if (parent && (parent.type === "frame" || parent.type === "screen")) {
      resizeSiblingIds = parent.children.filter((id) => id !== node.id);
    } else {
      resizeSiblingIds = [];
    }

    resizeHandle = handle;
    editor.beginPatch();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function handleResizeMove(e: PointerEvent) {
    if (!resizeHandle || (node.type !== "frame" && node.type !== "text")) {
      return;
    }

    const dx = e.movementX / editor.zoom;
    const dy = e.movementY / editor.zoom;

    // Track raw (unsnapped) dimensions
    if (resizesRight(resizeHandle)) {rawWidth += dx;}
    if (resizesLeft(resizeHandle)) {rawWidth -= dx;}
    if (resizesBottom(resizeHandle)) {rawHeight += dy;}
    if (resizesTop(resizeHandle)) {rawHeight -= dy;}

    let snappedWidth = rawWidth;
    let snappedHeight = rawHeight;
    const newGuides: Guide[] = [];

    // Snap against sibling edges
    if (resizeSiblingIds.length > 0) {
      const nodeEl = document.querySelector(
        `[data-id="${node.id}"]`,
      ) as HTMLElement | null;
      if (nodeEl) {
        const nr = domToDoc(nodeEl.getBoundingClientRect());
        const sibRects: Rect[] = [];
        const sibXEdges: number[] = [];
        const sibYEdges: number[] = [];

        for (const id of resizeSiblingIds) {
          const el = document.querySelector(
            `[data-id="${id}"]`,
          ) as HTMLElement | null;
          if (!el) {continue;}
          const r = domToDoc(el.getBoundingClientRect());
          sibRects.push(r);
          sibXEdges.push(r.x, r.x + r.width);
          sibYEdges.push(r.y, r.y + r.height);
        }

        if (resizesRight(resizeHandle)) {
          const snap = findSnapEdge(nr.x + rawWidth, sibXEdges);
          if (snap) {
            snappedWidth = snap - nr.x;
            newGuides.push(makeGuide("x", snap, nr, sibRects));
          }
        } else if (resizesLeft(resizeHandle)) {
          const anchorRight = nr.x + nr.width;
          const snap = findSnapEdge(anchorRight - rawWidth, sibXEdges);
          if (snap) {
            snappedWidth = anchorRight - snap;
            newGuides.push(makeGuide("x", snap, nr, sibRects));
          }
        }

        if (resizesBottom(resizeHandle)) {
          const snap = findSnapEdge(nr.y + rawHeight, sibYEdges);
          if (snap) {
            snappedHeight = snap - nr.y;
            newGuides.push(makeGuide("y", snap, nr, sibRects));
          }
        } else if (resizesTop(resizeHandle)) {
          const anchorBottom = nr.y + nr.height;
          const snap = findSnapEdge(anchorBottom - rawHeight, sibYEdges);
          if (snap) {
            snappedHeight = anchorBottom - snap;
            newGuides.push(makeGuide("y", snap, nr, sibRects));
          }
        }
      }
    }

    resizeGuides = newGuides;

    const size: { width?: Size; height?: Size } = {};
    if (resizesX(resizeHandle)) {
      size.width = { type: "fixed", value: clampMin(snappedWidth, 1) };
    }
    if (resizesY(resizeHandle)) {
      size.height = { type: "fixed", value: clampMin(snappedHeight, 1) };
    }
    editor.resizeNode(node.id, size);
  }

  function handleResizeEnd(e: PointerEvent) {
    if (!resizeHandle) {
      return;
    }
    resizeHandle = null;
    resizeGuides = [];
    resizeSiblingIds = [];
    editor.commitPatch();
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  }

  function resetToHug(e: MouseEvent, axis: "x" | "y") {
    e.preventDefault();
    e.stopPropagation();
    editor.resizeNode(
      node.id,
      axis === "x" ? { width: { type: "hug" } } : { height: { type: "hug" } },
    );
  }

  const HANDLE_SIZE = 8;
  const EDGE_THICKNESS = 6;

  const corners: { handle: ResizeHandle; x: number; y: number }[] = $derived([
    { handle: "top-left", x: overlay.x, y: overlay.y },
    {
      handle: "top-right",
      x: overlay.x + overlay.width,
      y: overlay.y,
    },
    {
      handle: "bottom-left",
      x: overlay.x,
      y: overlay.y + overlay.height,
    },
    {
      handle: "bottom-right",
      x: overlay.x + overlay.width,
      y: overlay.y + overlay.height,
    },
  ]);
</script>

<!-- Selection outline -->
<div
  class="absolute pointer-events-none z-10 outline-2 outline-blue-500"
  style="left: {overlay.x}px; top: {overlay.y}px; width: {overlay.width}px; height: {overlay.height}px"
></div>

{#if node.type === "frame" || node.type === "text"}
  <!-- Edge hit areas -->
  <button
    aria-label="Resize top"
    class="absolute z-20 cursor-ns-resize appearance-none bg-transparent border-none p-0"
    style="left: {overlay.x + HANDLE_SIZE}px; top: {overlay.y -
      EDGE_THICKNESS / 2}px; width: {overlay.width -
      HANDLE_SIZE * 2}px; height: {EDGE_THICKNESS}px"
    onclick={(e) => e.stopPropagation()}
    onpointerdown={(e) => startResize(e, "top")}
    onpointermove={handleResizeMove}
    onpointerup={handleResizeEnd}
    ondblclick={(e) => resetToHug(e, "y")}
  ></button>
  <button
    aria-label="Resize bottom"
    class="absolute z-20 cursor-ns-resize appearance-none bg-transparent border-none p-0"
    style="left: {overlay.x + HANDLE_SIZE}px; top: {overlay.y +
      overlay.height -
      EDGE_THICKNESS / 2}px; width: {overlay.width -
      HANDLE_SIZE * 2}px; height: {EDGE_THICKNESS}px"
    onclick={(e) => e.stopPropagation()}
    onpointerdown={(e) => startResize(e, "bottom")}
    onpointermove={handleResizeMove}
    onpointerup={handleResizeEnd}
    ondblclick={(e) => resetToHug(e, "y")}
  ></button>
  <button
    aria-label="Resize left"
    class="absolute z-20 cursor-ew-resize appearance-none bg-transparent border-none p-0"
    style="left: {overlay.x - EDGE_THICKNESS / 2}px; top: {overlay.y +
      HANDLE_SIZE}px; width: {EDGE_THICKNESS}px; height: {overlay.height -
      HANDLE_SIZE * 2}px"
    onclick={(e) => e.stopPropagation()}
    onpointerdown={(e) => startResize(e, "left")}
    onpointermove={handleResizeMove}
    onpointerup={handleResizeEnd}
    ondblclick={(e) => resetToHug(e, "x")}
  ></button>
  <button
    aria-label="Resize right"
    class="absolute z-20 cursor-ew-resize appearance-none bg-transparent border-none p-0"
    style="left: {overlay.x + overlay.width - EDGE_THICKNESS / 2}px; top: {overlay.y +
      HANDLE_SIZE}px; width: {EDGE_THICKNESS}px; height: {overlay.height -
      HANDLE_SIZE * 2}px"
    onclick={(e) => e.stopPropagation()}
    onpointerdown={(e) => startResize(e, "right")}
    onpointermove={handleResizeMove}
    onpointerup={handleResizeEnd}
    ondblclick={(e) => resetToHug(e, "x")}
  ></button>

  <!-- Corner handles -->
  {#each corners as corner (corner.handle)}
    <button
      aria-label="Resize {corner.handle}"
      class="absolute z-30 bg-white border-2 border-blue-500 appearance-none p-0"
      class:cursor-nwse-resize={corner.handle === "top-left" ||
        corner.handle === "bottom-right"}
      class:cursor-nesw-resize={corner.handle === "top-right" ||
        corner.handle === "bottom-left"}
      style="left: {corner.x - HANDLE_SIZE / 2}px; top: {corner.y -
        HANDLE_SIZE / 2}px; width: {HANDLE_SIZE}px; height: {HANDLE_SIZE}px"
      onclick={(e) => e.stopPropagation()}
      onpointerdown={(e) => startResize(e, corner.handle)}
      onpointermove={handleResizeMove}
      onpointerup={handleResizeEnd}
    ></button>
  {/each}
{/if}

{#if resizeGuides.length > 0}
  <svg class="absolute inset-0 pointer-events-none z-40 overflow-visible">
    {#each resizeGuides as guide, i (i)}
      {#if guide.axis === "x"}
        <line
          x1={guide.position * editor.zoom + editor.panX}
          y1={guide.start * editor.zoom + editor.panY}
          x2={guide.position * editor.zoom + editor.panX}
          y2={guide.end * editor.zoom + editor.panY}
          stroke="#f43f5e"
          stroke-width="1"
          stroke-dasharray="4 4"
        />
      {:else}
        <line
          x1={guide.start * editor.zoom + editor.panX}
          y1={guide.position * editor.zoom + editor.panY}
          x2={guide.end * editor.zoom + editor.panX}
          y2={guide.position * editor.zoom + editor.panY}
          stroke="#f43f5e"
          stroke-width="1"
          stroke-dasharray="4 4"
        />
      {/if}
    {/each}
  </svg>
{/if}
