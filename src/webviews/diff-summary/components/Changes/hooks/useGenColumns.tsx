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

import { ActionTypes, Data } from '../types';

type ColumnsProp = {
  title: string;
  action: {
    onClick: (type: ActionTypes, data: Data) => void;
  };
};

const TOOLTIP_COLOR = 'rgba(0, 0, 0, 0.75)';
const DELETED = 'deleted';

export default function useGenColumns(props: ColumnsProp) {
  const { action, title } = props;
  const columns = useMemo(() => [
    {
      title: 'Method',
      dataIndex: 'method',
      key: 'method',
      render: (value: string) => value.toUpperCase(),
      width: '10%',
      textWrap: 'word-break',
    },
    {
      title: 'Path',
      dataIndex: 'path',
      key: 'path',
      textWrap: 'word-break',
      width: '20%',
      render: (value: string) => <div style={{ wordBreak: 'break-word' }}>{value}</div>,
    },
    {
      title: 'Type',
      dataIndex: 'breaking',
      key: 'breaking',
      render: (value) => (
        <div style={{ width: 100 }}>
          {value ? 'Breaking' : 'Non-breaking'}
        </div>
      ),
      width: '10%',
      textWrap: 'word-break',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      textWrap: 'word-break',
    },

    {
      title: 'Action',
      key: 'action',
      render: (_, record) => {
        const { onClick } = action;

        const content = (
          <ul className="diff-summary_list_actions_content">
            {title !== DELETED && (
            <Tooltip color={TOOLTIP_COLOR} title="Go to Definition">
              <li
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
      width: '10%',
      textWrap: 'word-break',
    },
  ], [action, title]);

  return columns;
}
