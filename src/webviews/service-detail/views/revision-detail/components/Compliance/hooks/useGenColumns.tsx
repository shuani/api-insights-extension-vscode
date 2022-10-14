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

import { useMemo } from 'react';
import { marked } from 'marked';
import { AffectedItem, Analyses } from '../types';
// import useVscodeTheme from "../../../hooks/useVscodeTheme";

type ColumnsProp = {
  analyzer: {
    filteredValue?: string[];
  };
  action: {
    onAffectedItemsClick?: (data: Analyses) => void;
  };
  analyzerFilters: { text: string; value: string }[];
};

export default function useGenColumns(props: ColumnsProp) {
  const { action, analyzer, analyzerFilters } = props;
  // const theme = useVscodeTheme();
  const columns = useMemo(() => {
    const { filteredValue } = analyzer;
    const _filteredValue = filteredValue ? filteredValue.filter((_) => _) : [];
    return [
      {
        title: 'Analyzer',
        dataIndex: 'analyzer',
        key: 'analyzer',
        filters: analyzerFilters,
        onFilter: (value: string, record) => record.analyzer === value,
        className: 'analyzer-type_column',
        filteredValue: _filteredValue,
        filtered: _filteredValue.length > 0,
      },
      {
        title: 'Severity',
        dataIndex: 'severity',
        key: 'severity',
        render: (value: string) => (
          <div
            className={`common_severity common_severity_${value}`}
          >
            {`${value[0].toUpperCase()}${value.slice(1)}`}
          </div>
        ),
      },
      {
        title: 'Findings',
        dataIndex: 'message',
        key: 'message',
        render: (value: string) => (
          <div
            className="compliance_findings"
            dangerouslySetInnerHTML={{ __html: marked.parse(value) }}
          />
        ),
      },
      {
        title: 'Recommendation',
        dataIndex: 'mitigation',
        key: 'mitigation',
        render: (value: string) => (
          <div
            className="compliance_recommendation"
            dangerouslySetInnerHTML={{ __html: marked.parse(value) }}
          />
        ),
      },
      {
        title: 'Action',
        dataIndex: 'data',
        key: 'data',
        render: (value: AffectedItem[], record) => (
          <div
            className="compliance_affected_action"
            onClick={() => action.onAffectedItemsClick(record)}
          >
            View
            {' '}
            {value.length}
            {' '}
            Item(s) Affected
          </div>
        ),
      },
    ];
  }, [analyzer, action, analyzerFilters]);

  return columns;
}
