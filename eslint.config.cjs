const { FlatCompat } = require("@eslint/eslintrc");
const { dirname } = require("path");
const compat = new FlatCompat({ baseDirectory: dirname(__filename) });

module.exports = [
  ...compat.extends("next/core-web-vitals"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];
