<script lang="ts">
	import LanguagePlaceholder from '$lib/components/LanguagePlaceholder.svelte';
	import { page } from '$app/stores';
</script>

<svelte:head>
	<title>Anceu Coliving — Galego</title>
</svelte:head>

<div class="mx-auto max-w-6xl px-4 py-16">
	<LanguagePlaceholder path={$page.url.pathname} />
</div>