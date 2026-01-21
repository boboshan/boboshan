<script lang="ts">
	import { page } from '$app/state';
	import { getPost } from '$lib/data/posts';
	import SEO from '$lib/components/SEO.svelte';

	const postData = $derived(getPost(page.params.slug ?? ''));
</script>

{#if postData}
	<SEO
		title={postData.meta.title}
		description={postData.meta.excerpt}
		ogType="article"
		article={{ publishedTime: postData.meta.date, author: 'bbs' }}
		keywords={['blog', 'article']}
	/>
{:else}
	<SEO title="Post Not Found" noindex />
{/if}

<div class="mx-auto max-w-2xl">
	<a href="/posts" class="text-xs text-light/60 font-pixel transition-colors hover:text-light">
		&lt; back to posts
	</a>

	{#if postData}
		<article class="mt-6 pixel-container">
			<div class="mb-4">
				<time class="text-xs text-light/50 font-mono">{postData.meta.date}</time>
				<h1 class="text-lg text-light font-pixel mt-2">{postData.meta.title}</h1>
			</div>

			<div class="prose text-sm text-light/80 leading-relaxed font-mono space-y-4">
				<postData.content />
			</div>
		</article>
	{:else}
		<div class="mt-6 pixel-container text-center">
			<h1 class="text-lg text-light font-pixel mb-4">Post Not Found</h1>
			<p class="text-sm text-light/70 font-mono">The post "{page.params.slug}" doesn't exist.</p>
		</div>
	{/if}
</div>
