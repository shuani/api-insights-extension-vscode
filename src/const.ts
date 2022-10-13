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

export const BASE_NAME = 'API Insights';
export const SEVERITY = ['error', 'warning', 'info', 'hint'];
export const DRIFT = 'drift';

export const CONFIG_KEY_SPEC_FORMAT = `${BASE_NAME}.specFormat`;
export const CONFIG_KEY_ENDPOINT_URL = `${BASE_NAME}.endpointURL`;
export const CONFIG_KEY_AUTH_TYPE = `${BASE_NAME}.auth.type`;
export const CONFIG_KEY_AUTH_TOKEN = `${BASE_NAME}.auth.token`;
export const CONFIG_KEY_AUTH_OAUTH = `${BASE_NAME}.auth.OAuth`;

export enum AuthTypes {
  None = 'None',
  Token = 'Token',
  OAuth = 'OAuth',
}

export enum DiffSummaryChangeType {
  open,
  save,
}

export const MEM_CACHE = 'MEM_CACHE';
export const UPLOAD_MEM_CACHE = 'UPLOAD_MEM_CACHE';

export const TIMEOUT_MS = 120 * 1000;
export const DEFAULT_POSITION = { line: 0, character: 0 };

export default {};
