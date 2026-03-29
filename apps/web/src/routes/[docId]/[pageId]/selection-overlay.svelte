<script lang="ts">
  import type { Node, Size } from "@dashedhq/core";

  import { clampMin } from "$lib/utils";

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
    const { width, height } = node.dimensions;
    const size: { width?: Size; height?: Size } = {};

    if (resizesRight(resizeHandle) && width.type === "fixed") {
      size.width = { type: "fixed", value: clampMin(width.value + dx, 1) };
    }
    if (resizesLeft(resizeHandle) && width.type === "fixed") {
      size.width = { type: "fixed", value: clampMin(width.value - dx, 1) };
    }
    if (resizesBottom(resizeHandle) && height.type === "fixed") {
      size.height = { type: "fixed", value: clampMin(height.value + dy, 1) };
    }
    if (resizesTop(resizeHandle) && height.type === "fixed") {
      size.height = { type: "fixed", value: clampMin(height.value - dy, 1) };
    }

    editor.resizeNode(node.id, size);
  }

  function handleResizeEnd(e: PointerEvent) {
    if (!resizeHandle) {
      return;
    }
    resizeHandle = null;
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
