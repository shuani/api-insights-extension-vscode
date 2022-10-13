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

import * as InclusiveLanguage from './inclusive-language';
import * as Oas2HttpsOnly from './oas2-https-only';
import * as StatusCode40x from './status-code-40x';
import { Fix } from './interface';

const fixsMap = new Map<string, Fix[]>();

export function addFix(key: string, fix: Fix | Fix[]) {
  const _fix = Array.isArray(fix) ? fix : [fix];
  const fixs = fixsMap.get(key) || [];
  fixs.push(..._fix);
  fixsMap.set(key, fixs);
}

export function getFixs(key: string) {
  return fixsMap.get(key);
}

for (let i = 0; i < InclusiveLanguage.NAMES.length; i += 1) {
  addFix(InclusiveLanguage.NAMES[i], InclusiveLanguage.fixs[i]);
}
for (let i = 0; i < StatusCode40x.NAMES.length; i += 1) {
  addFix(StatusCode40x.NAMES[i], StatusCode40x.fixs[i]);
}
addFix(Oas2HttpsOnly.NAME, Oas2HttpsOnly.fixs);
