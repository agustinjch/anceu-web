<script lang="ts">
	let { data } = $props();
	let posts = $derived(data.posts ?? []);
	let page = $derived(data.page ?? 1);
	let totalPages = $derived(data.totalPages ?? 1);
</script>

<svelte:head>
	<title>Page {page} — The Experience — Anceu Coliving</title>
	<meta name="description" content="Blog listing page {page}." />
</svelte:head>

<div class="mx-auto max-w-6xl px-4 py-16">
	<h1 class="text-4xl font-heading font-bold text-brand-contrast-2 mb-8">
		<a href="/the-experience/" class="hover:text-brand-green transition-colors">The experience</a>
	</h1>

	<div class="space-y-8">
		{#each posts as post}
			<article class="border-b border-brand-contrast-3/20 pb-6">
				<h2 class="text-2xl font-heading font-semibold mb-2">
					<a href="/{post.slug}/" class="text-brand-contrast-2 hover:text-brand-green transition-colors">
						{post.frontmatter.title}
					</a>
				</h2>
				{#if post.frontmatter.date}
					<time class="text-sm text-brand-contrast-3 block mb-2">
						{new Date(post.frontmatter.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
					</time>
				{/if}
				{#if post.frontmatter.description}
					<p class="text-brand-contrast-2">{post.frontmatter.description}</p>
				{/if}
			</article>
		{/each}
	</div>

	<nav class="mt-8 flex items-center gap-2" aria-label="Pagination">
		{#if page > 1}
			<a href={page === 2 ? '/the-experience/' : `/the-experience/page/${page - 1}/`} class="text-sm text-brand-green hover:text-brand-green-dark transition-colors">
				← Previous
			</a>
		{/if}

		<span class="text-sm text-brand-contrast-3">
			Page {page} of {totalPages}
		</span>

		{#if page < totalPages}
			<a href="/the-experience/page/{page + 1}/" class="text-sm text-brand-green hover:text-brand-green-dark transition-colors">
				Next →
			</a>
		{/if}
	</nav>
</div>