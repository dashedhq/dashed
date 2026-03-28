<script lang="ts">
  import type { Layout } from "@dashedhq/core";
  import { Grid2x2Icon, MoveDownIcon, MoveRightIcon } from "@lucide/svelte";
  import { ToggleGroup } from "bits-ui";

  type Props = {
    value: Layout;
    onValueChange: (v: Layout) => void;
  };

  const { value, onValueChange }: Props = $props();

  const toggleValue = $derived.by(() => {
    if (value.type === "stack" && value.direction === "horizontal") {
      return "hstack";
    }

    if (value.type === "stack" && value.direction === "vertical") {
      return "vstack";
    }

    return "grid";
  });
</script>

<ToggleGroup.Root
  type="single"
  value={toggleValue}
  onValueChange={(v) => {
    if (v === "hstack") {
      onValueChange({
        type: "stack",
        direction: "horizontal",
        gap: value.type === "stack" ? value.gap : 0,
        align: value.type === "stack" ? value.align : "start",
        distribute: value.type === "stack" ? value.distribute : "start",
      });
    }

    if (v === "vstack") {
      onValueChange({
        type: "stack",
        direction: "vertical",
        gap: value.type === "stack" ? value.gap : 0,
        align: value.type === "stack" ? value.align : "start",
        distribute: value.type === "stack" ? value.distribute : "start",
      });
    }
  }}
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
