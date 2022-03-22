module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true,
  },
  extends: "eslint:recommended",
  sourceType: "module",
  parserOptions: {
    ecmaVersion: "latest",
  },
  rules: {
    semi: ["error", "never"],
    quotes: ["warn", "double"],
    "no-undef": ["off", "never"],
    "no-unneeded-ternary": "error",
    "linebreak-style": ["warn", "unix"],
    "no-whitespace-before-property": "warn",
    "object-curly-spacing": ["warn", "always"],
    indent: ["warn", 2, { SwitchCase: 1, flatTernaryExpressions: true }],
  }
}