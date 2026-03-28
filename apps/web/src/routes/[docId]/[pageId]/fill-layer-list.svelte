<script lang="ts">
  import type { FillLayer } from "@dashedhq/core";
  import { RestrictToVerticalAxis } from "@dnd-kit/abstract/modifiers";
  import { RestrictToElement } from "@dnd-kit/dom/modifiers";
  import { move } from "@dnd-kit/helpers";
  import { DragDropProvider } from "@dnd-kit/svelte";
  import { createSortable } from "@dnd-kit/svelte/sortable";
  import { GripVerticalIcon, MinusIcon } from "@lucide/svelte";

  import { Button } from "$lib/components/ui/button";

  import FillPicker from "./fill-picker.svelte";

  type Props = {
    value: FillLayer[];
    onValueChange: (layers: FillLayer[]) => void;
    onChangeStart: () => void;
    onChangeEnd: () => void;
  };

  let {
    value,
    onValueChange,
    onChangeStart,
    onChangeEnd,
  }: Props = $props();

  let listEl = $state<HTMLDivElement>();

  const layerIds = $derived(value.map((l) => l.id));

  function reorderLayers(ids: string[]) {
    onValueChange(ids.map((id) => value.find((l) => l.id === id)!));
  }

  function removeLayer(id: string) {
    onValueChange(value.filter((l) => l.id !== id));
  }

  function updateLayerFill(id: string, fill: FillLayer["fill"]) {
    onValueChange(value.map((l) => (l.id === id ? { ...l, fill } : l)));
  }
</script>

<div bind:this={listEl} class="flex flex-col gap-2">
  <DragDropProvider
    modifiers={[
      RestrictToVerticalAxis,
      RestrictToElement.configure({ element: listEl }),
    ]}
    onDragEnd={(e) => reorderLayers(move(layerIds, e))}
  >
    {#each value as layer, i (layer.id)}
      {@const sortable = createSortable({
        id: layer.id,
        get index() {
          return i;
        },
      })}

      <div
        class="flex items-center gap-2 bg-neutral-900"
        {@attach sortable.attach}
      >
        <button {@attach sortable.attachHandle}>
          <GripVerticalIcon class="size-4" />
        </button>
        <FillPicker
          value={layer.fill}
          class="flex-1"
          onValueChange={(fill) => updateLayerFill(layer.id, fill)}
          {onChangeStart}
          {onChangeEnd}
        />
        <Button
          size="icon-md"
          onclick={() => removeLayer(layer.id)}
          ><MinusIcon /></Button
        >
      </div>
    {/each}
  </DragDropProvider>
</div>
