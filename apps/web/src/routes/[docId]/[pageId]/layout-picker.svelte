<script lang="ts">
  import { Grid2x2Icon, MoveDownIcon, MoveRightIcon } from "@lucide/svelte";
  import type { Layout } from "@dashedhq/core";
  import { ToggleGroup } from "bits-ui";

  type Props = {
    value: Layout;
  };

  const { value = $bindable() }: Props = $props();
</script>

<ToggleGroup.Root
  type="single"
  bind:value={
    () => {
      if (value.type === "stack" && value.direction === "horizontal") {
        return "hstack";
      }

      if (value.type === "stack" && value.direction === "vertical") {
        return "vstack";
      }

      return "grid";
    },
    (v) => {
      if (v === "hstack") {
        value.type = "stack";
        value.direction = "horizontal";
      }

      if (v === "vstack") {
        value.type = "stack";
        value.direction = "vertical";
      }
    }
  }
  class="grid grid-cols-3 bg-neutral-800 h-8 rounded-md text-sm"
>
  <ToggleGroup.Item
    value="hstack"
    class="rounded-md cursor-pointer border border-transparent data-[state=on]:border-neutral-700 px-2 flex justify-center items-center gap-2 [&_svg]:text-neutral-400 [&_svg]:size-4 data-[state=on]:text-neutral-50 data-[state=on]:bg-neutral-900"
    ><MoveRightIcon />Stack</ToggleGroup.Item
  >
  <ToggleGroup.Item
    value="vstack"
    class="rounded-md cursor-pointer border border-transparent data-[state=on]:border-neutral-700 px-2 flex justify-center items-center gap-2 [&_svg]:text-neutral-400 [&_svg]:size-4 data-[state=on]:text-neutral-50 data-[state=on]:bg-neutral-900"
    ><MoveDownIcon />Stack</ToggleGroup.Item
  >
  <ToggleGroup.Item
    value="grid"
    class="rounded-md cursor-pointer border border-transparent data-[state=on]:border-neutral-700 px-2 flex justify-center items-center gap-2 [&_svg]:text-neutral-400 [&_svg]:size-4 data-[state=on]:text-neutral-50 data-[state=on]:bg-neutral-900"
    ><Grid2x2Icon />Grid</ToggleGroup.Item
  >
</ToggleGroup.Root>
