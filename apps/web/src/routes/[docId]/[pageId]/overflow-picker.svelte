<script lang="ts">
  import type { Overflow } from "@dashedhq/core";
  import { ChevronDownIcon } from "@lucide/svelte";
  import { Select } from "bits-ui";

  type Props = {
    value: Overflow;
    onValueChange: (v: Overflow) => void;
  };

  let { value, onValueChange }: Props = $props();

  const options: { value: Overflow; label: string }[] = [
    { value: "visible", label: "Visible" },
    { value: "hidden", label: "Hidden" },
    { value: "scroll", label: "Scroll" },
  ];

  const selectedLabel = $derived(
    options.find((o) => o.value === value)?.label ?? "Visible",
  );
</script>

<Select.Root
  type="single"
  {value}
  onValueChange={(v) => onValueChange(v as Overflow)}
>
  <Select.Trigger
    class="flex h-7 w-full items-center gap-2 rounded-md border border-neutral-700 px-2 text-sm text-neutral-50 focus:border-blue-500 cursor-pointer"
  >
    <span class="min-w-0 flex-1 truncate text-left">{selectedLabel}</span>
    <div class="text-neutral-400 [&_svg]:size-4">
      <ChevronDownIcon />
    </div>
  </Select.Trigger>
  <Select.Portal>
    <Select.Content
      class="w-(--bits-select-anchor-width) rounded-lg shadow-md bg-neutral-800 border border-neutral-700 p-1 z-10"
      sideOffset={4}
    >
      <Select.Viewport class="flex flex-col gap-1">
        {#each options as option (option.value)}
          <Select.Item
            value={option.value}
            class="px-2 h-6 rounded-sm flex items-center text-sm cursor-pointer data-highlighted:bg-neutral-700/50 data-selected:bg-blue-500 data-selected:text-neutral-50"
          >
            {option.label}
          </Select.Item>
        {/each}
      </Select.Viewport>
    </Select.Content>
  </Select.Portal>
</Select.Root>
