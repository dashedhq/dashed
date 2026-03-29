<script lang="ts">
  import type { ScreenNode } from "@dashedhq/core";
  import { PlusIcon } from "@lucide/svelte";

  import { Button } from "$lib/components/ui/button";

  import { generateFillId, getEditorState } from "./editor-state.svelte";
  import FillLayerList from "./fill-layer-list.svelte";
  import NumberInput from "./number-input.svelte";

  type Props = {
    screen: ScreenNode;
  };

  let { screen }: Props = $props();
  const editor = getEditorState();
</script>

<div class="flex flex-col gap-2">
  <div class="flex items-center justify-between">
    <div class="text-neutral-50 text-sm">Background</div>
    <Button
      size="icon-md"
      onclick={() =>
        editor.updateScreen(screen.id, (n) => {
          n.fills = [
            ...n.fills,
            {
              id: generateFillId(),
              fill: { type: "solid", color: { r: 0, g: 0, b: 0, a: 1 } },
              visible: true,
            },
          ];
        })}><PlusIcon /></Button
    >
  </div>
  <FillLayerList
    value={screen.fills}
    onValueChange={(layers) =>
      editor.updateScreen(screen.id, (n) => (n.fills = layers))}
    onChangeStart={() => editor.beginPatch()}
    onChangeEnd={() => editor.commitPatch()}
  />
</div>
<div class="flex flex-col gap-2">
  <div class="text-neutral-50 text-sm">Size</div>
  <div class="grid grid-cols-2 gap-2">
    <NumberInput
      value={screen.width}
      onValueChange={(v) =>
        editor.updateScreen(screen.id, (n) => (n.width = v))}
    >
      {#snippet startDecorator()}
        W
      {/snippet}
    </NumberInput>
    <NumberInput
      value={screen.height}
      onValueChange={(v) =>
        editor.updateScreen(screen.id, (n) => (n.height = v))}
    >
      {#snippet startDecorator()}
        H
      {/snippet}
    </NumberInput>
  </div>
</div>
