<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Page {data.n} — The Experience — Anceu Coliving</title>
	<meta name="description" content="Blog listing page {data.n}." />
</svelte:head>

<div class="mx-auto max-w-6xl px-4 py-16">
	<h1 class="text-4xl font-heading font-bold text-brand-contrast-2 mb-6">The experience — Page {data.n}</h1>
	<p class="text-lg text-brand-contrast-3">More stories from Anceu.</p>
</div>