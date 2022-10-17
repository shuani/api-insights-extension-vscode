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

import { Summary as SummaryType } from '../../../types';
import './index.scss';

export default function Summary(props: {
  data: SummaryType;
  showTitle?: boolean;
}) {
  const { data, showTitle = true } = props;
  return (
    <div className="common_summary">
      <ul className="common_summary_list">
        {showTitle && <li className="common_summary_list_title">Summary:</li>}
        {Object.keys(data).map((key) => (
          <li key={key} className={`common_severity common_severity_${key}`}>
            <span className="common_severity_num">{data[key]}</span>
            {`${key[0].toUpperCase()}${key.slice(1)}`}
          </li>
        ))}
      </ul>
    </div>
  );
}
