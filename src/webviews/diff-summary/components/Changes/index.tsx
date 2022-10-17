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

import { useCallback, useMemo } from 'react';
import { Table, Tag } from 'antd';

import useGenColumns from './hooks/useGenColumns';
import useGenData from './hooks/useGenData';

import { ListProps, ActionTypes, Data } from './types';
import './index.scss';
import { goToDefinitionWhenSpecDiff } from '../../../Service';

export type { ListProps, ActionTypes, Data };

export default function List(props: ListProps) {
  const {
    data, loading, title, diffSpecs,
  } = props;

  const onActionClick = useCallback<(
    type: ActionTypes, data: Data) => void>(
    (type, data) => {
      if (type === ActionTypes.goToDefination) {
        const { newSpec, oldSpec } = diffSpecs;
        if (newSpec && oldSpec) {
          const path = ['paths', data.path, data.method.toLowerCase()];
          goToDefinitionWhenSpecDiff(oldSpec, newSpec, path);
        }
      }
    },
    [diffSpecs],
    );

  const columns = useGenColumns({
    action: { onClick: onActionClick },
    title,
  });

  const _data = useGenData(data);

  const haveBreaking = useMemo(() => data.some((_) => _.breaking), [data]);

  if (!data && loading) return null;

  return (
    _data && (
      <>
        <div className="diff-summary_list_title" id={title}>
          <span>{title[0].toUpperCase() + title.slice(1)}</span>
          {haveBreaking && <Tag color="#A31515">Breaking</Tag>}
        </div>

        <Table
          loading={loading}
          size="middle"
          bordered
          pagination={false}
          columns={columns}
          dataSource={_data}
        />
      </>
    )
  );
}
