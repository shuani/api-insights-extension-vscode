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
    // Customized for enum by 2 following items
    'no-shadow': 'off',
    // '@typescript-eslint/no-shadow': ['error'],
    //
    '@typescript-eslint/no-namespace': 'off',

    'import/no-relative-packages': 'off',
    // 'no-nested-ternary': 'off',
    'max-classes-per-file': 'warn',
    '@typescript-eslint/ban-ts-comment': 'warn',
    'prefer-arrow/prefer-arrow-functions': 'off',
    'no-param-reassign': 'warn',
    'import/prefer-default-export': 'off',
    '@typescript-eslint/no-shadow': 'warn',
    'no-underscore-dangle': 'warn',
    '@typescript-eslint/no-empty-function': 'off',
    'prefer-destructuring': 'off',
    // 'prefer-const': 'warn',
    '@typescript-eslint/ban-types': 'warn',
    'import/no-unresolved': 'off',
    'import/no-extraneous-dependencies': 'off',
    'class-methods-use-this': 'off',
    camelcase: 'warn',
    'consistent-return': 'off',
    'no-cond-assign': 'off',
    'object-curly-newline': 'off',
    'no-return-await': 'off',
  },
};
