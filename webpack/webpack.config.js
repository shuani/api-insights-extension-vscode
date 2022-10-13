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

const path = require('path');

const srcRoot = path.resolve(__dirname, '..', 'src', 'webviews');
module.exports = (env, argv) => {
  let { mode, devtool } = argv;
  const isProd = mode === 'production';
  devtool = isProd ? undefined : 'inline-source-map';
  return {
    entry: {
      'service-detail': path.resolve(srcRoot, 'service-detail', 'index.tsx'),
      'service-list': path.resolve(srcRoot, 'service-list', 'index.tsx'),
      'diff-summary': path.resolve(srcRoot, 'diff-summary', 'index.tsx'),
      welcome: path.resolve(srcRoot, 'welcome', 'index.tsx'),
    },
    mode,
    devtool,
    output: {
      path: path.resolve(__dirname, '..', 'dist'),
      filename: '[name].bundle.js',
    },
    resolve: {
      modules: [path.resolve(srcRoot, 'node_modules')],
      extensions: ['.ts', '.tsx', '.js'],
    },
    module: {
      rules: [
        {
          test: /\.(jsx|js)$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: [
                  [
                    '@babel/preset-env',
                    {
                      // "targets": "defaults"
                      targets: { node: 'current' },
                    },
                  ],
                  [
                    '@babel/preset-react',
                    {
                      runtime: 'automatic',
                    },
                  ],
                ],
              },
            },
          ],
        },
        {
          test: /\.(scss|css)$/,
          use: ['style-loader', 'css-loader', 'sass-loader'],
        },
        {
          test: /\.(eot|ttf|woff|woff2)$/i,
          // More information here https://webpack.js.org/guides/asset-modules/
          type: 'asset/resource',
        },
        {
          test: /\.(png|jpg|gif|svg)$/i,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 8192,
              },
            },
          ],
        },
        {
          test: /\.tsx?$/,
          include: path.resolve(__dirname, '..'),
          use: ['ts-loader'],
        },
      ],
    },
  };
};
