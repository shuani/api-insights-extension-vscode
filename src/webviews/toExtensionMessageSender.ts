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

import { AxiosRequestConfig } from 'axios';
import {
  DEFAULT_MSG_TYPES,
  ID_GETTER,
  promisifyPostMessage,
  SIDEBAR_MSG_TYPES,
  WebviewVsc,
} from '../common';
import { APIService } from '../types';

export function postOpenNativeSettingMessageToExtension(
  webview: WebviewVsc,
  from?: string,
) {
  webview.postMessage({
    type: DEFAULT_MSG_TYPES.OPEN_NATIVE_SETTING,
    id: ID_GETTER(),
    data: from,
  });
}

export function postOpenAPIServicePanelMessageToExtension(
  webview: WebviewVsc,
  apiService: APIService,
) {
  webview.postMessage({
    type: SIDEBAR_MSG_TYPES.OPEN_API_SERVICE_PANEL,
    id: ID_GETTER(),
    data: apiService,
  });
}

export function postVSCodeCommandExecuteMsgToExtension(
  webview: WebviewVsc,
  command: string,
  args: any[],
  namespace?: string,
) {
  return promisifyPostMessage(
    webview,
    DEFAULT_MSG_TYPES.EXECUTE_VSCODE_COMMAND,
    { command, args, namespace },
    0,
  );
}
export function postGetVSCodeObjectValueMsgToExtension(
  webview: WebviewVsc,
  path: string,
) {
  return promisifyPostMessage(
    webview,
    DEFAULT_MSG_TYPES.GET_VSCODE_OBJECT_VALUE,
    path,
  );
}

export function postSendRequestMsgToExtension(
  webviewApi: WebviewVsc,
  data: AxiosRequestConfig,
) {
  return promisifyPostMessage(webviewApi, DEFAULT_MSG_TYPES.SEND_REQUEST, data);
}
