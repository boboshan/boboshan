<script lang="ts">
	import { getAllPosts } from '$lib/data/posts';
	import SEO from '$lib/components/SEO.svelte';

	const posts = getAllPosts();
</script>

<SEO
	title="Posts"
	description="Thoughts on coding, creative development, pixel art, and the beauty of emergent systems."
	keywords={['blog', 'posts', 'articles', 'coding']}
/>

<div class="mx-auto max-w-2xl">
	<h1 class="text-lg text-light font-pixel mb-8">posts</h1>

	<div class="space-y-6">
		{#each posts as post (post.slug)}
			<article class="group pixel-container transition-colors hover:border-accent">
				<a href="/posts/{post.slug}" class="block">
					<time class="text-xs text-light/50 font-mono">{post.date}</time>
					<h2 class="text-sm text-light font-pixel mt-2 transition-colors group-hover:text-accent">
						{post.title}
					</h2>
					<p class="text-xs text-light/70 leading-relaxed font-mono mt-2">
						{post.excerpt}
					</p>
				</a>
			</article>
		{/each}
	</div>

	<p class="text-xs text-light/40 font-mono mt-8 text-center">// more posts coming soon...</p>
</div>
