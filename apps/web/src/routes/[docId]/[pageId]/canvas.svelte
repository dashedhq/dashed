<script lang="ts">
  import {
    type Node,
    nodeStyle,
    paragraphStyle,
    runStyle,
    type ScreenNode,
    screenStyle,
  } from "@dashedhq/core";

  import {
    type AlignResult,
    computeAlignment,
    type ScreenRect,
  } from "./alignment-guides";
  import AlignmentOverlay from "./alignment-overlay.svelte";
  import { type CanvasMeasurements, getEditorState } from "./editor-state.svelte";
  import { computeGap, computeInsets, type DocRect, type GapLine } from "./gap-measurement";
  import GapOverlay from "./gap-overlay.svelte";
  import SelectionOverlay from "./selection-overlay.svelte";
  import TextEditor from "./text-editor.svelte";

  const editor = getEditorState();

  let spaceHeld = $state(false);
  let dragging = $state(false);

  let canvasEl = $state<HTMLDivElement>();

  // --- Screen drag state ---
  let screenDrag = $state<{
    screenId: string;
    rawX: number;
    rawY: number;
    started: boolean;
    pointerId: number;
  } | null>(null);
  let alignResult = $state<AlignResult | null>(null);
  let screenDragJustEnded = false;

  // --- Gap measurement state (Option/Alt + hover) ---
  let altHeld = $state(false);
  let gapLines = $state<GapLine[]>([]);

  function toDocRect(
    rect: DOMRect,
    cm: CanvasMeasurements,
  ): DocRect {
    return {
      x: (rect.x - cm.boundingRect.x - cm.clientLeft - editor.panX) / editor.zoom,
      y: (rect.y - cm.boundingRect.y - cm.clientTop - editor.panY) / editor.zoom,
      width: rect.width / editor.zoom,
      height: rect.height / editor.zoom,
    };
  }

  function handleGapMeasure(e: PointerEvent) {
    if (!editor.selectedNodeId || !canvasEl || !editor.canvasMeasurements) {
      gapLines = [];
      return;
    }

    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el) {
      gapLines = [];
      return;
    }

    const targetEl = (el as HTMLElement).closest(
      "[data-id]",
    ) as HTMLElement | null;
    if (!targetEl) {
      gapLines = [];
      return;
    }

    const targetId = targetEl.dataset.id!;

    // Ignore hovering the selected node itself
    if (targetId === editor.selectedNodeId) {
      gapLines = [];
      return;
    }

    const selectedEl = canvasEl.querySelector(
      `[data-id="${editor.selectedNodeId}"]`,
    ) as HTMLElement | null;
    if (!selectedEl) {
      gapLines = [];
      return;
    }

    const cm = editor.canvasMeasurements;
    const selectedRect = toDocRect(selectedEl.getBoundingClientRect(), cm);
    const targetRect = toDocRect(targetEl.getBoundingClientRect(), cm);

    // If target is the parent of the selected node → show insets
    const parent = editor.findParent(editor.selectedNodeId);
    if (parent && parent.id === targetId) {
      gapLines = computeInsets(selectedRect, targetRect);
    } else {
      gapLines = computeGap(selectedRect, targetRect);
    }
  }

  function getOtherScreenRects(excludeId: string): ScreenRect[] {
    return editor.topLevelNodes
      .filter(
        (n): n is ScreenNode => n.type === "screen" && n.id !== excludeId,
      )
      .map((n) => ({ id: n.id, x: n.x, y: n.y, width: n.width, height: n.height }));
  }

  function handleScreenPointerDown(e: PointerEvent, node: ScreenNode) {
    if (spaceHeld) {return;}
    e.preventDefault();
    e.stopPropagation();
    editor.selectNode(node.id);
    screenDrag = {
      screenId: node.id,
      rawX: node.x,
      rawY: node.y,
      started: false,
      pointerId: e.pointerId,
    };
    canvasEl!.setPointerCapture(e.pointerId);
  }

  function handleScreenDragMove(e: PointerEvent) {
    if (!screenDrag) {return;}

    const dx = e.movementX / editor.zoom;
    const dy = e.movementY / editor.zoom;
    screenDrag.rawX += dx;
    screenDrag.rawY += dy;

    if (!screenDrag.started) {
      const screen = editor.getScreen(screenDrag.screenId);
      const dist = Math.hypot(
        screenDrag.rawX - screen.x,
        screenDrag.rawY - screen.y,
      );
      if (dist < 2) {return;}
      screenDrag.started = true;
      editor.beginPatch();
    }

    const screen = editor.getScreen(screenDrag.screenId);
    const others = getOtherScreenRects(screenDrag.screenId);
    const result = computeAlignment(
      {
        id: screen.id,
        x: screenDrag.rawX,
        y: screenDrag.rawY,
        width: screen.width,
        height: screen.height,
      },
      others,
    );

    alignResult = result;
    editor.updateScreen(screenDrag.screenId, (s) => {
      s.x = Math.round(result.snappedX);
      s.y = Math.round(result.snappedY);
    });
  }

  function handleScreenDragEnd() {
    if (!screenDrag) {return;}
    if (screenDrag.started) {
      editor.commitPatch();
      screenDragJustEnded = true;
      requestAnimationFrame(() => {
        screenDragJustEnded = false;
      });
    }
    canvasEl?.releasePointerCapture(screenDrag.pointerId);
    screenDrag = null;
    alignResult = null;
  }

  $effect(() => {
    if (!canvasEl) {
      return;
    }
    const cleanup = editor.registerCanvasEl(canvasEl);
    const handleWheel = (e: WheelEvent) => {
      if (!canvasEl) {
        return;
      }
      e.preventDefault();
      if (e.ctrlKey) {
        const rect = canvasEl.getBoundingClientRect();
        const mx = e.clientX - rect.left - canvasEl.clientLeft;
        const my = e.clientY - rect.top - canvasEl.clientTop;
        editor.applyZoom(mx, my, Math.pow(2, -e.deltaY / 150));
      } else {
        editor.pan(-e.deltaX, -e.deltaY);
      }
    };
    canvasEl.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      canvasEl?.removeEventListener("wheel", handleWheel);
      cleanup();
    };
  });

  const isTextEditing = $derived(
    editor.selectedNode != null && editor.editMode?.type === "text",
  );

  $effect(() => {
    const id = editor.selectedNodeId;
    if (!id || !canvasEl) {
      return;
    }
    const el = canvasEl.querySelector(
      `[data-id="${id}"]`,
    ) as HTMLElement | null;
    if (!el) {
      return;
    }
    return editor.registerSelectedNodeEl(el);
  });
