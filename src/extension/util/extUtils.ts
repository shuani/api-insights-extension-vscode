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

import Axios, { AxiosPromise, AxiosRequestConfig } from 'axios';
import * as vscode from 'vscode';
import {
  AxiosCacheInstance,
  BuildStorage,
  buildStorage,
  CacheOptions,
  setupCache,
} from 'axios-cache-interceptor';
import { stringify } from 'querystring';
import { Configuration, SPEC_FORMATS } from '../../common';
import { CONFIG_KEY_AUTH_OAUTH, CONFIG_KEY_AUTH_TOKEN, CONFIG_KEY_AUTH_TYPE, CONFIG_KEY_ENDPOINT_URL, CONFIG_KEY_SPEC_FORMAT, MEM_CACHE, TIMEOUT_MS } from '../../const';

let memCache: Record<string, { date: number; value: any }> = {};

// eslint-disable-next-line import/no-mutable-exports
export let globalStorage: BuildStorage;
// eslint-disable-next-line import/no-mutable-exports
export let clearGlobalStateStorage: Function;
// eslint-disable-next-line import/no-mutable-exports
export let cleanGlobalStateStorage: (cb: () => void) => void;
function buildGlobalStateStorage(context: vscode.ExtensionContext) {
  const state = context.globalState;
  memCache = state.get(MEM_CACHE) || {};

  console.log('memCache=>', memCache);

  globalStorage = {
    remove(key) {
      delete memCache[key];
    },
    // @ts-ignore
    find(key) {
      const { value } = memCache[key] || {};
      return value;
    },
    set(key, value) {
      // console.log('set data into cache', key, value);
      memCache[key] = { date: Date.now(), value };
      // setTimeout(() => {
      //   state.update(key, value);
      //   state.update('APIxManager-cachedKeys', cachedKeysObj);
      // }, 0)
    },
  };
  clearGlobalStateStorage = () => {
    Object.keys(memCache).forEach((key) => {
      globalStorage.remove(key);
    });
  };

  cleanGlobalStateStorage = (cb: () => void) => {
    Object.keys(memCache).forEach((key) => {
      const { date } = memCache[key];
      if (Date.now() - date > TIMEOUT_MS) {
        globalStorage.remove(key);
      }
    });

    cb();
  };
  return buildStorage(globalStorage);
}

let axios: AxiosCacheInstance;
export function setupAxiosCache(context: vscode.ExtensionContext) {
  axios = setupCache(Axios.create(), {
    storage: buildGlobalStateStorage(context),
    ttl: TIMEOUT_MS,
    interpretHeader: false,
    methods: ['get'],
  });

  const cleanFn = () => setTimeout(() => cleanGlobalStateStorage(cleanFn), TIMEOUT_MS);
  cleanGlobalStateStorage(cleanFn);

  return memCache;
}

export function getConfiguration(): Configuration {
  const cfg = vscode.workspace.getConfiguration();
  const endpoint = cfg.get(CONFIG_KEY_ENDPOINT_URL) as string;

  const authType = cfg.get(CONFIG_KEY_AUTH_TYPE) as string;

  const tokenObject = cfg.get(CONFIG_KEY_AUTH_TOKEN);
  const oauthObject = cfg.get(CONFIG_KEY_AUTH_OAUTH);

  // auth type = token
  // @ts-ignore
  const tokenType = tokenObject['Token Type'];
  // @ts-ignore
  const tokenValue = tokenObject['Token Value'];

  // auth type = oauth
  // @ts-ignore
  const tokenURL = oauthObject['Token URL'];
  // @ts-ignore
  const clientID = oauthObject['Client ID'];
  // @ts-ignore
  const clientSecret = oauthObject['Client Secret'];

  const format = cfg.get(CONFIG_KEY_SPEC_FORMAT) as SPEC_FORMATS;
  const config = {
    endpoint,
    authType,
    tokenType,
    tokenValue,
    tokenURL,
    clientID,
    clientSecret,
    format,
  } as Configuration;
  Object.keys(config).forEach((key) => {
    // @ts-ignore
    const value = config[key];
    if (value) {
      // @ts-ignore
      config[key] = value.trim();
    }
  });
  return config;
}

export async function openSetting(
  keywords = '@ext:CiscoDeveloper.api-insights', /* "API Insights" for dev */
) {
  vscode.commands.executeCommand('workbench.action.openSettings', keywords);
}

