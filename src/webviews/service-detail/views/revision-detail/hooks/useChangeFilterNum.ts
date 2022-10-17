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

import * as React from 'react';

export default function useChangeFilterNum(data?: string, filterDom?: string) {
  React.useEffect(() => {
    if (!filterDom) return;
    const typesLen = data ? data.split(',').length : 0;
    function getSpecFilterDom() {
      const dom = document.querySelector(filterDom);
      return dom;
    }
    const dom = getSpecFilterDom();
    if (!dom) return;
    if (typesLen === 0) {
      dom.removeAttribute('data-filter-num');
      return;
    }
    dom.setAttribute('data-filter-num', `${typesLen}`);
  }, [data, filterDom]);
}
