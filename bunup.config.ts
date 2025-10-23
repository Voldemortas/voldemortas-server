import { defineConfig } from 'bunup';
import { copy } from 'bunup/plugins';

export default defineConfig({
  entry: ['src/index.ts', 'src/route/index.ts', 'src/utils/index.ts'],
  plugins: [copy(['src/build/default.html', 'src/build/development.html'])],
});