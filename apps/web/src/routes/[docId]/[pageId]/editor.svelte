<script lang="ts">
  import type { Document, Page } from "@dashedhq/core";

  import Canvas from "./canvas.svelte";
  import { EditorState, setEditorState } from "./editor-state.svelte";
  import Inspector from "./inspector.svelte";
  import Sidebar from "./sidebar.svelte";
  import Toolbar from "./toolbar.svelte";

  type Props = {
    document: Document;
    page: Page;
  };

  let { document, page }: Props = $props();

  const editor = new EditorState(document, page);
  setEditorState(editor);
</script>

<div class="flex bg-neutral-900 p-4 gap-4 h-svh">
  <Sidebar />
  <div class="flex-1 flex flex-col gap-2 relative">
    <Toolbar />
    <Canvas />
  </div>
  <Inspector />
</div>
