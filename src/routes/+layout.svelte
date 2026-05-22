<script lang="ts">
	import './layout.css';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href="/favicon.svg" />
</svelte:head>

<div class="flex flex-col min-h-screen">
	<Header />
	<main class="flex-1">
		{@render children()}
	</main>
	<Footer />
</div>