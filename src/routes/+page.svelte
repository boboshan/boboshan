<script lang="ts">
	import { getContext } from 'svelte';
	import SEO from '$lib/components/SEO.svelte';

	// Get the game of life functions from context
	const gameOfLife = getContext<{ reset: () => void; random: () => void }>('gameOfLife');
</script>

<SEO
	description="Developer & creative coder. Explore my posts, works, and experiments with pixel art and web technologies."
	keywords={['home', 'portfolio', 'creative coding']}
/>

<div class="flex flex-col min-h-[80vh] items-center justify-center">
	<div class="mt-32 flex gap-4 sm:mt-4">
		<button
			class="text-xs text-light/50 font-pixel px-2 py-1 transition-colors hover:text-light"
			onclick={() => gameOfLife?.reset()}
		>
			reset
		</button>
		<button
			class="text-xs text-light/50 font-pixel px-2 py-1 transition-colors hover:text-light"
			onclick={() => gameOfLife?.random()}
		>
			random
		</button>
	</div>

	<p class="text-xs text-light/70 leading-relaxed font-pixel mt-8 text-center max-w-md">
		life is about wriggling.
	</p>

	<div class="mt-12 flex flex-col gap-4 sm:flex-row sm:gap-6">
		<a
			href="/posts"
			class="text-xs text-light/60 font-pixel pixel-container transition-colors hover:text-light"
		>
			[posts]
		</a>
		<a
			href="/works"
			class="text-xs text-light/60 font-pixel pixel-container transition-colors hover:text-light"
		>
			[works]
		</a>
		<a
			href="/about"
			class="text-xs text-light/60 font-pixel pixel-container transition-colors hover:text-light"
		>
			[about]
		</a>
	</div>
</div>
