<script lang="ts">
	import { page } from '$app/stores';

	let mobileMenuOpen = $state(false);

	const navItems = [
		{ label: 'Home', href: '/' },
		{ label: 'The Space', href: '/the-space/' },
		{ label: 'The experience', href: '/the-experience/' },
		{ label: 'FAQ', href: '/faq/' },
		{ label: 'Contact', href: '/contact/' }
	];

	function isActive(href: string): boolean {
		const path = $page.url.pathname;
		if (href === '/') return path === '/';
		return path.startsWith(href);
	}
</script>

<header class="sticky top-0 z-50 bg-white border-b border-brand-contrast-3/20">
	<div class="mx-auto max-w-6xl px-4">
		<div class="flex items-center justify-between h-16">
			<a href="/" class="flex items-center gap-2">
				<img
					src="/logo.svg"
					alt="Anceu Coliving"
					class="h-8 w-auto"
				/>
				<span class="font-heading text-xl font-bold text-brand-contrast-2">Anceu</span>
			</a>

			<nav class="hidden lg:flex items-center gap-6" aria-label="Primary">
				{#each navItems as item}
					<a
						href={item.href}
						class="text-sm font-medium transition-colors hover:text-brand-green {isActive(item.href)
							? 'text-brand-green'
							: 'text-brand-contrast-2'}"
					>
						{item.label}
					</a>
				{/each}
				<a
					href="/book/"
					class="inline-flex items-center rounded-full bg-brand-green px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-green-dark"
				>
					Join us
				</a>
			</nav>

			<button
				class="lg:hidden p-2 text-brand-contrast-2"
				aria-label="Toggle menu"
				onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
			>
				<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					{#if mobileMenuOpen}
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					{:else}
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
					{/if}
				</svg>
			</button>
		</div>
	</div>

	{#if mobileMenuOpen}
		<div class="lg:hidden border-t border-brand-contrast-3/20 bg-white">
			<div class="px-4 py-4 space-y-3">
				{#each navItems as item}
					<a
						href={item.href}
						class="block text-sm font-medium transition-colors hover:text-brand-green {isActive(item.href)
							? 'text-brand-green'
							: 'text-brand-contrast-2'}"
						onclick={() => (mobileMenuOpen = false)}
					>
						{item.label}
					</a>
				{/each}
				<a
					href="/book/"
					class="inline-flex items-center rounded-full bg-brand-green px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-green-dark"
					onclick={() => (mobileMenuOpen = false)}
				>
					Join us
				</a>
			</div>
		</div>
	{/if}
</header>