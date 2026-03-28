<script lang="ts">
  import { FrameIcon, SmartphoneIcon, TypeIcon } from "@lucide/svelte";

  import { getEditorState } from "./editor-state.svelte";
  import FrameInspector from "./frame-inspector.svelte";
  import ScreenInspector from "./screen-inspector.svelte";
  import TextInspector from "./text-inspector.svelte";

  const editor = getEditorState();

  const node = $derived(editor.selectedNode);
</script>

{#if node}
  <div class="w-64 flex flex-col gap-6 overflow-y-auto">
    <div class="flex gap-2 items-center text-neutral-50">
      {#if node.type === "screen"}
        <SmartphoneIcon class="size-4 text-neutral-400" />
      {:else if node.type === "frame"}
        <FrameIcon class="size-4 text-neutral-400" />
      {:else}
        <TypeIcon class="size-4 text-neutral-400" />
      {/if}
      {node.name}
    </div>
    {#if node.type === "frame"}
      <FrameInspector frame={node} />
    {:else if node.type === "screen"}
      <ScreenInspector screen={node} />
    {:else if node.type === "text"}
      <TextInspector text={node} />
    {/if}
  </div>
{/if}
