<script lang="ts">
  import type { BorderStyle } from "@dashedhq/core";
  import { SplineIcon, SquareDashedIcon, SquareIcon } from "@lucide/svelte";
  import { ToggleGroup } from "bits-ui";

  type Props = {
    value: BorderStyle;
  };

  let { value = $bindable() }: Props = $props();
</script>

<ToggleGroup.Root
  type="single"
  bind:value
  class="grid grid-cols-3 bg-neutral-800 h-8 rounded-md"
>
  <ToggleGroup.Item
    value="solid"
    class="rounded-md cursor-pointer border border-transparent data-[state=on]:border-neutral-700 flex justify-center items-center [&_svg]:text-neutral-400 [&_svg]:size-4 data-[state=on]:[&_svg]:text-neutral-50 data-[state=on]:bg-neutral-900"
    ><SquareIcon /></ToggleGroup.Item
  >
  <ToggleGroup.Item
    value="dashed"
    class="rounded-md cursor-pointer border border-transparent data-[state=on]:border-neutral-700 flex justify-center items-center [&_svg]:text-neutral-400 [&_svg]:size-4 data-[state=on]:[&_svg]:text-neutral-50 data-[state=on]:bg-neutral-900"
    ><SquareDashedIcon /></ToggleGroup.Item
  >
  <ToggleGroup.Item
    value="dotted"
    class="rounded-md cursor-pointer border border-transparent data-[state=on]:border-neutral-700 flex justify-center items-center [&_svg]:text-neutral-400 [&_svg]:size-4 data-[state=on]:[&_svg]:text-neutral-50 data-[state=on]:bg-neutral-900"
    ><SplineIcon /></ToggleGroup.Item
  >
</ToggleGroup.Root>