</script>

{#snippet renderNode(node: Node)}
  <!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events -->
  <div
    style={nodeStyle(node)}
    class="select-none"
    data-id={node.id}
    onclick={(e) => {
      e.stopPropagation();
      editor.selectNode(node.id);
    }}
    ondblclick={(e) => {
      e.stopPropagation();
      if (node.type === "text") {
        editor.startTextEdit();
      }
    }}
  >
    {#if node.type === "text" && editor.selectedNodeId === node.id && isTextEditing}
      <TextEditor
        {node}
        onExit={() => editor.stopTextEdit()}
        onReady={(v, s) => editor.registerTextEditor(v, s)}
        onStateChange={(s) => editor.updateTextEditorState(s)}
      />
    {:else if node.type === "text"}
      {#each node.content as paragraph, i (i)}
        <p style={paragraphStyle(paragraph, node)}>
          {#each paragraph.content as run, j (j)}
            <span style={runStyle(run, node)}>{run.text}</span>
          {/each}
        </p>
      {/each}
    {:else if node.type === "frame"}
      {#each editor.resolveChildren(node.children) as child (child.id)}
        {@render renderNode(child)}
      {/each}
    {/if}
  </div>
{/snippet}

<svelte:window
  onkeydown={(e) => {
    if (!canvasEl) {
      return;
    }
    const focused = document.activeElement;
    const isInput =
      focused instanceof HTMLInputElement ||
      focused instanceof HTMLTextAreaElement;
    if (isInput || isTextEditing) {
      return;
    }
    if (e.code === "Space" && !e.repeat) {
      e.preventDefault();
      spaceHeld = true;
    }
    if (e.key === "Alt" && !e.repeat) {
      altHeld = true;
    }
    if ((e.metaKey || e.ctrlKey) && e.code === "KeyZ") {
      e.preventDefault();
      if (e.shiftKey) {
        editor.redo();
      } else {
        editor.undo();
      }
    }
    if (
      (e.code === "Backspace" || e.code === "Delete") &&
      editor.selectedNodeId
    ) {
      e.preventDefault();
      editor.deleteNode(editor.selectedNodeId);
    }
    if (
      (e.metaKey || e.ctrlKey) &&
      (e.code === "Equal" || e.code === "Minus" || e.code === "Digit0")
    ) {
      e.preventDefault();
      if (e.code === "Digit0") {
        editor.resetZoom();
      } else {
        const factor = e.code === "Equal" ? 1.25 : 0.8;
        const rect = canvasEl.getBoundingClientRect();
        editor.applyZoom(rect.width / 2, rect.height / 2, factor);
      }
    }
  }}
  onkeyup={(e) => {
    if (e.code === "Space") {
      spaceHeld = false;
      dragging = false;
    }
    if (e.key === "Alt") {
      altHeld = false;
      gapLines = [];
    }
  }}
/>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions, a11y_click_events_have_key_events -->
<div
  bind:this={canvasEl}
  role="application"
  aria-label="Design canvas"
  class="flex-1 bg-neutral-950 border border-neutral-700 rounded-xl overflow-hidden relative
    {spaceHeld ? (dragging ? 'cursor-grabbing' : 'cursor-grab') : ''}"
  onclick={() => {
    if (dragging || screenDragJustEnded) {
      return;
    }
    editor.clearNodeSelection();
  }}
  onpointerdown={(e) => {
    if (!spaceHeld) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    dragging = true;
    e.currentTarget.setPointerCapture(e.pointerId);
  }}
  onpointermove={(e) => {
    if (screenDrag) {
      handleScreenDragMove(e);
      return;
    }
    if (dragging) {
      editor.pan(e.movementX, e.movementY);
      return;
    }
    if (altHeld && editor.selectedNodeId) {
      handleGapMeasure(e);
    } else if (gapLines.length > 0) {
      gapLines = [];
    }
  }}
  onpointerup={(e) => {
    if (screenDrag) {
      handleScreenDragEnd();
      return;
    }
    if (!dragging) {
      return;
    }
    dragging = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  }}
>
  <div
    style="transform: translate({editor.panX}px, {editor.panY}px) scale({editor.zoom}); transform-origin: 0 0"
  >
    {#each editor.topLevelNodes as node (node.id)}
      {#if node.type === "screen"}
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
          class="absolute text-xs text-neutral-400 select-none whitespace-nowrap"
          style="left: {node.x}px; top: {node.y - 24}px; cursor: {spaceHeld ? '' : 'default'}"
          onclick={(e) => {
            e.stopPropagation();
            if (!screenDrag) {editor.selectNode(node.id);}
          }}
          onpointerdown={(e) => handleScreenPointerDown(e, node)}
        >
          {node.name}
        </div>
        <!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events -->
        <div
          class="absolute overflow-hidden"
          data-id={node.id}
          style="left: {node.x}px; top: {node.y}px; {screenStyle(node)}"
          onclick={(e) => {
            e.stopPropagation();
            if (!screenDrag) {editor.selectNode(node.id);}
          }}
          onpointerdown={(e) => {
            if (e.target === e.currentTarget) {
              handleScreenPointerDown(e, node);
            }
          }}
        >
          {#each editor.resolveChildren(node.children) as child (child.id)}
            {@render renderNode(child)}
          {/each}
        </div>
      {/if}
    {/each}
  </div>

  {#if alignResult && screenDrag?.started}
    <AlignmentOverlay result={alignResult} />
  {/if}

  {#if gapLines.length > 0}
    <GapOverlay lines={gapLines} />
  {/if}

  {#if editor.selectedNode && editor.nodeMeasurements && editor.canvasMeasurements}
    <SelectionOverlay
      node={editor.selectedNode}
      nodeMeasurements={editor.nodeMeasurements}
      canvasMeasurements={editor.canvasMeasurements}
    />
  {/if}
</div>
