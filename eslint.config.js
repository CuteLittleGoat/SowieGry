const globals = require("globals");

module.exports = [
  {
    ignores: ["node_modules/**", "playwright-report/**", "test-results/**", "SowaRunner/p5.js"],
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      "no-dupe-args": "error",
      "no-dupe-keys": "error",
      "no-duplicate-case": "error",
      "no-unreachable": "error",
      "no-unexpected-multiline": "error",
      "valid-typeof": "error",
    },
  },
  {
    // Moduły ES Sowiego Silnika i stron na nim opartych (katalogi z package.json "type": "module").
    files: [
      "shared/engine/**/*.js",
      "shared/world/**/*.js",
      "shared/ui/**/*.js",
      "shared/meta/**/*.js",
      "shared/menu/**/*.js",
      "lab/**/*.js",
      "SowiaUcieczka/**/*.js",
    ],
    languageOptions: {
      sourceType: "module",
    },
  },
  {
    files: ["sw.js"],
    languageOptions: {
      globals: globals.serviceworker,
    },
  },
  {
    files: ["**/*.mjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.node,
    },
  },
];
