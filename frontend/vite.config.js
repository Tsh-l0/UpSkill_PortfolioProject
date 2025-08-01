import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
	plugins: [react()],
	root: '.', // project root
	server: {
		host: '0.0.0.0',
		port: 3000
	},
	build: {
		outDir: 'dist',
		rollupOptions: {
			output: {
				manualChunks: {
					vendor: ['react', 'react-dom']
				}
			}
		}
	}
});
