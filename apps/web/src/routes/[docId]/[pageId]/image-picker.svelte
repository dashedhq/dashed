<script lang="ts">
  import { fillStyle, type Image } from "@dashedhq/core";
  import { ChevronDownIcon, ImagePlusIcon } from "@lucide/svelte";
  import { Select } from "bits-ui";

  type Props = {
    value: Image;
    onValueChange: (v: Image) => void;
  };

  let { value, onValueChange }: Props = $props();

  function handleFileChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onValueChange({ ...value, src: reader.result as string });
    };
    reader.readAsDataURL(file);
  }
</script>

<div class="flex flex-col gap-4">
  <div class="group relative aspect-square rounded overflow-hidden">
    <div
      class="absolute inset-0 bg-[repeating-conic-gradient(var(--color-neutral-600)_0%_25%,transparent_0%_50%)] bg-size-[32px_32px]"
    ></div>
    {#if value.src}
      <div
        class="absolute inset-0"
        style={fillStyle({ type: "image", image: value })}
      ></div>
    {/if}
    <label
      class="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 bg-neutral-950/60 text-neutral-50 hover:text-neutral-50 cursor-pointer transition-opacity text-sm"
    >
      <input
        type="file"
        accept="image/*"
        class="hidden"
        onchange={handleFileChange}
      />
      <ImagePlusIcon class="size-6" />
      Upload from device
    </label>
  </div>

  <div class="grid grid-cols-[2fr_3fr] items-center gap-2">
    <div class="text-neutral-400 text-sm">Fit</div>
    <Select.Root
      type="single"
      value={value.fit}
      onValueChange={(v) => {
        if (v) {
          onValueChange({ ...value, fit: v as Image["fit"] });
        }
      }}
    >
      <Select.Trigger
        class="flex h-7 w-full items-center gap-2 rounded-md border border-neutral-700 px-2 text-sm text-neutral-50 focus:border-blue-500 cursor-pointer"
      >
        <span class="min-w-0 flex-1 truncate text-left capitalize"
          >{value.fit}</span
        >
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
            <Select.Item
              value="cover"
              class="px-2 h-6 rounded-sm flex items-center text-sm cursor-pointer data-highlighted:bg-neutral-700/50 data-selected:bg-blue-500 data-selected:text-neutral-50"
            >
              Cover
            </Select.Item>
            <Select.Item
              value="contain"
              class="px-2 h-6 rounded-sm flex items-center text-sm cursor-pointer data-highlighted:bg-neutral-700/50 data-selected:bg-blue-500 data-selected:text-neutral-50"
            >
              Contain
            </Select.Item>
            <Select.Item
              value="fill"
              class="px-2 h-6 rounded-sm flex items-center text-sm cursor-pointer data-highlighted:bg-neutral-700/50 data-selected:bg-blue-500 data-selected:text-neutral-50"
            >
              Fill
            </Select.Item>
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  </div>
</div>
