// Site-wide SEO configuration
export const siteConfig = {
	name: 'boboshan',
	title: 'boboshan - Sound Designer & Creative Coder',
	description:
		"bbs's personal website. Developer who loves creative coding, pixel art, and building things on the web.",
	url: 'https://boboshan.com',
	author: {
		name: 'bbs',
		fullName: 'Boshan Zhou',
		github: 'https://github.com/boboshan',
		linkedin: 'https://www.linkedin.com/in/zhouboshan/'
	},
	keywords: [
		'boboshan',
		'bbs',
		'developer',
		'creative coding',
		'pixel art',
		'svelte',
		'web development',
		'game of life'
	],
	ogImage: '/og-image.png',
	themeColor: '#0a0a0a'
} as const;

export type SiteConfig = typeof siteConfig;
