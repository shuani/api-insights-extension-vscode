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

import { SEVERITY } from './const';
import { Analyses } from './types';

export function transformAnalysesToProblems(analyses: any[]) {
  const list: Analyses[] = [];

  const _analyses = analyses;

  _analyses.forEach((item) => {
    const { analyzer, result } = item;
    const { findings } = result;

    const _analyzer = analyzer;

    SEVERITY.forEach((severity) => {
      const rules = findings[severity]?.rules;
      if (rules !== null) {
        Object.keys(rules).forEach((key) => {
          const rule = rules[key];
          const obj = {
            ...rule, analyzer: _analyzer, severity, ruleKey: key,
          };
          list.push(obj);
        });
      }
    });
  });

  return list;
}

export function getSpecFileName(
  serviceName: string,
  version: string,
  revision: string,
) {
  return `${serviceName}-${version}-r${revision}.spec.json`;
}
