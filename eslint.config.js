import js from '@eslint/js';
import globals from 'globals';

export default [{
  files: ['**/*.js'],
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    globals: {
      ...globals.browser,
      ...globals.node,
      ...globals.es2021
    }
  },
  rules: {
    ...js.configs.recommended.rules,
    'no-console': 'off'
  }
}];
