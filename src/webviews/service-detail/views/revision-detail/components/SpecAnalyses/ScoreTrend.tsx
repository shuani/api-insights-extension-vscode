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

import { DualAxes, DualAxesConfig } from '@ant-design/plots';
import { useMemo } from 'react';
import { capitalize } from 'lodash';
import {
  getRevisionFullname,
  SPEC_ANALYSES_SEVERITY,
  SPEC_ANALYSES_SEVERITY_COLORS,
} from '../../../../../../common';
import { APIServiceSpec } from '../../../../../../types';
import './ScoreTrend.scss';

export type ScoreTrendProps = {
  analyses: any[];
  revisions: APIServiceSpec[];
};

export default function ScoreTrend(props: ScoreTrendProps) {
  const { analyses, revisions } = props;
  const config: DualAxesConfig = useMemo(() => {
    const _revisions = [...(revisions || [])];
    const scoreChatData = [];
    const analysesChartData = [];

    const getFindingCountBySeverityType = (revision: APIServiceSpec, type) => {
      let count = 0;
      analyses
        .filter((ana) => ana.spec_id === revision.id)
        .forEach((ana) => {
          const { stats } = ana.result.summary;
          count += (stats[type] && stats[type].count) || 0;
        });
      return count;
    };

    const revisionMap = {};
    _revisions.reverse().forEach((revision) => {
      const { id } = revision;
      revisionMap[id] = revision;
      scoreChatData.push({
        id,
        type: 'Score',
        Score: revision.score || 0,
        revision,
      });
      SPEC_ANALYSES_SEVERITY.forEach((key) => {
        analysesChartData.push({
          id,
          type: capitalize(key),
          count: getFindingCountBySeverityType(revision, key),
          revision,
        });
      });
    });

    // console.log('analysesChartData,scoreChatData', analysesChartData, scoreChatData);

    return {
      data: [scoreChatData, analysesChartData],
      xField: 'id',
      yField: ['Score', 'count'],
      renderer: 'svg',
      meta: {
        Score: {
          values: [0, 100],
        },
      },
      yAxis: {
        Score: {
          grid: {
            line: {
              style: {
                stroke: '#3A3D41',
              },
            },
          },
          position: 'right',
        },
        count: {
          position: 'left',
        },
      },
      xAxis: {
        line: {
          style: {
            stroke: '#454545',
          },
        },
        label: {
          formatter(text) {
            const revision = revisionMap[text];

            return `r${revision.revision}`;
          },
        },
      },
      legend: {
        position: 'bottom',
        // reversed: true,
        itemName: {
          style: {
            fill: '#ccc',
          },
        },
        itemHeight: 40,
        marker(name, index, item) {
          if (name === 'Score') {
            return {
              symbol: 'line',
              style: {
                stroke: '#007ACC',
                lineWidth: 10,
                r: 1,
              },
            };
          }
          return { ...item, symbol: 'square', style: { r: 5 } };
        },
      },
      tooltip: {
        title(title, datum) {
          const { revision } = datum;
          return getRevisionFullname(revision);
        },
        domStyles: {
          'g2-tooltip-marker': {
            'border-radius': '0',
            width: '10px',
            height: '10px',
          },
          'g2-tooltip-list-item': { margin: '6px 0' },
          'g2-tooltip-list': {
            'margin-top': '-4px',
            'padding-bottom': '6px',
            display: 'flex',
            'flex-direction': 'column',
          },
        },
      },
      geometryOptions: [
        {
          geometry: 'line',
          color: '#007ACC',
        },
        {
          geometry: 'column',
          isStack: true,
          seriesField: 'type',
          // @ts-ignore
          maxColumnWidth: 35,
          minColumnWidth: 10,
          color(datum, defaultColor?) {
            return SPEC_ANALYSES_SEVERITY_COLORS[
              SPEC_ANALYSES_SEVERITY.indexOf(datum.type.toLowerCase())
            ];
          },
        },
      ],
    };
  }, [analyses, revisions]);

  if (!props.analyses.length) return null;
  return (
    <div className="score-trend-chart">
      <h2>Score Trends</h2>
      <div className="chart-axis-label left-label">Findings</div>
      <DualAxes {...config} height={225} />
      <div className="chart-axis-label right-label">Score</div>
    </div>
  );
}
