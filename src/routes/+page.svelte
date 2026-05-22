<script lang="ts">
	let { data } = $props();

	let title = $derived(data.content?.frontmatter.title ?? 'Anceu Coliving');
	let description = $derived(data.content?.frontmatter.description ?? '');
	let html = $derived(data.content?.html ?? '<p>Welcome to Anceu Coliving.</p>');
</script>

<svelte:head>
	<title>{title} | Anceu Coliving</title>
	{#if description}
		<meta name="description" content={description} />
	{/if}
</svelte:head>

<div class="mx-auto max-w-6xl px-4 py-16">
	<h1 class="text-4xl md:text-5xl font-heading font-bold text-brand-contrast-2 mb-6">{title}</h1>
	<div class="content prose">
		{@html html}
	</div>
</div>