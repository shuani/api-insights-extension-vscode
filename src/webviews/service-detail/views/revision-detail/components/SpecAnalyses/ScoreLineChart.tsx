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

import { Sparklines, SparklinesLine } from 'react-sparklines';
import { APIServiceSpec } from '../../../../../../types';
import './ScoreLineChart.scss';

export type ScoreLineChartProps = {
  revisions: APIServiceSpec[];
};

export default function ScoreLineChart(props: ScoreLineChartProps) {
  const { revisions } = props;

  let sparklineData = [...revisions].reverse().map((re) => re.score || 0);
  if (sparklineData.length < 10) {
    const prefixArray = new Array(10 - sparklineData.length).fill(0);
    sparklineData = [...prefixArray, ...sparklineData];
  }
  // console.log('sparklineData=>', sparklineData);

  return (
    <div className="score-line-chart">
      <Sparklines
        data={sparklineData}
        preserveAspectRatio="xMaxYMid meet"
        height={38}
        min={0}
        max={Math.max(...sparklineData)}
      >
        <defs>
          <linearGradient id="fillColor" gradientTransform="rotate(90)">
            <stop offset="0%" stopColor="#007ACC" />
            <stop
              offset="99.99%"
              stopColor="rgb(0, 122, 204)"
              stopOpacity="0"
            />
            <stop
              offset="100%"
              stopColor="rgb(0, 122, 204)"
              stopOpacity="0.2"
            />
          </linearGradient>
        </defs>

        <SparklinesLine
          style={{
            strokeWidth: 3,
            fillOpacity: 0.5,
            fill: 'url(#fillColor)',
            stroke: 'red',
          }}
          color="#007ACC"
        />
      </Sparklines>
    </div>
  );
}
