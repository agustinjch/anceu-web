<script lang="ts">
	import { page } from '$app/stores';
	import { LANGUAGES, localizedPath, type Lang } from '$lib/i18n';

	let { currentLang }: { currentLang: Lang } = $props();

	let open = $state(false);

	function close() {
		open = false;
	}

	function toggle() {
		open = !open;
	}
</script>

<div class="relative">
	<button
		class="flex items-center gap-1 text-sm font-medium text-brand-contrast-2 hover:text-brand-green transition-colors cursor-pointer"
		onclick={toggle}
		aria-haspopup="true"
		aria-expanded={open}
	>
		{currentLang.toUpperCase()}
		<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
		</svg>
	</button>

	{#if open}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="fixed inset-0 z-10" onclick={close} onkeydown={close}></div>
		<div class="absolute right-0 top-full mt-1 bg-white border border-brand-contrast-3/20 rounded shadow-lg z-20 min-w-32">
			{#each LANGUAGES as lang}
				<a
					href={localizedPath($page.url.pathname, lang.code)}
					class="block px-4 py-2 text-sm text-brand-contrast-2 hover:bg-brand-base transition-colors {lang.code === currentLang ? 'font-semibold text-brand-green' : ''}"
					onclick={close}
				>
					{lang.displayName}
				</a>
			{/each}
		</div>
	{/if}
</div>