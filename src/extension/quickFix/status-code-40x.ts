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

import { Range, Position, WorkspaceEdit } from 'vscode';
import { Fix } from './interface';

export const NAMES = ['status-code-401', 'status-code-403'];

type Content = (
  start: number
) => string;

const code_401 = function (num: number) : string {
  return `\n${' '.repeat(num)}"401": {\n${' '.repeat(num + 2)}"description": "Unauthorized"\n${' '.repeat(num)}},`;
};

const code_403 = function (num: number) : string {
  return `\n${' '.repeat(num)}"403": {\n${' '.repeat(num + 2)}"description": "Forbidden"\n${' '.repeat(num)}},`;
};

const statusCode40x = function (code: string, content: Content) : Fix {
  return function (analyse, document, range) {
    const edit = new WorkspaceEdit();
    const r = new Range(
      new Position(range.start.line, range.start.character + 1),
      new Position(range.start.line, range.start.character + 2),
    );
    edit.replace(document.uri, r, content(Math.max(8, range.start.character - 'responses'.length - 2)));
    return {
      title: `Add ${code} status code in response body`,
      edit,
    };
  };
};

export const fixs = [[statusCode40x('401', code_401)], [statusCode40x('403', code_403)]];
