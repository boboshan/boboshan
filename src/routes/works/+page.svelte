<script lang="ts">
	import SEO from '$lib/components/SEO.svelte';

	interface Work {
		slug: string;
		title: string;
		description: string;
		tags: string[];
		year: number;
		url?: string;
	}

	// Real projects
	const works: Work[] = [
		{
			slug: 'chordloud',
			title: 'ChordLoud',
			description: 'Most intuitive and accurate music chord detection and learning tool online.',
			tags: ['music theory', 'notation', 'education', 'web'],
			year: 2023,
			url: 'https://chordloud.com/'
		},
		{
			slug: 'wwiser',
			title: 'Wwiser',
			description:
				'A collection of productivity tools for Wwise sound designers just in the browser.',
			tags: ['wwise', 'waapi', 'game audio', 'wwise tools'],
			year: 2024,
			url: 'https://wwiser.net/'
		},
		{
			slug: 'roll',
			title: 'Roll',
			description:
				'Free browser-based video editing tools. Compress, convert, trim, and mute videos instantly. No uploads, no servers — all processing happens locally in your browser.',
			tags: ['ffmpeg', 'wasm', 'free video tools', 'privacy-first'],
			year: 2024,
			url: 'https://roll.wwiser.net/'
		},
		{
			slug: 'boboshan',
			title: 'boboshan.com',
			description: 'This personal website with interactive Game of Life background.',
			tags: ['svelte', 'typescript'],
			year: 2025
		}
	];
</script>

{#snippet workContent(work: Work)}
	<div class="flex items-start justify-between">
		<h2
			class="text-sm text-light font-pixel inline-flex gap-1 transition-colors items-center group-hover:text-accent"
		>
			{work.title}{#if work.url}<svg
					class="h-3 w-3 inline-block"
					viewBox="0 0 8 8"
					fill="currentColor"><path d="M2 0h6v6h-2v-2h-2v-2h-2zM0 4h2v2h2v2h-4z" /></svg
				>{/if}
		</h2>
		<span class="text-xs text-light/50 font-mono">{work.year}</span>
	</div>
	<p class="text-xs text-light/70 leading-relaxed font-mono mt-3">
		{work.description}
	</p>
	<div class="mt-3 flex flex-wrap gap-2">
		{#each work.tags as tag (tag)}
			<span class="text-xs text-accent/80 font-mono px-2 py-1 bg-accent/10">
				#{tag}
			</span>
		{/each}
	</div>
{/snippet}

<SEO
	title="Works"
	description="Projects and works by bbs (boboshan) - ChordLoud, Wwiser, Roll, and more creative tools."
	keywords={['works', 'projects', 'portfolio', 'ChordLoud', 'Wwiser', 'Roll']}
/>

<div class="mx-auto max-w-2xl">
	<h1 class="text-lg text-light font-pixel mb-8">works</h1>

	<div class="gap-6 grid md:grid-cols-2">
		{#each works as work (work.slug)}
			<article class="group pixel-container transition-colors hover:border-accent">
				{#if work.url}
					<a href={work.url} target="_blank" rel="noopener noreferrer" class="block">
						{@render workContent(work)}
					</a>
				{:else}
					<div>
						{@render workContent(work)}
					</div>
				{/if}
			</article>
		{/each}
	</div>

	<p class="text-xs text-light/40 font-mono mt-8 text-center">// more works in progress...</p>
</div>
