import tseslint from '@electron-toolkit/eslint-config-ts';

const cfg = tseslint.config({
  files: ['src/**/*.ts'],
  extends: [
    tseslint.configs.recommendedTypeChecked,
    {
      languageOptions: {
        parserOptions: {
          // `src/preload/**` is excluded from tsconfig.json (it's bundled to
          // CommonJS separately by esbuild — see scripts/build-preload.mjs),
          // so the project service can't find it via the default tsconfig.
          // Point those files at tsconfig.preload.json instead.
          projectService: {
            allowDefaultProject: ['src/preload/*.ts', 'src/preload/types/*.ts'],
            defaultProject: './tsconfig.preload.json'
          },
          tsconfigRootDir: import.meta.dirname
        }
      }
    }
  ],
  rules: {
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unsafe-argument': 'off',
    '@typescript-eslint/no-base-to-string': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off'
  }
});

export default cfg;
