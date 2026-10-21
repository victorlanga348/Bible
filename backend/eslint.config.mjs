import js from '@eslint/js';
import tseslint from 'typescript-eslint';
export default [
  { ignores: ['src/generated/**', 'dist/**', 'reports/**', '.stryker-tmp/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { files: ['**/*.cjs'], rules: { '@typescript-eslint/no-require-imports': 'off' }, languageOptions: { sourceType: 'commonjs', globals: { process: 'readonly', console: 'readonly', __dirname: 'readonly', Buffer: 'readonly', URL: 'readonly' } } },
];
