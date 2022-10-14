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
import { Tooltip } from 'antd';
import { SPEC_DIFF_TOOLTIP, NO_DIFF } from '../const';
import { ActionTypes, DiffFilterTypes } from '../types';

type ColumnsProp = {
  specDiffType: {
    filteredValue?: string[];
    onClick: (data: any) => void;
  };
  action: {
    onClick: (type: ActionTypes, data: any) => void;
  };
};

function getType(value: any) {
  const _type = value ? value.split('_')[0] : '';
  const type: keyof typeof SPEC_DIFF_TOOLTIP = _type[0] + _type.slice(1).toLowerCase();
  return type;
}

export default function useGenColumns(props: ColumnsProp) {
  const { specDiffType, action } = props;
  const columns = useMemo(() => {
    const { filteredValue } = specDiffType;
    const _filteredValue = filteredValue ? filteredValue.filter((_) => _) : [];
    return [
      {
        title: 'Method',
        dataIndex: 'method',
        key: 'method',
        render: (value: string) => value.toUpperCase(),
      },
      {
        title: 'Path',
        dataIndex: 'path',
        key: 'path',
      },
      {
        title: 'Spec Diff',
        dataIndex: 'specDiffType',
        key: 'specDiffType',
        render: (value: any, record: any) => {
          const type = getType(value);
          return (
            <Tooltip
              title={SPEC_DIFF_TOOLTIP[type]}
              color="rgba(0, 0, 0, 0.75)"
            >
              <div
                onClick={() => specDiffType.onClick({ ...record, type })}
                className={`diff-type diff-type_${type}`}
              >
                {value !== NO_DIFF ? type : '--'}
              </div>
            </Tooltip>
          );
        },
        width: 120,
        filters: [
          {
            text: 'General',
            value: DiffFilterTypes.GENERAL_DIFF,
          },
          {
            text: 'Shadow',
            value: DiffFilterTypes.SHADOW_DIFF,
          },
          {
            text: 'Zombie',
            value: DiffFilterTypes.ZOMBIE_DIFF,
          },
        ],
        filteredValue: _filteredValue,
        filtered: _filteredValue.length > 0,
        className: 'spec-diff-type_column',
        onFilter: (value: string, record) => record.specDiffType === value,
      },

      {
        title: 'Action',
        key: 'action',
        render: (_, record) => {
          const { onClick } = action;
          const { specDiffType } = record;

          const content = (
            <ul className="spec-list_actions_content">
              {specDiffType === DiffFilterTypes.SHADOW_DIFF && (
                <Tooltip title="Open Spec" color="rgba(0, 0, 0, 0.75)">
                  <li
                    className="spec-list_actions_openSpec"
                    onClick={() => onClick(ActionTypes.openSpec, record)}
                  >
                    <span className="codicon codicon-code" />
                  </li>
                </Tooltip>
              )}
              {specDiffType !== DiffFilterTypes.SHADOW_DIFF && (
                <Tooltip color="rgba(0, 0, 0, 0.75)" title="Go to Definition">
                  <li
                    className="spec-list_actions_goToDefination"
                    onClick={() => onClick(ActionTypes.goToDefination, record)}
                  >
                    <span className="codicon codicon-file-symlink-file" />
                  </li>
                </Tooltip>
              )}
            </ul>
          );
          return content;
        },
      },
    ];
  }, [specDiffType, action]);

  return columns;
}
