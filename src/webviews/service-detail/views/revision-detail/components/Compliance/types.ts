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
  Analyses,
  Summary,
  AffectedItem,
  APIServiceSpec,
  APIService,
} from '../../../../../../types';

export type { Analyses, Summary, AffectedItem };

export type ListParams = {
  page?: number;
  pageSize?: number;
  analyzer?: string;
  hostId?: number;
};

export type ListProps = {
  loading: boolean;
  hostId?: number;
  data: {
    list: Analyses[];
    summary: Summary;
    service?: APIService;
    spec: APIServiceSpec;
  };
};
