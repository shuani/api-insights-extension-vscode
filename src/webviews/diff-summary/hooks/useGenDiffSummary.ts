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

const DIFF_TYPE = ['added', 'deleted', 'modified', 'deprecated'];

export default function useGenData(originData: any, filterByBreaking: boolean) {
  const data = useMemo(() => {
    const diffArr = [];
    const result = originData?.result?.json;
    let totalBreaking = 0;
    if (result) {
      DIFF_TYPE.forEach((type) => {
        if (result[type]) {
          const value = result[type];

          const breakingItems = value.filter((_) => _.breaking);
          const breakingNum = breakingItems.length;
          const hasBreaking = breakingNum > 0;
          totalBreaking += breakingNum;

          if (filterByBreaking) {
            if (hasBreaking) {
              diffArr.unshift([type, breakingItems, breakingNum]);
            }
            return;
          }
          if (hasBreaking) {
            diffArr.unshift([type, value, breakingNum]);
          } else {
            diffArr.push([type, value, breakingNum]);
          }
        }
      });
    }
    return { data: diffArr, totalBreaking };
  }, [originData, filterByBreaking]);

  return data;
}
