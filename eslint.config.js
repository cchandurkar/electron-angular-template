import tseslint from '@electron-toolkit/eslint-config-ts';

const cfg = tseslint.config(
  {
    files: [
      "src/main/**/*.ts",
      "src/preload/**/*.ts",
    ],
    extends: [
      tseslint.configs.recommendedTypeChecked,
      {
        languageOptions: {
          parserOptions: {
            projectService: true,
            tsconfigRootDir: import.meta.dirname,
          },
        },
      },
    ],
    rules: {
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
    }
  }
)

export default cfg;