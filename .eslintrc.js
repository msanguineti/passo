module.exports = {
  env: {
    browser: true,
    es6: true,
    commonjs: true,
  },
  extends: ['eslint:recommended', 'plugin:no-unsanitized/DOM'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 11,
    sourceType: 'module',
  },
  rules: {},
}
