<script lang="ts">
  import type { BlendMode } from "@dashedhq/core";
  import { ChevronDownIcon } from "@lucide/svelte";
  import { Select } from "bits-ui";

  type Props = {
    value: BlendMode;
    onValueChange: (v: BlendMode) => void;
  };

  let { value, onValueChange }: Props = $props();

  const options: { value: BlendMode; label: string }[] = [
    { value: "normal", label: "Normal" },
    { value: "multiply", label: "Multiply" },
    { value: "screen", label: "Screen" },
    { value: "overlay", label: "Overlay" },
    { value: "darken", label: "Darken" },
    { value: "lighten", label: "Lighten" },
    { value: "color-dodge", label: "Color Dodge" },
    { value: "color-burn", label: "Color Burn" },
    { value: "hard-light", label: "Hard Light" },
    { value: "soft-light", label: "Soft Light" },
    { value: "difference", label: "Difference" },
    { value: "exclusion", label: "Exclusion" },
    { value: "hue", label: "Hue" },
    { value: "saturation", label: "Saturation" },
    { value: "color", label: "Color" },
    { value: "luminosity", label: "Luminosity" },
  ];

  const selectedLabel = $derived(
    options.find((o) => o.value === value)?.label ?? "Normal",
  );
</script>

<Select.Root
  type="single"
  {value}
  onValueChange={(v) => onValueChange(v as BlendMode)}
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
      class="w-(--bits-select-anchor-width) rounded-lg shadow-md bg-neutral-800 border border-neutral-700 p-1 max-h-60 overflow-y-auto z-10"
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
