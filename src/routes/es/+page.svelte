<script lang="ts">
	import LanguagePlaceholder from '$lib/components/LanguagePlaceholder.svelte';

	let { data } = $props();

	let content = $derived(data.content);
	let hasContent = $derived(content?.frontmatter?.title != null);
	let title = $derived(content?.frontmatter?.title ?? 'Anceu Coliving');
	let description = $derived(content?.frontmatter?.description ?? '');
	let html = $derived(content?.html ?? '');
</script>

<svelte:head>
	<title>{title} — Anceu Coliving</title>
	{#if description}
		<meta name="description" content={description} />
	{/if}
</svelte:head>

<div class="mx-auto max-w-6xl px-4 py-16">
	{#if !hasContent}
		<div class="mb-4">
			<LanguagePlaceholder />
		</div>
	{/if}
	<h1 class="text-4xl md:text-5xl font-heading font-bold text-brand-contrast-2 mb-6">{title}</h1>
	{#if html}
		<div class="content">
			{@html html}
		</div>
	{/if}
</div>