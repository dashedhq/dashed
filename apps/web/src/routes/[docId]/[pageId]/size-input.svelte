<script lang="ts">
  import type { Size } from "@dashedhq/core";
  import { Select } from "bits-ui";

  type Props = {
    notation: string;
    value: Size;
  };

  const { value = $bindable(), notation }: Props = $props();

  const sizeTypeDisplay = (type: Size["type"]) => {
    if (type === "fixed") {
      return "Fixed";
    }

    if (type === "fill") {
      return "Fill";
    }

    if (type === "hug") {
      return "Hug";
    }
  };

  let lastFixedValue = $state(value.type === "fixed" ? value.value : 0);

  $effect(() => {
    if (value.type === "fixed") {
      lastFixedValue = value.value;
    }
  });
</script>

<div
  class="text-neutral-50 text-sm border border-neutral-700 rounded-md px-2 h-8 flex items-center gap-2 focus-within:border-blue-500"
>
  <div class="text-neutral-400">{notation}</div>
  {#if value.type === "fixed"}
    <input class="min-w-0 flex-1 outline-none" bind:value={value.value} />
  {:else}
    <div class="flex-1 text-neutral-600">{lastFixedValue}</div>
  {/if}
  <Select.Root type="single" bind:value={value.type}>
    <Select.Trigger
      class="cursor-pointer text-neutral-400 text-xs bg-neutral-800 w-10 rounded-sm h-5 flex items-center justify-center"
    >
      {sizeTypeDisplay(value.type)}
    </Select.Trigger>
    <Select.Portal>
      <Select.Content
        class="rounded-lg shadow-md bg-neutral-800 border border-neutral-700 p-1"
      >
        <Select.Viewport class="flex flex-col gap-1">
          <Select.Item
            value="fixed"
            class="px-2 h-6 rounded-sm flex items-center text-sm cursor-pointer data-highlighted:bg-neutral-700/50 data-selected:bg-blue-500 data-selected:text-neutral-50"
            >Fixed</Select.Item
          >
          <Select.Item
            value="fill"
            class="px-2 h-6 rounded-sm flex items-center text-sm cursor-pointer data-highlighted:bg-neutral-700/50 data-selected:bg-blue-500 data-selected:text-neutral-50"
            >Fill parent</Select.Item
          >
          <Select.Item
            value="hug"
            class="px-2 h-6 rounded-sm flex items-center text-sm cursor-pointer data-highlighted:bg-neutral-700/50 data-selected:bg-blue-500 data-selected:text-neutral-50"
            >Hug content</Select.Item
          >
        </Select.Viewport>
      </Select.Content>
    </Select.Portal>
  </Select.Root>
</div>
