<script lang="ts">
	import SEO from '$lib/components/SEO.svelte';
</script>

<SEO
	title="About"
	description="Learn about bbs (boboshan) - a developer passionate about creative coding, pixel art, web technologies, and open source."
	keywords={['about', 'developer', 'creative coder', 'bbs', 'boboshan']}
/>

<div class="mx-auto max-w-2xl">
	<h1 class="text-lg text-light font-pixel mb-8">about</h1>

	<div class="pixel-container">
		<div class="text-sm text-light/80 leading-relaxed font-mono space-y-6">
			<p>
				Hi, I'm <span class="text-accent">bbs</span>, aka
				<span class="text-light">boboshan</span> or
				<span class="text-light font-mono">帕克马拉啵啵山</span>.
			</p>

			<p>
				I'm a sound designer, composer, and developer based in Shanghai. I build tools, interactive
				web experiences, and game audio systems.
			</p>

			<p>
				The background is <span class="text-light">Conway's Game of Life</span> — a cellular automaton
				demonstrating how complex patterns emerge from simple rules. Click or drag to create life.
			</p>

			<div class="mt-6 pt-6 border-t border-light/20">
				<h2 class="text-xs text-light font-pixel mb-4">interests</h2>
				<ul class="text-xs space-y-2">
					<li>&gt; game audio &amp; middleware</li>
					<li>&gt; creative coding &amp; generative art</li>
					<li>&gt; web technologies &amp; tool dev</li>
					<li>&gt; pixel art &amp; aesthetics</li>
				</ul>
			</div>

			<div class="mt-6 pt-6 border-t border-light/20">
				<h2 class="text-xs text-light font-pixel mb-4">connect</h2>
				<div class="text-xs flex flex-wrap gap-4">
					<a
						href="https://github.com/boboshan"
						class="text-light/60 transition-colors hover:text-accent"
					>
						[github]
					</a>
					<a
						href="https://www.linkedin.com/in/zhouboshan/"
						class="text-light/60 transition-colors hover:text-accent"
					>
						[linkedin]
					</a>
				</div>
			</div>
		</div>
	</div>

	<p class="text-xs text-light/40 font-mono mt-8 text-center">
		// built with svelte, unocss &amp; pixels
	</p>
</div>
