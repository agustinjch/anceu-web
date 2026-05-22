<script lang="ts">
	import LanguagePlaceholder from '$lib/components/LanguagePlaceholder.svelte';
	let { children } = $props();
</script>

{@render children()}