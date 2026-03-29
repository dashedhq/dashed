<script lang="ts">
  import type { Effect, EffectLayer } from "@dashedhq/core";
  import { RestrictToVerticalAxis } from "@dnd-kit/abstract/modifiers";
  import { RestrictToElement } from "@dnd-kit/dom/modifiers";
  import { move } from "@dnd-kit/helpers";
  import { DragDropProvider } from "@dnd-kit/svelte";
  import { createSortable } from "@dnd-kit/svelte/sortable";
  import {
    EyeClosedIcon,
    EyeIcon,
    GripVerticalIcon,
    MinusIcon,
  } from "@lucide/svelte";

  import { Button } from "$lib/components/ui/button";

  import EffectInput from "./effect-input.svelte";

  type Props = {
    value: EffectLayer[];
    onValueChange: (layers: EffectLayer[]) => void;
    onChangeStart: () => void;
    onChangeEnd: () => void;
  };

  let { value, onValueChange, onChangeStart, onChangeEnd }: Props = $props();

  let listEl = $state<HTMLDivElement>();

  const layerIds = $derived(value.map((l) => l.id));

  function reorderLayers(ids: string[]) {
    onValueChange(ids.map((id) => value.find((l) => l.id === id)!));
  }

  function removeLayer(id: string) {
    onValueChange(value.filter((l) => l.id !== id));
  }

  function toggleLayer(id: string) {
    onValueChange(
      value.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l)),
    );
  }

  function updateLayerEffect(id: string, effect: Effect) {
    onValueChange(value.map((l) => (l.id === id ? { ...l, effect } : l)));
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
        <EffectInput
          value={layer.effect}
          onValueChange={(effect) => updateLayerEffect(layer.id, effect)}
          {onChangeStart}
          {onChangeEnd}
        />
        <Button size="icon-md" onclick={() => toggleLayer(layer.id)}>
          {#if layer.visible}<EyeIcon />{:else}<EyeClosedIcon />{/if}
        </Button>
        <Button size="icon-md" onclick={() => removeLayer(layer.id)}>
          <MinusIcon />
        </Button>
      </div>
    {/each}
  </DragDropProvider>
</div>
