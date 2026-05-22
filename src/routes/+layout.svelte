<script lang="ts">
	import './layout.css';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { alternateLinks, type Lang } from '$lib/i18n';
	import { page } from '$app/stores';

	let { children, data } = $props();

	const siteUrl = 'https://anceu.com';

	let links = $derived(alternateLinks(data.pathname, siteUrl));
	let currentLang = $derived(data.lang as Lang);
</script>

<svelte:head>
	<link rel="icon" href="/favicon.svg" />
	{#each links as link}
		<link rel="alternate" hreflang={link.hreflang} href={link.href} />
	{/each}
</svelte:head>

<div class="flex flex-col min-h-screen" lang={currentLang}>
	<Header {currentLang} />
	<main class="flex-1">
		{@render children()}
	</main>
	<Footer {currentLang} />
</div>