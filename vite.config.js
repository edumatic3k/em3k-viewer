import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
	plugins: [
		preact(),
		VitePWA({
			registerType: 'autoUpdate',
			injectRegister: 'script',
			manifest: {
				name: 'Edumatic 3000',
				short_name: 'em3k',
				description: 'A portable, offline-first course viewer.',
				start_url: '/',
				display: 'standalone',
				background_color: '#ffffff',
				theme_color: '#f4b942',
				icons: [
					{
						src: '/assets/img/em3k.svg',
						sizes: 'any',
						type: 'image/svg+xml',
						purpose: 'any',
					},
				],
			},
			workbox: {
				globPatterns: ['**/*.{html,js,css,svg,png,jpg,json}'],
				cleanupOutdatedCaches: true,
				clientsClaim: true,
				skipWaiting: true,
				navigateFallback: '/index.html',
				navigateFallbackDenylist: [/^\/(?:assets|content|api)(?:\/|$)/],
				maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
			},
		}),
	],
	server: {
		host: '0.0.0.0',
		port: 5173,
	},
});
