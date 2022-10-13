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

import * as vscode from 'vscode';
import {
  ExtensionContext, commands, Uri, workspace,
} from 'vscode';
import { getLocationForJsonPath, parseWithPointers } from '@stoplight/json';
import {
  APIServiceSpec,
  Position,
  LocalSpec,
  FILE_SCHEME,
  SpecType,
} from '../../types';
import { getUriBySpec, debounce } from '../util';
import { DiffSummaryChangeType } from '../../const';
import {
  DIFF_COMMAND,
  LOCAL_DIFF_COMMAND,
  GO_TO_DEFINITION_COMMAND,
  EDIT_FILE_COMMAND,
  VIEW_CHANGELOG_COMMAND,
  READ_COMMAND,
  EDIT_COMMAND,
} from '../../commands';
import { fileManager } from '../fileViewer';
import { markdownMessage } from '../fileViewer/fsProvider';
import { DiffSummaryProvider } from '../webviewPanelProviders/diffSummary';

function update(
  oldSpec: APIServiceSpec | Uri,
  newSpec: APIServiceSpec | Uri,
  changeType: DiffSummaryChangeType,
) {
  DiffSummaryProvider.update({ newSpec, oldSpec, changeType });
}

const debounceUpdate = debounce(update, 2000);

async function specDiffCommand(
  left: APIServiceSpec | Uri,
  right: APIServiceSpec | Uri,
  position?: Position,
  reload?: boolean,
) {
  const leftUri = left instanceof Uri ? left : getUriBySpec(left);
  let rightUri = right instanceof Uri ? right : getUriBySpec(right);

  if (rightUri) {
    const activeTab = fileManager.getActiveTab(
      rightUri.with({ scheme: FILE_SCHEME.read }),
      rightUri.with({ scheme: FILE_SCHEME.edit }),
    );
    if (activeTab) {
      rightUri = activeTab?.document?.uri;
      if (rightUri) {
        right = rightUri;
      }
    }
  }

  const _leftName = leftUri?.path?.match(/\/([^/]*?)$/);
  const _rightName = rightUri?.path?.match(/\/([^/]*?)$/);

  const leftName = _leftName ? _leftName[1] : leftUri?.path;
  const rightName = _rightName ? _rightName[1] : rightUri?.path;
  const pos = position
    ? new vscode.Position(position.line, position.character)
    : new vscode.Position(0, 0);

  const updateData = reload !== false
    ? {
      oldSpec: left,
      newSpec: right,
      changeType: DiffSummaryChangeType.open,
    }
    : undefined;

  commands.executeCommand(
    'vscode.diff',
    leftUri,
    rightUri,
    `${leftName} <-> ${rightName}`,
    {
      selection: new vscode.Range(pos, pos),
    },
  );
  DiffSummaryProvider.update(updateData);
}

async function specDiffWithLocalCommand(spec: APIServiceSpec, localUri?: Uri) {
  if (localUri) {
    await specDiffCommand(spec, localUri);
    return;
  }
  const uri = await vscode.window.showOpenDialog();
  if (uri && uri[0]) {
    await specDiffCommand(spec, uri[0]);
  }
}

async function goToDefinitionWhenSpecDiffCommand(
  oldSpec: APIServiceSpec,
  newSpec: APIServiceSpec | LocalSpec,
  paths: string[],
) {
  let text = '';
  let newSpecUri;
  if ('path' in newSpec) {
    const doc = await vscode.workspace.openTextDocument(newSpec.path);
    text = doc.getText();
    newSpecUri = doc.uri;
  } else {
    const uri = getUriBySpec(newSpec);
    if (uri) {
      const doc = await vscode.workspace.openTextDocument(uri);
      text = doc.getText();
    }
    newSpecUri = newSpec;
  }
  const res = parseWithPointers(text);
  const position = getLocationForJsonPath(res, paths);

  if (position) {
    const { range } = position;
    specDiffCommand(oldSpec, newSpecUri, range.start, false);
  }
}

async function editFileWhenSpecDiffCommand(uri: Uri) {
  // @ts-ignore
  const tabArray = vscode.window.tabGroups.all;
  tabArray.forEach(async (tab: any) => {
    const { activeTab } = tab;
    if (!activeTab || !activeTab.input) return;
    const { input } = activeTab;
    const { label } = activeTab;
    const { original, modified } = input;

    const _modified = modified.with({
      scheme: FILE_SCHEME.edit,
    });

    await commands.executeCommand(EDIT_COMMAND, uri, false);
    await commands.executeCommand('workbench.action.closeActiveEditor');
    await commands.executeCommand('vscode.diff', original, _modified, label);
  });
}

async function viewChangelogCommand(
  oldSpec: SpecType,
  newSpec: SpecType,
  log: string,
  subpath: string,
) {
  let logPath = '';
  let id = '';
  if (!('path' in oldSpec) && !('path' in newSpec)) {
    const { service_name, version, revision } = newSpec;
    logPath = `ChangeLog(${service_name} ${oldSpec.version}-r${
      oldSpec.revision
    } - ${version}-r${revision} ${subpath || ''}).md`;
    id = `${oldSpec.id},${newSpec.id}`;
  } else if (!('path' in oldSpec) && 'path' in newSpec) {
    const { path } = newSpec;
    const { service_name, version, revision } = oldSpec;
    logPath = `ChangeLog(${service_name} ${version}-r${revision} - ${
      path.match(/\/([^/]*?)$/)![1]
    } ${subpath || ''}).md`;
    id = `${oldSpec.id},${newSpec.path}`;
  }
  if (!logPath) return;

  const uri = Uri.file(logPath).with({
    scheme: FILE_SCHEME.read,
    query: `subpath=${subpath}&id=${id}`,
  });
  markdownMessage.set(uri.with({ scheme: 'file' }).toString(), log);
  await commands.executeCommand(READ_COMMAND, uri);
}

export default function register(context: ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(DIFF_COMMAND, specDiffCommand),
    vscode.commands.registerCommand(
      LOCAL_DIFF_COMMAND,
      specDiffWithLocalCommand,
    ),
    vscode.commands.registerCommand(
      GO_TO_DEFINITION_COMMAND,
      goToDefinitionWhenSpecDiffCommand,
    ),
    vscode.commands.registerCommand(
      EDIT_FILE_COMMAND,
      editFileWhenSpecDiffCommand,
    ),
    vscode.commands.registerCommand(
      VIEW_CHANGELOG_COMMAND,
      viewChangelogCommand,
    ),
    workspace.onDidSaveTextDocument((document) => {
      if (document) {
        // @ts-ignore
        const tabArray = vscode.window.tabGroups.all;
        tabArray.forEach(async (tab: any) => {
          const { activeTab } = tab;
          if (!activeTab || !activeTab.input) return;
          const { input } = activeTab;
          const { original, modified, uri } = input;
          if (uri || !original || !modified) return;
          if (original.scheme === FILE_SCHEME.read) {
            debounceUpdate(original, modified, DiffSummaryChangeType.save);
          }
        });
      }
    }),
  );
}
