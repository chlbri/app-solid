import { defineConfig } from '@bemedev/dev-utils/rolldown';

export default defineConfig.bemedev({
  ignoresJS: '**/*.example.ts',
  externals: ['@bemedev/app-ts', '@bemedev/decompose', 'solid-js'],
});
