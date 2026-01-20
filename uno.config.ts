import { defineConfig, presetWind4, presetWebFonts } from 'unocss';

export default defineConfig({
	presets: [
		presetWind4({
			preflights: {
				reset: true
			}
		}),
		presetWebFonts({
			provider: 'google',
			fonts: {
				pixel: ['Press Start 2P'],
				mono: ['VT323']
			}
		})
	],
	theme: {
		colors: {
			dark: '#0a0a0a',
			light: '#e8e8e8',
			accent: '#4a9eff'
		}
	},
	shortcuts: {
		'pixel-border': 'border-2 border-light',
		'pixel-text': 'font-pixel text-light',
		'pixel-container': 'bg-dark/80 backdrop-blur-sm pixel-border p-4'
	}
});
