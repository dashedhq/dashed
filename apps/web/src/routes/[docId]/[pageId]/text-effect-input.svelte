<script lang="ts">
  import type { TextEffect, TextShadow } from "@dashedhq/core";
  import { Popover } from "bits-ui";

  import ColorInput from "./color-input.svelte";
  import NumberInput from "./number-input.svelte";

  type Props = {
    value: TextEffect;
    onValueChange: (v: TextEffect) => void;
    onChangeStart: () => void;
    onChangeEnd: () => void;
  };

  let { value, onValueChange, onChangeStart, onChangeEnd }: Props = $props();

  const effectLabel: Record<TextEffect["type"], string> = {
    blur: "Blur",
    "backdrop-blur": "Backdrop Blur",
    "drop-shadow": "Drop Shadow",
  };

  function updateShadow(patch: Partial<TextShadow>) {
    if (value.type === "drop-shadow") {
      onValueChange({
        type: "drop-shadow",
        shadow: { ...value.shadow, ...patch },
      });
    }
  }
</script>

<Popover.Root>
  <Popover.Trigger
    class="flex flex-1 px-2 gap-2 cursor-pointer items-center border border-neutral-700 h-7
     rounded-md text-sm text-neutral-50 data-[state=open]:border-blue-500"
  >
    {effectLabel[value.type]}
  </Popover.Trigger>

  <Popover.Content
    align="start"
    side="left"
    sideOffset={8}
    alignOffset={-4}
    class="bg-neutral-800 border border-neutral-700 shadow-md rounded-lg p-4 w-64 z-10"
  >
    {#if value.type === "blur"}
      <div class="grid grid-cols-[2fr_3fr] items-center gap-2 w-full">
        <div class="text-neutral-400 text-sm">Blur</div>
        <NumberInput
          value={value.blur}
          onValueChange={(v) => onValueChange({ type: "blur", blur: v })}
        />
      </div>
    {:else if value.type === "backdrop-blur"}
      <div class="grid grid-cols-[2fr_3fr] items-center gap-2 w-full">
        <div class="text-neutral-400 text-sm">Blur</div>
        <NumberInput
          value={value.blur}
          onValueChange={(v) =>
            onValueChange({ type: "backdrop-blur", blur: v })}
        />
      </div>
    {:else if value.type === "drop-shadow"}
      <div class="flex flex-col gap-2">
        <ColorInput
          value={value.shadow.color}
          onValueChange={(color) => updateShadow({ color })}
          {onChangeStart}
          {onChangeEnd}
        />
        <div class="grid grid-cols-2 gap-2">
          <NumberInput
            value={value.shadow.x}
            onValueChange={(v) => updateShadow({ x: v })}
          >
            {#snippet startDecorator()}
              <span class="text-xs">X</span>
            {/snippet}
          </NumberInput>
          <NumberInput
            value={value.shadow.y}
            onValueChange={(v) => updateShadow({ y: v })}
          >
            {#snippet startDecorator()}
              <span class="text-xs">Y</span>
            {/snippet}
          </NumberInput>
          <NumberInput
            value={value.shadow.blur}
            onValueChange={(v) => updateShadow({ blur: v })}
          >
            {#snippet startDecorator()}
              <span class="text-xs">B</span>
            {/snippet}
          </NumberInput>
        </div>
      </div>
    {/if}
  </Popover.Content>
</Popover.Root>
