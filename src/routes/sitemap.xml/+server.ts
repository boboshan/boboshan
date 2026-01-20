import { siteConfig } from '$lib/config/site';
import { getAllPosts } from '$lib/data/posts';

export const prerender = true;

export function GET() {
	const posts = getAllPosts();

	const staticPages = ['', '/about', '/works', '/posts'];

	const postUrls = posts.map((post) => `/posts/${post.slug}`);

	const allUrls = [...staticPages, ...postUrls];

	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
	.map(
		(url) => `  <url>
    <loc>${siteConfig.url}${url}</loc>
    <changefreq>${url === '' ? 'weekly' : 'monthly'}</changefreq>
    <priority>${url === '' ? '1.0' : url.startsWith('/posts/') ? '0.8' : '0.7'}</priority>
  </url>`
	)
	.join('\n')}
</urlset>`;

	return new Response(sitemap, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=0, s-maxage=3600'
		}
	});
}
