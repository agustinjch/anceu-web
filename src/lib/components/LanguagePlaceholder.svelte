<script lang="ts">
	let { path }: { path: string } = $props();
</script>

<div class="bg-brand-base border border-brand-contrast-3/30 rounded px-4 py-2 text-sm text-brand-contrast-2">
	<span class="font-medium">This page is not yet available in {path.startsWith('/es') ? 'Spanish' : 'Galician'}.</span>
	{' '}
	<a href={path.replace(/^\/(es|gl)/, '') || '/'} class="underline hover:text-brand-green">
		View the English version instead.
	</a>
</div>