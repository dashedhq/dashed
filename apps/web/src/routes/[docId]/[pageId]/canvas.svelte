<script lang="ts">
  import {
    type Node,
    nodeStyle,
    paragraphStyle,
    runStyle,
    screenStyle,
  } from "@dashedhq/core";

  import { getEditorState } from "./editor-state.svelte";
  import SelectionOverlay from "./selection-overlay.svelte";
  import TextEditor from "./text-editor.svelte";

  const editor = getEditorState();

  let spaceHeld = $state(false);
  let dragging = $state(false);

  let canvasEl = $state<HTMLDivElement>();

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
    if (e.code === "Space" && !e.repeat && !isTextEditing) {
      e.preventDefault();
      spaceHeld = true;
    }
    const focused = document.activeElement;
    const isInput =
      focused instanceof HTMLInputElement ||
      focused instanceof HTMLTextAreaElement;
    if ((e.metaKey || e.ctrlKey) && e.code === "KeyZ" && !isInput && !isTextEditing) {
      e.preventDefault();
      if (e.shiftKey) {
        editor.redo();
      } else {
        editor.undo();
      }
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
    if (dragging) {
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
    if (!dragging) {
      return;
    }
    editor.pan(e.movementX, e.movementY);
  }}
  onpointerup={(e) => {
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
        <div
          class="absolute text-xs text-neutral-400 select-none whitespace-nowrap"
          style="left: {node.x}px; top: {node.y - 24}px"
        >
          {node.name}
        </div>
        <!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events -->
        <div
          class="absolute overflow-hidden"
          style="left: {node.x}px; top: {node.y}px; {screenStyle(node)}"
          onclick={(e) => {
            e.stopPropagation();
            editor.selectNode(node.id);
          }}
        >
          {#each editor.resolveChildren(node.children) as child (child.id)}
            {@render renderNode(child)}
          {/each}
        </div>
      {/if}
    {/each}
  </div>

  {#if editor.selectedNode && editor.nodeMeasurements && editor.canvasMeasurements}
    <SelectionOverlay
      node={editor.selectedNode}
      nodeMeasurements={editor.nodeMeasurements}
      canvasMeasurements={editor.canvasMeasurements}
    />
  {/if}
</div>
