import type { Component } from 'svelte';

export interface PostMeta {
	title: string;
	date: string;
	excerpt: string;
}

export interface Post extends PostMeta {
	slug: string;
}

export interface PostModule {
	default: Component;
	metadata: PostMeta;
}

// Import all markdown posts
const postModules = import.meta.glob<PostModule>('/src/posts/*.md', { eager: true });

export function getAllPosts(): Post[] {
	const posts: Post[] = [];

	for (const [path, module] of Object.entries(postModules)) {
		const slug = path.replace('/src/posts/', '').replace('.md', '');
		posts.push({
			slug,
			...module.metadata
		});
	}

	// Sort by date descending (newest first)
	return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPost(slug: string): { meta: Post; content: Component } | undefined {
	const path = `/src/posts/${slug}.md`;
	const module = postModules[path];

	if (!module) return undefined;

	return {
		meta: {
			slug,
			...module.metadata
		},
		content: module.default
	};
}
