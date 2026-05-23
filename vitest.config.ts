/**
 * vitest.config.ts — uses jsdom + a setup file that brings in
 * `@testing-library/jest-dom`'s matchers. Core libraries are
 * mocked at the module boundary in each test file because jsdom
 * doesn't implement Web Audio / Canvas / Fetch.
 */
import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		include: ['test/**/*.test.{ts,tsx}'],
		environment: 'jsdom',
		globals: false,
		setupFiles: ['./test/setup.ts'],
	},
});
