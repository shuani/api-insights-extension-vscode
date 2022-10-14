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

import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';
import './index.scss';
import { getScoreLevel } from '../../../Service';

type Props = {
  score: number;
  title: string;
  update: string;
};

export default function Score(props: Props) {
  const { score, title, update } = props;
  const colorType = getScoreLevel(score);

  return (
    <div className="diff-summary_score">
      <div className="diff-summary_score_left">
        <div className={`__score ${colorType}`}>
          <CircularProgressbar
            strokeWidth={8}
            value={score || 0}
            text={score === null ? '-' : `${score}`}
            styles={buildStyles({
              textSize: '32px',
            })}
          />
        </div>
      </div>
      <ul className="diff-summary_score_right">
        <li className="diff-summary_score_right_title">{title}</li>
        {update && (
          <li className="diff-summary_score_right_update">{update}</li>
        )}
      </ul>
    </div>
  );
}
