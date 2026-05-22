<script lang="ts">
	let { data } = $props();
	let c = $derived(data.content);
	let title = $derived(c?.frontmatter.title ?? 'The experience');
	let description = $derived(c?.frontmatter.description ?? '');
	let html = $derived(c?.html ?? '');
</script>

<svelte:head>
	<title>{title} — Anceu Coliving</title>
	{#if description}<meta name="description" content={description} />{/if}
</svelte:head>

<div class="mx-auto max-w-6xl px-4 py-16">
	<h1 class="text-4xl font-heading font-bold text-brand-contrast-2 mb-6">{title}</h1>
	{#if html}<div class="content">{@html html}</div>{/if}
</div>