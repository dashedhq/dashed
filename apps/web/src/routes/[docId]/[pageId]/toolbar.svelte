<script lang="ts">
  import { FrameIcon, TypeIcon } from "@lucide/svelte";

  import { Button } from "$lib/components/ui/button";

  import { getEditorState } from "./editor-state.svelte";

  const editor = getEditorState();
</script>

{#if editor.selectedNodeId}
  <div
    class="flex items-center gap-1 bg-neutral-800 border border-neutral-700 rounded-lg p-1 absolute bottom-4 left-1/2 -translate-x-1/2 z-50"
  >
    <Button
      size="icon-md"
      onclick={() => editor.addFrame(editor.selectedNodeId!)}
    >
      <FrameIcon />
    </Button>
    <Button
      size="icon-md"
      onclick={() => editor.addText(editor.selectedNodeId!)}
    >
      <TypeIcon />
    </Button>
  </div>
{/if}
