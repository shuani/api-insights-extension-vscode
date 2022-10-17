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

import { useCallback, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Table, TableProps } from 'antd';
import Loader from '../../../../components/Loader';
import useGenColumns from './hooks/useGenColumns';
import useGenData from './hooks/useGenData';
import useChangeFilterNum from '../../hooks/useChangeFilterNum';
import {
  ListParams,
  SpecDiffType,
  ListProps,
  ActionTypes,
  DiffFilterTypes,
} from './types';
import './index.scss';
import { openInEditorWithProblems } from '../../../../../Service';

export type {
  ListParams, SpecDiffType, ListProps, ActionTypes,
};
export { DiffFilterTypes };

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 15;

function header() {
  return <div className="list_header">API Spec Drift</div>;
}

export default function List(props: ListProps) {
  const { data, loading } = props;
  const { spec, compliance, service } = data || {};

  const [params, setParams] = useState<ListParams>({});
  const location = useLocation();
  const navigate = useNavigate();
  const onSpecDiffClick = useCallback(
    (data: any) => {
      navigate('/specDiff', {
        state: {
          data,
          spec: { ...spec, service_name: service.name_id },
          detailNavigationState: location.state,
        },
      });
    },
    [navigate, spec, service?.name_id, location.state],
  );
  const onActionClick = useCallback(
    (type, data) => {
      const _spec = { ...spec, service_name: service.name_id };
      switch (type) {
        case ActionTypes.openSpec:
          openInEditorWithProblems(
            _spec,
            { line: 0, character: 0 },
            compliance,
            spec.score,
          );
          break;

        case ActionTypes.goToDefination:
          openInEditorWithProblems(_spec, data.path, compliance, spec.score);
          break;
        default:
      }
    },
    [spec, compliance, service?.name_id],
  );

  const columns = useGenColumns({
    specDiffType: {
      filteredValue: params.specDiffType?.split(','),
      onClick: onSpecDiffClick,
    },
    action: { onClick: onActionClick },
  });

  const { data: _data } = useGenData(data);
  useChangeFilterNum(
    params.specDiffType,
    '.spec-diff-type_column .ant-table-filter-column',
  );

  useEffect(() => {
    setParams((params) => ({
      ...params,
      spec: '',
      page: DEFAULT_PAGE,
      specDiffType: undefined,
    }));
  }, [data]);

  const handleListChange: TableProps<any>['onChange'] = useCallback(
    (pagination, filters) => {
      const specDiffType = (
        filters.specDiffType ? filters.specDiffType.join(',') : undefined
      ) as SpecDiffType;
      setParams((params) => ({
        ...params,
        page: pagination.current,
        pageSize: pagination.pageSize,
        specDiffType,
      }));
    },
    [],
  );

  if (!data && loading) return <Loader />;

  return (
    _data && (
      <Table
        loading={loading}
        pagination={{
          current: params.page,
          showSizeChanger: false,
          pageSize: DEFAULT_PAGE_SIZE,
        }}
        onChange={handleListChange}
        size="middle"
        title={header}
        bordered
        columns={columns}
        dataSource={_data}
      />
    )
  );
}
