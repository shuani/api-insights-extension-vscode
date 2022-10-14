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

import { useEffect, useState } from 'react';
import {
  API_SERVICE_MST_TYPES,
  DEFAULT_MSG_TYPES,
  promisifyPostMessage,
  SIDEBAR_MSG_TYPES,
  DIFF_SUMMARY_MSG_TYPES,
  WebviewMsgType,
  WebviewReqMsg,
} from '../common';

// eslint-disable-next-line max-len
const hookGen = (type: WebviewMsgType) => <T>(defaultData?: T, cb?: Function, onRelease?: Function) => {
  const [data, setData] = useState(defaultData);
  useEffect(() => {
    let cbRelease;
    const listener = (evt: MessageEvent) => {
      const message = evt.data as WebviewReqMsg;
      if (message.type === type) {
        // console.log(message.type, '====>', message.data);
        setData(message.data);
        const cbRtn = cb && cb(message.data);
        if (cbRtn && cbRtn.release) {
          cbRelease = cbRtn.release;
        }
      }
    };
    window.addEventListener('message', listener);

    return () => {
      window.removeEventListener('message', listener);
      if (onRelease) { onRelease(); }
      if (cbRelease) { cbRelease(); }
    };
  }, [cb]);

  return [data, setData] as const;
};

export const useConfigurationChange = hookGen(
  DEFAULT_MSG_TYPES.CONFIGURATION_CHANGED,
);
export const useConfiguration = (webviewVsc: WebviewVsc) => {
  const [data, setData] = useConfigurationChange();

  useEffect(() => {
    const promise = promisifyPostMessage(
      webviewVsc,
      DEFAULT_MSG_TYPES.GET_EXTENSION_CONFIG,
    );
    promise.then((res) => {
      console.log('cfg', res);
      const { data } = res;
      setData(data);
    });

    // @ts-ignore
    return promise.release;
  }, []);

  return data;
};

export const useCurrentAPIService = hookGen(API_SERVICE_MST_TYPES.API_SERVICE_CHANGED);

export const useRecieveReloadMsg = hookGen(SIDEBAR_MSG_TYPES.RELOAD);

export const useDiffSummaryUpdateMsg = hookGen(DIFF_SUMMARY_MSG_TYPES.UPDATE);

export const useUploadHistoryUpdateMsg = hookGen(
  DEFAULT_MSG_TYPES.UPLOAD_HISTORY_UPDATE,
);
