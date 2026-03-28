<script lang="ts">
  import { page } from "$app/state";

  import type { PageProps } from "./$types";
  import Editor from "./editor.svelte";

  let { data }: PageProps = $props();
</script>

{#key page.url.pathname}
  <Editor document={data.document} page={data.page} />
{/key}
