const nextPlugin = require("eslint-config-next");

module.exports = [
  {
    ignores: ["**/node_modules/**", "**/.next/**", "**/dist/**"],
  },
  ...nextPlugin,
  {
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/refs": "off",
      "react-hooks/purity": "off",
      "react-hooks/static-components": "off",
      "react-hooks/exhaustive-deps": "warn",
      "@next/next/no-img-element": "warn",
    },
  },
  {
    files: ["tests/**/*"],
    rules: {
      "react-hooks/rules-of-hooks": "off",
    },
  },
];
