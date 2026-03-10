<script lang="ts">
  import { page } from "$app/state";

  import type { PageProps } from "./$types";
  import Editor from "./editor.svelte";

  let { data }: PageProps = $props();

  let pageData = $state(data.page);

  $effect(() => {
    pageData = data.page;
  });
</script>

{#key page.url.pathname}
  <Editor document={data.document} bind:page={pageData} />
{/key}
