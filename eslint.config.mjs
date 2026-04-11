import nextConfig from 'eslint-config-next';

const config = [
  {
    ignores: ['.next/**/*', 'node_modules/**/*', 'dist/**/*', 'out/**/*'],
  },
  ...nextConfig,
];

export default config;
