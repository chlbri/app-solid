import { aliasTs } from '@bemedev/dev-utils/vitest-alias';
import { exclude } from '@bemedev/dev-utils/vitest-exclude';
import { defineConfig } from 'vitest/config';
import tsconfig from './tsconfig.json';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [
    aliasTs(tsconfig as any),
    exclude({
      ignoreCoverageFiles: [
        '**/index.ts',
        'src/types.ts',
        '**/*.fixtures.ts',
        '**/*.types.ts',
        '**/fixtures/**/*.ts',
      ],
    }),
    solidPlugin() as any,
  ],
  test: {
    bail: 10,
    maxConcurrency: 10,
    passWithNoTests: true,
    slowTestThreshold: 3000,
    testTimeout: 20_000,
    environment: 'jsdom',
    globals: true,
    logHeapUsage: true,
    coverage: {
      enabled: true,
      extension: 'ts',
      reportsDirectory: '.coverage',
      all: true,
      provider: 'v8',
    },
  },
});
