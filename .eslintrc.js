module.exports = {
  parser: "@babel/eslint-parser",
  extends: [
    "bunchtogether",
    "plugin:jasmine/recommended"
  ],
  plugins: [
    "jasmine",
    "import"
  ],
  env: {
    jest: true,
    browser: true,
    jasmine: true
  },
  rules: {
    "import/extensions": ["error", { "ignore": ["p-queue", "observed-remove/map"] }],
    "import/no-unresolved": ["error", { "commonjs": true, "caseSensitive": true, "ignore": ["p-queue", "observed-remove/map"] }],
  }
}
