<script lang="ts">
  import type { AlignResult } from "./alignment-guides";
  import { getEditorState } from "./editor-state.svelte";

  type Props = {
    result: AlignResult;
  };

  let { result }: Props = $props();
  const editor = getEditorState();

  function sx(docX: number): number {
    return docX * editor.zoom + editor.panX;
  }

  function sy(docY: number): number {
    return docY * editor.zoom + editor.panY;
  }

  function labelWidth(value: number): number {
    const digits = Math.round(value).toString().length;
    return Math.max(28, digits * 8 + 12);
  }
</script>

<svg class="absolute inset-0 pointer-events-none z-40 overflow-visible">
  <!-- Guide lines -->
  {#each result.guides as guide, i (i)}
    {#if guide.axis === "x"}
      <line
        x1={sx(guide.position)}
        y1={sy(guide.start)}
        x2={sx(guide.position)}
        y2={sy(guide.end)}
        stroke="#f43f5e"
        stroke-width="1"
        stroke-dasharray="4 4"
      />
    {:else}
      <line
        x1={sx(guide.start)}
        y1={sy(guide.position)}
        x2={sx(guide.end)}
        y2={sy(guide.position)}
        stroke="#f43f5e"
        stroke-width="1"
        stroke-dasharray="4 4"
      />
    {/if}
  {/each}

  <!-- Distance indicators -->
  {#each result.distances as dist, i (i)}
    {@const gap = Math.round(dist.to - dist.from)}
    {#if dist.axis === "x"}
      {@const x1 = sx(dist.from)}
      {@const x2 = sx(dist.to)}
      {@const y = sy(dist.position)}
      {@const midX = (x1 + x2) / 2}
      {@const w = labelWidth(gap)}

      <line {x1} y1={y} {x2} y2={y} stroke="#f43f5e" stroke-width="1" />
      <line {x1} y1={y - 4} x2={x1} y2={y + 4} stroke="#f43f5e" stroke-width="1" />
      <line x1={x2} y1={y - 4} x2={x2} y2={y + 4} stroke="#f43f5e" stroke-width="1" />
      <rect
        x={midX - w / 2}
        y={y - 10}
        width={w}
        height="16"
        rx="3"
        fill="#f43f5e"
      />
      <text
        x={midX}
        y={y + 1}
        text-anchor="middle"
        fill="white"
        font-size="10"
        font-family="system-ui">{gap}</text
      >
    {:else}
      {@const y1 = sy(dist.from)}
      {@const y2 = sy(dist.to)}
      {@const x = sx(dist.position)}
      {@const midY = (y1 + y2) / 2}
      {@const w = labelWidth(gap)}

      <line x1={x} {y1} x2={x} {y2} stroke="#f43f5e" stroke-width="1" />
      <line x1={x - 4} y1={y1} x2={x + 4} y2={y1} stroke="#f43f5e" stroke-width="1" />
      <line x1={x - 4} y1={y2} x2={x + 4} y2={y2} stroke="#f43f5e" stroke-width="1" />
      <rect
        x={x - w / 2}
        y={midY - 8}
        width={w}
        height="16"
        rx="3"
        fill="#f43f5e"
      />
      <text
        x={x}
        y={midY + 3}
        text-anchor="middle"
        fill="white"
        font-size="10"
        font-family="system-ui">{gap}</text
      >
    {/if}
  {/each}
</svg>
