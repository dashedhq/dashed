<script lang="ts">
  import type { Node } from "@dashedhq/core";

  type Props = {
    canvasEl: HTMLDivElement;
    node: Node;
    zoom: number;
    panX: number;
    panY: number;
  };

  let { canvasEl, node = $bindable(), zoom, panX, panY }: Props = $props();

  // -- Target element --

  const targetEl = $derived(canvasEl.querySelector(`[data-id="${node.id}"]`));

  // -- Selection rect --

  type Rect = { x: number; y: number; w: number; h: number };
  let selectionRect = $state<Rect | null>(null);

  function computeRect(target: Element): Rect {
    const canvasRect = canvasEl.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    return {
      x: targetRect.left - canvasRect.left - canvasEl.clientLeft,
      y: targetRect.top - canvasRect.top - canvasEl.clientTop,
      w: targetRect.width,
      h: targetRect.height,
    };
  }

  // Recompute rect when pan/zoom changes or targetEl resizes
  function updateRect() {
    selectionRect = targetEl ? computeRect(targetEl) : null;
  }

  // Re-run on pan/zoom changes
  $effect(() => {
    /* eslint-disable @typescript-eslint/no-unused-expressions */
    panX;
    panY;
    zoom;
    /* eslint-enable @typescript-eslint/no-unused-expressions */
    updateRect();
  });

  // Observe targetEl for size changes (only recreated when targetEl changes)
  $effect(() => {
    if (!targetEl) return;
    const observer = new ResizeObserver(() => updateRect());
    observer.observe(targetEl);
    return () => observer.disconnect();
  });

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

  function startResize(
    e: PointerEvent & {
      currentTarget: EventTarget & HTMLDivElement;
    },
    handle: ResizeHandle,
  ) {
    e.preventDefault();
    e.stopPropagation();
    if (node.type !== "frame") return;

    // Convert hug/fill to fixed using current rendered size
    if (
      resizesX(handle) &&
      node.dimensions.width.type !== "fixed" &&
      targetEl
    ) {
      node.dimensions.width = {
        type: "fixed",
        value: targetEl.getBoundingClientRect().width / zoom,
      };
    }
    if (
      resizesY(handle) &&
      node.dimensions.height.type !== "fixed" &&
      targetEl
    ) {
      node.dimensions.height = {
        type: "fixed",
        value: targetEl.getBoundingClientRect().height / zoom,
      };
    }

    resizeHandle = handle;
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onResizeMove(e: PointerEvent) {
    if (!resizeHandle || node.type !== "frame") return;

    const dx = e.movementX / zoom;
    const dy = e.movementY / zoom;

    if (resizesRight(resizeHandle) && node.dimensions.width.type === "fixed") {
      node.dimensions.width.value = Math.max(
        1,
        node.dimensions.width.value + dx,
      );
    }
    if (resizesLeft(resizeHandle) && node.dimensions.width.type === "fixed") {
      node.dimensions.width.value = Math.max(
        1,
        node.dimensions.width.value - dx,
      );
    }
    if (
      resizesBottom(resizeHandle) &&
      node.dimensions.height.type === "fixed"
    ) {
      node.dimensions.height.value = Math.max(
        1,
        node.dimensions.height.value + dy,
      );
    }
    if (resizesTop(resizeHandle) && node.dimensions.height.type === "fixed") {
      node.dimensions.height.value = Math.max(
        1,
        node.dimensions.height.value - dy,
      );
    }
  }

  function onResizeEnd(
    e: PointerEvent & { currentTarget: EventTarget & HTMLDivElement },
  ) {
    if (!resizeHandle) return;
    resizeHandle = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  }

  const HANDLE_SIZE = 8;
  const EDGE_THICKNESS = 6;
</script>

{#if selectionRect}
  {@const s = selectionRect}

  <!-- Selection outline -->
  <div
    class="absolute pointer-events-none z-10 outline-2 outline-blue-500"
    style="left: {s.x}px; top: {s.y}px; width: {s.w}px; height: {s.h}px"
  ></div>

  {#if node.type === "frame"}
    <!-- Edge hit areas -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="absolute z-20 cursor-ns-resize"
      style="left: {s.x + HANDLE_SIZE}px; top: {s.y -
        EDGE_THICKNESS / 2}px; width: {s.w -
        HANDLE_SIZE * 2}px; height: {EDGE_THICKNESS}px"
      onpointerdown={(e) => startResize(e, "top")}
      onpointermove={onResizeMove}
      onpointerup={onResizeEnd}
    ></div>
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="absolute z-20 cursor-ns-resize"
      style="left: {s.x + HANDLE_SIZE}px; top: {s.y +
        s.h -
        EDGE_THICKNESS / 2}px; width: {s.w -
        HANDLE_SIZE * 2}px; height: {EDGE_THICKNESS}px"
      onpointerdown={(e) => startResize(e, "bottom")}
      onpointermove={onResizeMove}
      onpointerup={onResizeEnd}
    ></div>
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="absolute z-20 cursor-ew-resize"
      style="left: {s.x - EDGE_THICKNESS / 2}px; top: {s.y +
        HANDLE_SIZE}px; width: {EDGE_THICKNESS}px; height: {s.h -
        HANDLE_SIZE * 2}px"
      onpointerdown={(e) => startResize(e, "left")}
      onpointermove={onResizeMove}
      onpointerup={onResizeEnd}
    ></div>
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="absolute z-20 cursor-ew-resize"
      style="left: {s.x + s.w - EDGE_THICKNESS / 2}px; top: {s.y +
        HANDLE_SIZE}px; width: {EDGE_THICKNESS}px; height: {s.h -
        HANDLE_SIZE * 2}px"
      onpointerdown={(e) => startResize(e, "right")}
      onpointermove={onResizeMove}
      onpointerup={onResizeEnd}
    ></div>

    <!-- Corner handles -->
    {@const corners: { handle: ResizeHandle; x: number; y: number }[] = [
      { handle: "top-left", x: s.x, y: s.y },
      { handle: "top-right", x: s.x + s.w, y: s.y },
      { handle: "bottom-left", x: s.x, y: s.y + s.h },
      { handle: "bottom-right", x: s.x + s.w, y: s.y + s.h },
    ]}
    {#each corners as corner (corner.handle)}
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="absolute z-30 bg-white border-2 border-blue-500"
        class:cursor-nwse-resize={corner.handle === "top-left" ||
          corner.handle === "bottom-right"}
        class:cursor-nesw-resize={corner.handle === "top-right" ||
          corner.handle === "bottom-left"}
        style="left: {corner.x - HANDLE_SIZE / 2}px; top: {corner.y -
          HANDLE_SIZE / 2}px; width: {HANDLE_SIZE}px; height: {HANDLE_SIZE}px"
        onpointerdown={(e) => startResize(e, corner.handle)}
        onpointermove={onResizeMove}
        onpointerup={onResizeEnd}
      ></div>
    {/each}
  {/if}
{/if}
