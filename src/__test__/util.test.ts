import { FILE_SCHEME } from '../types';
import { getQueryFromSpecUri } from '../extension/util';

describe('util', () => {
  test('getQueryFromSpecUri transform query to obj', () => {
    const uri = {
      query: 'specId=1&serviceId=2',
      scheme: FILE_SCHEME.read,
      authority: '',
      path: '',
      fragment: '',
      fsPath: '',
      with: jest.fn(),
      toJSON: jest.fn(),
    };

    const query = expect(getQueryFromSpecUri(uri));
    query.toEqual({ specId: '1', serviceId: '2' });
  });
});

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
