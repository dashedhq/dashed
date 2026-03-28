<script lang="ts">
  import type {
    Layout,
    StackAlignment,
    StackDistribution,
  } from "@dashedhq/core";
  import {
    AlignCenterHorizontalIcon,
    AlignCenterVerticalIcon,
    AlignEndHorizontalIcon,
    AlignEndVerticalIcon,
    AlignStartHorizontalIcon,
    AlignStartVerticalIcon,
    DotIcon,
  } from "@lucide/svelte";
  import { ToggleGroup } from "bits-ui";

  import { cn } from "$lib/utils";

  type Props = Omit<
    ToggleGroup.RootProps,
    "value" | "type" | "onValueChange"
  > & {
    value: Layout;
    onValueChange: (v: Layout) => void;
  };

  const { value, onValueChange, class: className, ...others }: Props = $props();

  const toggleValue = $derived.by(() => {
    if (value.type === "stack" && value.direction === "horizontal") {
      return `${value.distribute}-${value.align}`;
    }
    if (value.type === "stack" && value.direction === "vertical") {
      return `${value.align}-${value.distribute}`;
    }
    return "start-start";
  });
</script>

<ToggleGroup.Root
  type="single"
  class={cn(
    "grid grid-cols-3 grid-rows-3 bg-neutral-800 rounded-md text-sm",
    className,
  )}
  value={toggleValue}
  onValueChange={(v) => {
    const [first, second] = v.split("-");
    if (value.type === "stack" && value.direction === "horizontal") {
      onValueChange({
        ...value,
        distribute: first as StackDistribution,
        align: second as StackAlignment,
      });
    } else if (value.type === "stack" && value.direction === "vertical") {
      onValueChange({
        ...value,
        align: first as StackAlignment,
        distribute: second as StackDistribution,
      });
    }
  }}
  {...others}
>
  <ToggleGroup.Item
    value="start-start"
    class="rounded-md cursor-pointer border border-transparent h-8 flex justify-center items-center text-neutral-400 [&_svg]:size-4 data-[state=on]:text-blue-500"
  >
    {#if value.direction === "horizontal"}
      <AlignStartHorizontalIcon />
    {:else}
      <AlignStartVerticalIcon />
    {/if}
  </ToggleGroup.Item>
  <ToggleGroup.Item
    value="center-start"
    class="rounded-md cursor-pointer border border-transparent h-8 flex justify-center items-center text-neutral-400 [&_svg]:size-4 data-[state=on]:text-blue-500"
  >
    {#if value.direction === "horizontal"}
      <DotIcon />
    {:else}
      <AlignCenterVerticalIcon />
    {/if}
  </ToggleGroup.Item>
  <ToggleGroup.Item
    value="end-start"
    class="rounded-md cursor-pointer border border-transparent h-8 flex justify-center items-center text-neutral-400 [&_svg]:size-4 data-[state=on]:text-blue-500"
  >
    {#if value.direction === "horizontal"}
      <DotIcon />
    {:else}
      <AlignEndVerticalIcon />
    {/if}
  </ToggleGroup.Item>
  <ToggleGroup.Item
    value="start-center"
    class="rounded-md cursor-pointer border border-transparent h-8 flex justify-center items-center text-neutral-400 [&_svg]:size-4 data-[state=on]:text-blue-500"
  >
    {#if value.direction === "horizontal"}
      <AlignCenterHorizontalIcon />
    {:else}
      <DotIcon />
    {/if}
  </ToggleGroup.Item>
  <ToggleGroup.Item
    value="center-center"
    class="rounded-md cursor-pointer border border-transparent h-8 flex justify-center items-center text-neutral-400 [&_svg]:size-4 data-[state=on]:text-blue-500"
    ><DotIcon /></ToggleGroup.Item
  >
  <ToggleGroup.Item
    value="end-center"
    class="rounded-md cursor-pointer border border-transparent h-8 flex justify-center items-center text-neutral-400 [&_svg]:size-4 data-[state=on]:text-blue-500"
    ><DotIcon /></ToggleGroup.Item
  >
  <ToggleGroup.Item
    value="start-end"
    class="rounded-md cursor-pointer border border-transparent h-8 flex justify-center items-center text-neutral-400 [&_svg]:size-4 data-[state=on]:text-blue-500"
  >
    {#if value.direction === "horizontal"}
      <AlignEndHorizontalIcon />
    {:else}
      <DotIcon />
    {/if}
  </ToggleGroup.Item>
  <ToggleGroup.Item
    value="center-end"
    class="rounded-md cursor-pointer border border-transparent h-8 flex justify-center items-center text-neutral-400 [&_svg]:size-4 data-[state=on]:text-blue-500"
    ><DotIcon /></ToggleGroup.Item
  >
  <ToggleGroup.Item
    value="end-end"
    class="rounded-md cursor-pointer border border-transparent h-8 flex justify-center items-center text-neutral-400 [&_svg]:size-4 data-[state=on]:text-blue-500"
    ><DotIcon /></ToggleGroup.Item
  >
</ToggleGroup.Root>
