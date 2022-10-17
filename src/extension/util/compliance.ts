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

import * as store from '../store';
import { SEVERITY, DRIFT } from '../../const';
import { AnalyzersMetaType as AnalyzersMetaItemType } from '../../types';

type AnalyzersMetaType = AnalyzersMetaItemType[];

const initialSummary = SEVERITY.reduce((prev, item) => ({ ...prev, [item]: 0 }), {});

export function getTableData(
  analyses: any[],
  analysesMeta?: AnalyzersMetaType | null,
) {
  const list: any[] = [];
  const summaryObj = { ...initialSummary } as { [key: string]: number };

  const _analyses = analyses;

  _analyses.forEach((item) => {
    const { analyzer, result } = item;
    const { summary, findings } = result;
    const { stats } = summary;

    if (!analysesMeta) {
      analysesMeta = store.getStoreAnalyzersMeta();
    }

    let _analyzer = analyzer;
    if (analysesMeta) {
      const meta = analysesMeta.filter((m) => m.name_id === analyzer);
      if (meta[0]) {
        _analyzer = meta[0].title;
      }
    }

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
      summaryObj[severity] += (stats[severity]?.count || 0);
    });
  });

  return {
    summary: summaryObj,
    list,
  };
}

export function getComplianceTableData(
  analyses: any[],
  analysesMeta: AnalyzersMetaType | null,
) {
  const _analyses = analyses.filter((item) => item.analyzer !== DRIFT);
  return getTableData(_analyses, analysesMeta);
}

export function getDriftTableData(
  analyses: any[],
  analysesMeta: AnalyzersMetaType | null,
) {
  const _analyses = analyses.filter((item) => item.analyzer === DRIFT);
  return getTableData(_analyses, analysesMeta);
}
