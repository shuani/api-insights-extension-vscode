/**
 * Copyright 2022 Cisco Systems, Inc. and its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  env: {
    // Enable JavaScript type comments
    browser: true,
  },
  settings: {
    // Says it will find React's version from package.json
    react: {
      version: 'detect',
    },
    // Apply "paths" setting in tsconfig.json for your project
    'import/resolver': {
      typescript: true,
    },
  },
  extends: [
    'airbnb',
    'airbnb/hooks',
    // Disable 'react/react-in-jsx-scope' and 'react/jsx-uses-react' rules for React over 17
    'plugin:react/jsx-runtime',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    // Customized for typescript file extensions
    'import/extensions': [
      2,
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    // Customized for typescript components
    'react/jsx-filename-extension': [2, { extensions: ['.jsx', '.tsx'] }],
    // Customized for enum by 2 following items
    'no-shadow': 'off',
    // '@typescript-eslint/no-shadow': ['error'],
    //
    '@typescript-eslint/no-namespace': 'off',
    //
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
    'jsx-a11y/label-has-associated-control': 'off',
    'jsx-a11y/no-autofocus': 'off',
    'react/destructuring-assignment': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/require-default-props': 'off',
    // 'react/jsx-boolean-value': { always: ['active'] },

    'import/no-relative-packages': 'off',
    // 'no-nested-ternary': 'off',
    'max-classes-per-file': 'warn',
    '@typescript-eslint/ban-ts-comment': 'warn',
    'prefer-arrow/prefer-arrow-functions': 'off',
    'no-param-reassign': 'warn',
    'import/prefer-default-export': 'warn',
    '@typescript-eslint/no-shadow': 'warn',
    'jsx-a11y/no-noninteractive-element-interactions': 'warn',
    'no-underscore-dangle': 'warn',
    '@typescript-eslint/no-empty-function': 'off',
    // 'prefer-destructuring': 'off',
    // 'prefer-const': 'warn',
    '@typescript-eslint/ban-types': 'warn',
    'object-curly-newline': 'off',
  },
};
