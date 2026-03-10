<script lang="ts">
  import {
    type Node,
    nodeStyle,
    type Page,
    resolveChildren,
    screenStyle,
    type TextNode,
    paragraphStyle,
    textRunStyle,
  } from "@opendesigner/core";
  import type { EditorState } from "prosemirror-state";
  import type { EditorView } from "prosemirror-view";

  import { docToNode } from "./prosemirror";
  import TextEditor from "./text-editor.svelte";

  type Props = {
    selection: string | null;
    page: Page;
    onTextEditStart: (v: EditorView, s: EditorState) => void;
    onTextEditEnd: () => void;
    onTextEditStateChange: (s: EditorState) => void;
  };

  let {
    selection = $bindable(),
    page = $bindable(),
    onTextEditStart,
    onTextEditEnd,
    onTextEditStateChange,
  }: Props = $props();

  let editingId = $state<string | null>(null);
  let editorState = $state.raw<EditorState | null>(null);

  let panX = $state(0);
  let panY = $state(0);
  let zoom = $state(1);
  let spaceHeld = $state(false);
  let dragging = $state(false);

  const selectionRect = $derived.by(
    (): {
      x: number;
      y: number;
      w: number;
      h: number;
    } | null => {
      // Subscribe to pan/zoom so the outline updates
      /* eslint-disable @typescript-eslint/no-unused-expressions */
      panX;
      panY;
      zoom;
      /* eslint-enable @typescript-eslint/no-unused-expressions */

      if (!selection) {
        return null;
      }

      const target = canvasEl.querySelector(`[data-id="${selection}"]`);
      if (!target) {
        return null;
      }
      const canvasRect = canvasEl.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      return {
        x: targetRect.left - canvasRect.left - canvasEl.clientLeft,
        y: targetRect.top - canvasRect.top - canvasEl.clientTop,
        w: targetRect.width,
        h: targetRect.height,
      };
    },
  );

  let canvasEl: HTMLDivElement;

  $effect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey) {
        const rect = canvasEl.getBoundingClientRect();
        const mx = e.clientX - rect.left - canvasEl.clientLeft;
        const my = e.clientY - rect.top - canvasEl.clientTop;
        const newZoom = Math.min(
          Math.max(zoom * Math.pow(2, -e.deltaY / 150), 0.1),
          10,
        );
        panX = mx - ((mx - panX) / zoom) * newZoom;
        panY = my - ((my - panY) / zoom) * newZoom;
        zoom = newZoom;
      } else {
        panX -= e.deltaX;
        panY -= e.deltaY;
      }
    };
    canvasEl.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvasEl.removeEventListener("wheel", handleWheel);
  });

  const exitTextEditing = () => {
    if (editingId && editorState) {
      const base = page.nodes[editingId] as TextNode;
      page.nodes[editingId] = docToNode(editorState.doc, base);
    }
    editorState = null;
    onTextEditEnd();
    editingId = null;
  };
</script>

{#snippet renderNode(node: Node)}
  <!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events -->
  <div
    data-id={node.id}
    style={nodeStyle(node)}
    class="select-none"
    onclick={(e) => {
      e.stopPropagation();
      if (editingId && editingId !== node.id) {
        exitTextEditing();
      }
      selection = node.id;
    }}
    ondblclick={(e) => {
      // Also fires onclick twice before this
      e.stopPropagation();
      if (node.type === "text") {
        selection = node.id;
        editingId = node.id;
      }
    }}
  >
    {#if node.type === "text" && editingId === node.id}
      <TextEditor
        {node}
        onExit={exitTextEditing}
        onReady={(v, s) => {
          editorState = s;
          onTextEditStart(v, s);
        }}
        onStateChange={(s) => {
          editorState = s;
          onTextEditStateChange(s);
        }}
      />
    {:else if node.type === "text"}
      {#each node.content as paragraph, i (i)}
        <p style={paragraphStyle(paragraph)}>
          {#each paragraph.content as run, j (j)}
            <span style={textRunStyle({ ...node, ...run })}>{run.text}</span>
          {/each}
        </p>
      {/each}
    {:else if node.type === "frame"}
      {#each resolveChildren(page.nodes, node.children) as child (child.id)}
        {@render renderNode(child)}
      {/each}
    {/if}
  </div>
{/snippet}

<svelte:window
  onkeydown={(e) => {
    if (e.code === "Space" && !e.repeat && !editingId) {
      e.preventDefault();
      spaceHeld = true;
    }
    if (
      (e.metaKey || e.ctrlKey) &&
      (e.code === "Equal" || e.code === "Minus" || e.code === "Digit0")
    ) {
      e.preventDefault();
      if (e.code === "Digit0") {
        zoom = 1;
      } else {
        const factor = e.code === "Equal" ? 1.25 : 0.8;
        const rect = canvasEl.getBoundingClientRect();
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const newZoom = Math.min(Math.max(zoom * factor, 0.1), 10);
        panX = cx - ((cx - panX) / zoom) * newZoom;
        panY = cy - ((cy - panY) / zoom) * newZoom;
        zoom = newZoom;
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
    if (dragging) return;
    exitTextEditing();
    selection = null;
  }}
  onpointerdown={(e) => {
    if (!spaceHeld) return;
    e.preventDefault();
    e.stopPropagation();
    dragging = true;
    canvasEl.setPointerCapture(e.pointerId);
  }}
  onpointermove={(e) => {
    if (!dragging) return;
    panX += e.movementX;
    panY += e.movementY;
  }}
  onpointerup={(e) => {
    if (!dragging) return;
    dragging = false;
    canvasEl.releasePointerCapture(e.pointerId);
  }}
>
  <div
    style="transform: translate({panX}px, {panY}px) scale({zoom}); transform-origin: 0 0"
  >
    {#each resolveChildren(page.nodes, page.children) as node (node.id)}
      {#if node.type === "screen"}
        {@const screen = node}
        <div
          class="absolute text-xs text-neutral-400 select-none whitespace-nowrap"
          style="left: {screen.x}px; top: {screen.y - 24}px"
        >
          {screen.name}
        </div>
        <!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events -->
        <div
          data-id={screen.id}
          class="absolute overflow-hidden"
          style="left: {screen.x}px; top: {screen.y}px; {screenStyle(screen)}"
          onclick={(e) => {
            e.stopPropagation();
            selection = screen.id;
          }}
        >
          {#each resolveChildren(page.nodes, screen.children) as child (child.id)}
            {@render renderNode(child)}
          {/each}
        </div>
      {/if}
    {/each}
  </div>

  {#if selectionRect}
    <div
      class="absolute pointer-events-none z-10 outline-2 outline-blue-500"
      style="left: {selectionRect.x}px; top: {selectionRect.y}px; width: {selectionRect.w}px; height: {selectionRect.h}px"
    ></div>
  {/if}
</div>
