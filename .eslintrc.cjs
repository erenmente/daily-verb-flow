module.exports = {
  root: true,
  env: {
    browser: true,
    commonjs: true,
    es2022: true,
    node: true,
  },
  extends: ["eslint:recommended"],
  parserOptions: {
    ecmaVersion: 2022,
  },
  ignorePatterns: ["node_modules/", ".netlify/", "coverage/"],
  rules: {
    "no-console": "off",
  },
};
