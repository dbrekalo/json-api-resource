// https://eslint.org/docs/user-guide/configuring
module.exports = {
  root: true,
  env: {
    browser: true,
    commonjs: true,
    amd: true
  },
  extends: [
    'eslint:recommended'
  ],
  plugins: [
    'standard'
  ],
  rules: {
    'padded-blocks': 'off',
    'no-mixed-operators': 'off',
    'indent': ['error', 4, {"SwitchCase": 1}],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'no-unused-vars': ['error', { 'args': 'none' }],
    'array-bracket-spacing': 'error',
    'block-spacing': 'error',
    'brace-style': ['error', '1tbs', { 'allowSingleLine': true }],
    'camelcase': 'error',
    'comma-spacing': 'error',
    'computed-property-spacing': 'error',
    'curly': 'error',
    'eol-last': 'error',
    'eqeqeq': 'error',
    'func-call-spacing': 'error',
    'key-spacing': 'error',
    'keyword-spacing': 'error',
    'max-depth': ['error', 5],
    'max-nested-callbacks': ['error', 4],
    'new-cap': ['error', {'capIsNew': false, 'newIsCapExceptions': ['default']}],
    'no-multiple-empty-lines': ['error', {'max': 1}],
    'no-extra-bind': 'error',
    'no-implicit-coercion': 'error',
    'no-implicit-globals': 'error',
    'no-useless-concat': 'error',
    'no-useless-return': 'error',
    'no-trailing-spaces': 'error',
    'no-multi-spaces': 'error',
    'no-whitespace-before-property': 'error',
    'object-curly-spacing': ['error', 'never'],
    'space-before-blocks': 'error',
    "space-before-function-paren": ["error", {
      "anonymous": "never",
      "named": "never",
      "asyncArrow": "always"
    }],
    'space-in-parens': ['error'],
    'wrap-iife': 'error'
  }
};
