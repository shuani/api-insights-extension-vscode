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
import jsonFormat from 'json-format';
import yaml from 'js-yaml';
import { CacheOptions } from 'axios-cache-interceptor';
import {
  Analyses, Position,
  APIService,
  APIServiceSpec,
  LocalSpec,
  SpecType,
} from '../types';
import { transformAnalysesToProblems } from '../util';
import {
  postVSCodeCommandExecuteMsgToExtension,
} from './toExtensionMessageSender';
import {
  API_SERVICE_MST_TYPES,
  DEFAULT_MSG_TYPES,
  promisifyPostMessage,
  transformYamlObjToJson,
} from '../common';
import { ADD_FILE_DIAGNOSTIC_COMMAND, DIFF_COMMAND, GO_TO_DEFINITION_COMMAND, LOCAL_DIFF_COMMAND, READ_COMMAND, SAVE_ON_LOCAL_COMMAND, VIEW_CHANGELOG_COMMAND } from '../commands';

export function sendRemoteRequest(
  webview: WebviewVsc,
  params: AxiosRequestConfig & {
    cache?: CacheOptions | false;
    showErrorIfAny?: boolean;
  },
) {
  console.log('sending remote request', params);
  return promisifyPostMessage(
    webview,
    DEFAULT_MSG_TYPES.SEND_REQUEST,
    params,
  ).then((r) => {
    console.log('response from remote request', r);
    return r;
  });
}

export function fetchSpecs(
  webview: WebviewVsc,
  apiServiceId: APIService['id'],
) {
  return sendRemoteRequest(webview, {
    url: `/services/${apiServiceId}/specs`,
  });
}

export function fetchServices(
  webview: WebviewVsc,
  config: Parameters<typeof sendRemoteRequest>[1],
) {
  return sendRemoteRequest(webview, { url: '/services', ...config });
}

export function fetchOrganizations(
  webview: WebviewVsc,
  config: Parameters<typeof sendRemoteRequest>[1],
) {
  return sendRemoteRequest(webview, { url: '/organizations', ...config });
}

export function fetchSpecsAnalyses(
  webview: WebviewVsc,
  apiServiceId: APIService['id'],
) {
  return sendRemoteRequest(webview, {
    url: `/services/${apiServiceId}/specs/analyses?withFindings=true`,
  });
}

export async function copyToClipboard(str: string, format = 'json') {
  let content = str;
  if (format === 'json') {
    const doc = yaml.load(str);
    const obj = transformYamlObjToJson(doc);
    content = jsonFormat(obj, { type: 'space' });
    content = content.substring(1, content.length - 1);
  }
  await postVSCodeCommandExecuteMsgToExtension(
    webviewVsc,
    'clipboard.writeText',
    [content],
    'env',
  );
}

export function getSpecsAnalyses(specId: string, serviceId: string) {
  return promisifyPostMessage(
    webviewVsc,
    API_SERVICE_MST_TYPES.GET_SPECS_ANALYSES,
    [specId, serviceId],
  ).then((r) => r);
}

export async function openFile(
  spec: APIServiceSpec | string,
  position?: string | Position,
) {
  try {
    await postVSCodeCommandExecuteMsgToExtension(
      webviewVsc,
      'executeCommand',
      [READ_COMMAND, spec, position],
      'commands',
    );
  } catch (err) {
    console.log('openFile err', err);
  }
}

export async function openInEditorWithProblems(
  spec: APIServiceSpec,
  position: string | Position,
  analyses: Analyses | Analyses[],
  score: number,
  showFile?: boolean,
) {
  try {
    await Promise.all([
      showFile !== false ? openFile(spec, position) : Promise.resolve(null),
      postVSCodeCommandExecuteMsgToExtension(
        webviewVsc,
        'executeCommand',
        [ADD_FILE_DIAGNOSTIC_COMMAND, spec, analyses, score, true],
        'commands',
      ),
    ]);
  } catch (err) {
    // debugger;
    console.error('err', err);
  }
}

export async function openInEditorWithAnalyses(
  spec: APIServiceSpec,
  position: string | Position,
  analyses: any[],
  score: number,
  openFile?: boolean,
) {
  const problems = transformAnalysesToProblems(analyses);
  await openInEditorWithProblems(spec, position, problems, score, openFile);
}

export async function downloadFile(spec: APIServiceSpec) {
  try {
    await postVSCodeCommandExecuteMsgToExtension(
      webviewVsc,
      'executeCommand',
      [SAVE_ON_LOCAL_COMMAND, spec],
      'commands',
    );
  } catch (err) {
    console.log('Download File err', err);
  }
}

export function specDiff(
  left: APIServiceSpec,
  right: APIServiceSpec,
  analyses?: any[],
) {
  try {
    postVSCodeCommandExecuteMsgToExtension(
      webviewVsc,
      'executeCommand',
      [DIFF_COMMAND, left, right],
      'commands',
    );
    if (analyses) {
      openInEditorWithAnalyses(
        right,
        { line: 0, character: 0 },
        analyses,
        right.score,
        false,
      );
    }
  } catch (err) {
    console.log('Spec Diff err', err);
  }
}

export async function specDiffWithLocal(spec: APIServiceSpec) {
  try {
    await postVSCodeCommandExecuteMsgToExtension(
      webviewVsc,
      'executeCommand',
      [LOCAL_DIFF_COMMAND, spec],
      'commands',
    );
  } catch (err) {
    console.log('Spec Diff With Local err', err);
  }
}

export async function goToDefinitionWhenSpecDiff(
  oldSpec: APIServiceSpec | LocalSpec,
  neSpec: APIServiceSpec | LocalSpec,
  path: string[],
) {
  await postVSCodeCommandExecuteMsgToExtension(
    webviewVsc,
    'executeCommand',
    [GO_TO_DEFINITION_COMMAND, oldSpec, neSpec, path],
    'commands',
  );
}

export async function viewChangelog(
  oldSpec: SpecType,
  newSpec: SpecType,
  log: string,
  subpath?: string,
) {
  await postVSCodeCommandExecuteMsgToExtension(
    webviewVsc,
    'executeCommand',
    [VIEW_CHANGELOG_COMMAND, oldSpec, newSpec, log, subpath],
    'commands',
  );
}

export function getScoreLevel(score: number) {
  let scoreLevel = 'l0';
  if (score >= 80 && score <= 89) {
    scoreLevel = 'l1';
  } else if (score >= 70 && score <= 79) {
    scoreLevel = 'l2';
  } else if (score >= 60 && score <= 69) {
    scoreLevel = 'l3';
  } else if (score < 60) {
    scoreLevel = 'l4';
  }
  return scoreLevel;
}
