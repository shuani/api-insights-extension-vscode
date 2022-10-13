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
  Disposable,
  Event,
  EventEmitter,
  FileChangeEvent,
  FileSystemError,
  FileSystemProvider,
  FileType,
  Uri,
  workspace,
  ExtensionContext,
  FileStat,
} from 'vscode';

import { getStoreSpecById } from '../store';
import { FILE_SCHEME, FileQuery } from '../../types';
import { stringToUint8Array } from '../util';
import { fetchSingleSpec } from '../services';

const emptyArray = new Uint8Array(0);
export const markdownMessage = new Map();

export class RemoteSpecFileSystemProvider implements FileSystemProvider {
  private _onDidChangeFile = new EventEmitter<FileChangeEvent[]>();

  get onDidChangeFile(): Event<FileChangeEvent[]> {
    return this._onDidChangeFile.event;
  }

  copy?(): void | Thenable<void> {
    throw FileSystemError.NoPermissions;
  }

  createDirectory(): void | Thenable<void> {
    throw FileSystemError.NoPermissions;
  }

  delete(): void | Thenable<void> {
    throw FileSystemError.NoPermissions;
  }

  rename(): void | Thenable<void> {
    throw FileSystemError.NoPermissions;
  }

  async stat(uri: Uri): Promise<FileStat> {
    // TODO
    return {
      type: FileType.File,
      size: 99999,
      ctime: 0,
      mtime: 0,
    };
  }

  async readFile(uri: Uri): Promise<Uint8Array> {
    const { query, path } = uri;
    const fullPath = uri.with({ scheme: 'file' }).toString();

    if (path.endsWith('.markdown') || path.endsWith('.md')) {
      const message = markdownMessage.get(fullPath);
      if (message) {
        return stringToUint8Array(message);
      }
      return emptyArray;
    }
    const queryObj = query.split('&').reduce((o, q) => {
      const d = q.split('=');
      return { ...o, [d[0]]: d[1] };
    }, {}) as FileQuery;

    const { specId, serviceId } = queryObj;

    let data = getStoreSpecById(specId, serviceId);
    if (!data || !data.doc) {
      data = await fetchSingleSpec(specId, serviceId);
    }
    if (data) {
      return stringToUint8Array(data.doc);
    }
    return emptyArray;
  }

  async readDirectory(uri: Uri): Promise<any> {
    return Promise.resolve();
  }

  watch(): Disposable {
    return {
      dispose: () => {
        // nothing to dispose
      },
    };
  }

  writeFile(uri: Uri): void | Thenable<void> {
    console.log('writeFile--🌹', uri);
  }
}

export default function fsProvider(context: ExtensionContext) {
  const myFs = new RemoteSpecFileSystemProvider();
  context.subscriptions.push(
    workspace.registerFileSystemProvider(FILE_SCHEME.edit, myFs),
    workspace.registerFileSystemProvider(FILE_SCHEME.read, myFs, {
      isReadonly: true,
    }),
  );
}
