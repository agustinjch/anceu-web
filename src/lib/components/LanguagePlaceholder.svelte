<script lang="ts">
	import { stripLangPrefix } from '$lib/i18n';
	import { page } from '$app/stores';

	let pathname = $derived(stripLangPrefix($page.url.pathname) || '/');
</script>

<div class="bg-brand-base border border-brand-contrast-3/30 rounded px-4 py-2 text-sm text-brand-contrast-2">
	<span class="font-medium">This page is not yet available in {$page.url.pathname.startsWith('/es') ? 'Spanish' : 'Galician'}.</span>
	{' '}
	<a href={pathname} class="underline hover:text-brand-green">
		View the English version instead.
	</a>
</div>