<script lang="ts">
	let {
		src,
		alt = '',
		widths = [400, 800, 1200],
		sizes = '(max-width: 768px) 100vw, 800px',
		class: className = '',
		loading = 'lazy'
	}: {
		src: string;
		alt?: string;
		widths?: number[];
		sizes?: string;
		class?: string;
		loading?: 'lazy' | 'eager';
	} = $props();

	function cfUrl(path: string, width: number): string {
		return `/cdn-cgi/image/width=${width},format=auto,fit=scale-down${path.startsWith('/') ? '' : '/'}${path}`;
	}

	let srcset = $derived(widths.map((w) => `${cfUrl(src, w)} ${w}w`).join(', '));
	let defaultSrc = $derived(cfUrl(src, widths[1] ?? 800));
</script>

<img
	{srcset}
	{src}
	{sizes}
	{alt}
	{loading}
	class={className}
	style="width: 100%; height: auto;"
/>