export function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
function getOAuthAccessToken(
  tokenURL: string,
  clientID: string,
  clientSecret: string,
  useCache = true,
) {
  const key = tokenURL + clientID + clientSecret;
  // @ts-ignore
  let accessTokenStr = globalStorage && (globalStorage.find(key) as string);
  const [token_type, access_token, expireTime] = (accessTokenStr || '').split(
    '|',
  );
  if (
    useCache
    && accessTokenStr
    && expireTime
    && parseInt(expireTime, 10) >= Date.now()
  ) {
    return Promise.resolve({
      access_token,
      token_type,
    });
  }
  // fetch new access token
  return Axios.post(
    tokenURL,
    stringify({
      grant_type: 'client_credentials',
      client_id: clientID,
      client_secret: clientSecret,
    }),
    {
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
    },
  ).then((r) => {
    const { access_token: accessToken, token_type: tokenType, expires_in: expiresIn } = r.data;

    accessTokenStr = [
      tokenType,
      accessToken,
      `${new Date(Date.now() + (expiresIn / 2) * 1000).getTime()}`,
    ].join('|');

    // @ts-ignore
    if (globalStorage) { globalStorage.set(key, accessTokenStr); }

    return r.data;
  });
}
export function doAjax(
  config: AxiosRequestConfig & {
    cache?: CacheOptions | false;
    showErrorIfAny?: boolean;
  },
) {
  const cfg = getConfiguration();
  const {
    endpoint,
    authType,
    tokenURL,
    clientID,
    clientSecret,
    tokenType,
    tokenValue,
  } = cfg;
  const { url } = config;
  if (url && url[0] === '/') {
    config.url = endpoint + url;
  }
  config.headers = config.headers || {};
  config.headers['Accept-Encoding'] = 'gzip, deflate, br';
  config.timeout = TIMEOUT_MS;

  let promise: Promise<any> | AxiosPromise<any> | null = null;

  // auth type:token
  if (endpoint && url) {
    switch (authType) {
      case 'Token':
        if (
          tokenValue
          && (!config.headers || !config.headers.Authorization)
        ) {
          config.headers.Authorization = `${tokenType ? `${tokenType} ` : ''}${tokenValue}`;
        }
        break;
      case 'OAuth':
        if (tokenURL && clientID && clientSecret) {
          promise = getOAuthAccessToken(
            tokenURL,
            clientID,
            clientSecret,
            config.cache !== false,
          )
            .then(({ access_token, token_type, expires_in }) => {
              // @ts-ignore
              config.headers.Authorization = `${token_type} ${access_token}`;
              // @ts-ignore
              config.headers['content-type'] = 'application/json';
            })
            .catch((e) => {
              e.message = `Could not connect to oauth endpoint${e.message ? `: ${e.message.toLowerCase()}` : ''}, please check your oauth settings`;

              return Promise.reject(e);
            });
        } else {
          // TODO throw error
        }
        break;
      default:
    }
  }

  const ajaxFn = () => axios(config);

  const resp = promise ? promise.then(ajaxFn) : ajaxFn();
  resp.catch((e) => {
    console.log(config, 'do ajax error=>', e);
    if (config.showErrorIfAny !== false) {
      if (e.message !== 'canceled') {
        const isOAuthError = e.message.indexOf('oauth') > -1;
        const message = isOAuthError
          ? e.message
          : `Request api service error${e.message ? (`: ${e.message}`).toLowerCase() : ''}`;
        vscode.window.showErrorMessage(message, 'Check Settings').then((r) => {
          if (r === 'Check Settings') {
            openSetting();
          }
        });
      }
    }
    return Promise.reject(e);
  });

  return resp;
}

export async function checkConfiguration() {
  let ok = true;
  let error: any;
  try {
    await doAjax({
      url: '/services',
      cache: false,
      showErrorIfAny: false,
    }).catch((e) => {
      ok = false;
      error = e;
    });
  } catch (e) {
    ok = false;
    error = e;
  }
  return [ok, error];
}

// export async function openSpecFile(
//   filepath: string,
//   findPathDefWith?: string,
//   position?: { line: number; character: number },
// ) {
//   return vscode.workspace.openTextDocument(filepath).then((doc) => {
//     const showDoc = () => vscode.window.showTextDocument(
//       doc,
//       vscode.window.activeTextEditor
//         ? vscode.window.activeTextEditor.viewColumn
//         : vscode.ViewColumn.One,
//       false,
//     );
//     return new Promise((resolve, reject) => {
//       if (!findPathDefWith) {
//         return showDoc().then(() => {
//           resolve(doc);
//         });
//       }

//       // Go to Definition
//       const text = doc.getText();

//       if (position) {
//         const pos = new vscode.Position(position.line, position.character);
//         return showDoc().then((r) => {
//           // set active postion
//           r.selection = new vscode.Selection(pos, pos);
//           r.revealRange(new vscode.Range(pos, pos));

//           resolve(doc);
//         });
//       }

//       // Go to Definition
//       const { languageId } = doc;
//       let obj;
//       if (languageId === 'yaml') {
//         obj = loadYml(text) as any;
//       } else if (languageId === 'json') {
//         obj = JSON.parse(text);
//       } else {
//         const error = `ERROR: ${doc.fileName} is not either a json or yaml file`;
//         vscode.window.showErrorMessage(error);
//         reject(error);
//       }

//       let pathDef;
//       // for (const path in obj.paths || {}) {
//       Object.keys(obj.paths || {}).forEach((path) => {
//         const re = new RegExp(path.replace(/\{[^\}]*?}/, '.*?'));
//         if (findPathDefWith?.match(re)) {
//           if (!pathDef || pathDef.length < path.length) {
//             pathDef = path;
//           }
//           continue;
//         }
//       });

//       if (pathDef) {
//         const findIdx = text.indexOf(pathDef);

//         if (findIdx > -1) {
//           const pos = doc.positionAt(findIdx);
//           return showDoc().then((r) => {
//             ``;
//             // set active postion
//             r.selection = new vscode.Selection(pos, pos);
//             r.revealRange(new vscode.Range(pos, pos));

//             resolve(doc);
//           });
//         }
//       }
//     });
//   });
// }
