<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import 'virtual:uno.css';
	import GameOfLife from '$lib/components/GameOfLife.svelte';
	import Navigation from '$lib/components/Navigation.svelte';
	import { siteConfig } from '$lib/config/site';
	import { setContext } from 'svelte';

	let { children } = $props();

	let gameOfLifeRef: { resetGrid: () => void; randomizeGrid: () => void };

	// Set context for child components to access game controls
	setContext('gameOfLife', {
		get reset() {
			return () => gameOfLifeRef?.resetGrid();
		},
		get random() {
			return () => gameOfLifeRef?.randomizeGrid();
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="theme-color" content={siteConfig.themeColor} />
</svelte:head>

<div class="text-light bg-dark min-h-screen overflow-x-hidden">
	<GameOfLife bind:this={gameOfLifeRef} />
	<Navigation />
	<main
		class="px-4 pb-8 pt-20 max-w-full pointer-events-none relative z-10 [&_a]:pointer-events-auto [&_button]:pointer-events-auto [&_input]:pointer-events-auto"
	>
		{@render children()}
	</main>
</div>

<style>
	:global(html) {
		background-color: #0a0a0a;
	}

	:global(a) {
		text-decoration: none;
	}

	:global(::selection) {
		background-color: #e8e8e8;
		color: #0a0a0a;
	}

	/* Markdown content styles */
	:global(.prose p) {
		margin-bottom: 1rem;
	}

	:global(.prose ul) {
		list-style: none;
		margin-left: 1rem;
		margin-bottom: 1rem;
	}

	:global(.prose ul li::before) {
		content: '> ';
		opacity: 0.6;
	}

	:global(.prose code) {
		background-color: rgba(232, 232, 232, 0.1);
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
		font-size: 0.875em;
	}

	:global(.prose pre) {
		background-color: rgba(232, 232, 232, 0.05);
		padding: 1rem;
		overflow-x: auto;
		margin-bottom: 1rem;
	}

	:global(.prose pre code) {
		background: none;
		padding: 0;
	}
</style>
