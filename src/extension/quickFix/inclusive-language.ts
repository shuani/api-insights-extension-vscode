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

import { Range, WorkspaceEdit } from 'vscode';
import { Fix } from './interface';

type replacer = {
  [key: string]: string[];
};

const replacement: replacer = {
  blacklist: ['denylist', 'blocklist', 'exclusion list'],
  whitelist: ['allowlist', 'permitlist', 'inclusion list'],
  master: ['primary', 'main', 'active'],
  slave: ['follower', 'replica', 'standby'],
  'master-slave': ['leader/follower', 'primary/replica', 'primary/standby'],
  grandfathered: ['legacy status'],
  dummy: ['placeholder', 'sample'],
  sanity: ['confidence', 'quick check', 'coherence check'],
  'man-hours': ['person hours', 'engineer hours'],
  guys: ['folks', 'people', 'you all', 'y\'all', 'yinz'],
  whitebox: ['open-box'],
  blackbox: ['closed-box'],
};

const replace = function (orig: string): Fix[] {
  return replacement[orig].map(
    (w, index) => function (analyse, document, range) {
      const edit = new WorkspaceEdit();
      const word = document.getWordRangeAtPosition(
        range.start,
        /[a-zA-Z]+(-)?[a-zA-Z]+/,
      );
      if (!word) return null;
      const text = document.getText(word) || orig;
      const words = replacement[text];
      if (words && words.length > index && words[index]) {
        w = words[index];
      }
      edit.replace(document.uri, word, w);
      return {
        title: `Replace '${text}' with '${w}'`,
        edit,
      };
    },
  );
};

export const NAMES = Object.keys(replacement);
export const fixs = NAMES.map((w) => replace(w));
