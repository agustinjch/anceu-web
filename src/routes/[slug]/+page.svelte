<script lang="ts">
	import { page } from '$app/stores';

	let { data } = $props();

	let post = $derived(data.content);
	let title = $derived(post?.frontmatter.title ?? 'Post not found');
	let description = $derived(post?.frontmatter.description ?? '');
	let date = $derived(post?.frontmatter.date ?? '');
	let html = $derived(post?.html ?? '<p>Post not found.</p>');
</script>

<svelte:head>
	<title>{title} — Anceu Coliving</title>
	{#if description}
		<meta name="description" content={description} />
	{/if}
</svelte:head>

<div class="mx-auto max-w-6xl px-4 py-16">
	<article>
		<header class="mb-8">
			<h1 class="text-4xl font-heading font-bold text-brand-contrast-2">{title}</h1>
			{#if date}
				<time class="text-sm text-brand-contrast-3 mt-2 block">{new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
			{/if}
		</header>
		<div class="content prose">
			{@html html}
		</div>
	</article>
</div>