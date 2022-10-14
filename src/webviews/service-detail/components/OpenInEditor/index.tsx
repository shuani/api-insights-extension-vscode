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

import {
  FC, PropsWithChildren, useContext, cloneElement,
} from 'react';
import { Dropdown, Menu } from 'antd';
import { uploadHistoryContext } from '../../index';
import './index.scss';

export enum OpenType {
  cloud = 'cloud',
  history = 'history',
}
type Props = {
  onClick: (type: OpenType, path?: string) => void;
  // eslint-disable-next-line camelcase
  spec: { version: string; service_id: string };
};

function formateTime(time: Date) {
  const times = new Date(time).getTime();
  const now = Date.now();
  let distance = now - times;
  const formates = [
    { unit: 'minute(s)', start: 1000 * 60 },
    { unit: 'hour(s)', start: 60 },
    { unit: 'day(s)', start: 24 },
    { unit: 'week(s)', start: 7 },
    { unit: 'month(s)', start: 4 },
    { unit: 'year(s)', start: 12 },
  ];
  let i = 0;
  do {
    distance /= formates[i].start;
    i += 1;
  } while (i < formates.length && distance > formates[i].start);
  return `${Math.floor(distance) || 1} ${formates[i - 1].unit} ago`;
}
function OpenInEditor(props: PropsWithChildren<Props>) {
  const { children, onClick, spec } = props;
  const uploadHistory = useContext(uploadHistoryContext);
  const history = spec
    && Object.keys(uploadHistory)
      .filter((key) => {
        const item = uploadHistory[key];
        return (
          spec.service_id === item.serviceId && spec.version === item.version
        );
      })
      .map((_) => ({ path: _, time: uploadHistory[_].mtime }))
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  const childProps = { history };
  const theChildren = Array.isArray(children) ? children : [children];
  const child = <div>{theChildren.map((_child) => cloneElement(_child, childProps))}</div>;
  if (!history || !history.length) {
    return <div onClick={() => onClick(OpenType.cloud)}>{child}</div>;
  }

  const items = [
    {
      key: 'recently',
      label: 'Modified Recently',
      type: 'group',
    },
    ...history.map((_) => {
      const fileName = _.path.match(/\/([^/]+)$/)[1];
      return {
        label: (
          <ul title={_.path} className="open-in-editor_history_item">
            <li>{fileName}</li>
            <li>{formateTime(_.time)}</li>
          </ul>
        ),
        key: _.path,
        onClick: () => onClick(OpenType.history, _.path),
        icon: <span className="open-in-editor_history" />,
      };
    }),
    { type: 'divider', key: 'recently-divider ' },
    {
      key: 'cloud',
      label: 'Open From Cloud',
      icon: <span className="open-in-editor_cloud" />,
      onClick: () => onClick(OpenType.cloud),
    },
  ];
  const menu = <Menu items={items} />;
  return <Dropdown overlay={menu} placement="top">{child}</Dropdown>;
}

export default OpenInEditor;
