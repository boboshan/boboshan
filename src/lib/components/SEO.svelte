<script lang="ts">
	import { siteConfig } from '$lib/config/site';

	interface Props {
		title?: string;
		description?: string;
		keywords?: string[];
		ogImage?: string;
		ogType?: 'website' | 'article';
		article?: {
			publishedTime?: string;
			author?: string;
		};
		noindex?: boolean;
	}

	let {
		title,
		description = siteConfig.description,
		keywords = [],
		ogImage = siteConfig.ogImage,
		ogType = 'website',
		article,
		noindex = false
	}: Props = $props();

	const fullTitle = $derived(title ? `${title} | ${siteConfig.name}` : siteConfig.title);
	const allKeywords = $derived([...siteConfig.keywords, ...keywords].join(', '));
	const ogImageUrl = $derived(ogImage.startsWith('http') ? ogImage : `${siteConfig.url}${ogImage}`);
</script>

<svelte:head>
	<!-- Primary Meta Tags -->
	<title>{fullTitle}</title>
	<meta name="title" content={fullTitle} />
	<meta name="description" content={description} />
	<meta name="keywords" content={allKeywords} />
	<meta name="author" content={siteConfig.author.fullName} />
	<meta name="theme-color" content={siteConfig.themeColor} />

	{#if noindex}
		<meta name="robots" content="noindex, nofollow" />
	{:else}
		<meta name="robots" content="index, follow" />
	{/if}

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content={ogType} />
	<meta property="og:url" content={siteConfig.url} />
	<meta property="og:title" content={fullTitle} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={ogImageUrl} />
	<meta property="og:site_name" content={siteConfig.name} />
	<meta property="og:locale" content="en_US" />

	{#if ogType === 'article' && article}
		{#if article.publishedTime}
			<meta property="article:published_time" content={article.publishedTime} />
		{/if}
		{#if article.author}
			<meta property="article:author" content={article.author} />
		{/if}
	{/if}

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:url" content={siteConfig.url} />
	<meta name="twitter:title" content={fullTitle} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={ogImageUrl} />

	<!-- Canonical URL -->
	<link rel="canonical" href={siteConfig.url} />
</svelte:head>
