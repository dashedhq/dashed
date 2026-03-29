<script lang="ts">
  import type { Size } from "@dashedhq/core";
  import { Select } from "bits-ui";

  type Props = {
    notation: string;
    value: Size;
    resolvedValue?: number;
    onValueChange: (v: Size) => void;
  };

  const { value, resolvedValue, onValueChange, notation }: Props = $props();

  const round1dp = (v: number) => Math.round(v * 10) / 10;

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

  const displayValue = $derived(
    value.type === "fixed"
      ? round1dp(value.value)
      : resolvedValue != null
        ? round1dp(resolvedValue)
        : null,
  );

  let draftValue = $derived(displayValue?.toString() ?? "");
</script>

<div
  class="text-neutral-50 text-sm border border-neutral-700 rounded-md px-2 h-7 flex items-center gap-2 focus-within:border-blue-500"
>
  <div class="text-neutral-400">{notation}</div>
  <input
    class="min-w-0 flex-1 outline-none disabled:text-neutral-500"
    disabled={value.type !== "fixed"}
    bind:value={draftValue}
    onblur={() => {
      const parsed = draftValue.trim() === "" ? null : parseFloat(draftValue);
      if (parsed !== null && !Number.isNaN(parsed) && parsed >= 0) {
        onValueChange({ type: "fixed", value: round1dp(parsed) });
      }
      // Sync display back to model — needed when the parent normalizes
      // the value back to the same number (e.g. rounding), since the
      // derived won't re-run if value didn't change.
      draftValue = displayValue?.toString() ?? "";
    }}
  />
  <Select.Root
    type="single"
    value={value.type}
    onValueChange={(type) =>
      onValueChange(
        type === "fixed"
          ? { type: "fixed", value: displayValue ?? 0 }
          : ({ type } as Size),
      )}
  >
    <Select.Trigger
      class="cursor-pointer text-neutral-400 text-xs bg-neutral-800 w-10 rounded-sm h-5 flex items-center justify-center"
    >
      {sizeTypeDisplay(value.type)}
    </Select.Trigger>
    <Select.Portal>
      <Select.Content
        class="rounded-lg shadow-md bg-neutral-800 border border-neutral-700 p-1 z-10"
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
