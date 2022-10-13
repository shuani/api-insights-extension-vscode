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
  Uri,
  Diagnostic,
  StatusBarItem,
  StatusBarAlignment,
  window,
  ExtensionContext,
  languages,
  Hover,
} from 'vscode';
import {
  Analyses, APIServiceSpec, FILE_SCHEME,
} from '../../types';
import { getUriBySpec } from '../util';
import { fileManager } from '../fileViewer';
import { ADD_FILE_DIAGNOSTIC_COMMAND, CLEAN_DIAGNOSTICS_COMMAND, OPEN_FILE_DIAGNOSTIC_COMMAND, UPDATE_BAR_STATUS_COMMAND, UPDATE_FILE_DIAGNOSTIC_COLLECTION_COMMAND } from '../../commands';
import { BASE_NAME } from '../../const';

const name = `${BASE_NAME} File Collection`;

enum SeverityTypes {
  error = 'Error',
  warning = 'Warning',
  info = 'Information',
  hint = 'Hint',
}

export class FileDiagnostics {
  public analysesMap: { [key: string]: [string, Analyses[]] } = {};

  barStatusItem: StatusBarItem;

  constructor(
    private readonly collection: vscode.DiagnosticCollection,
    context: ExtensionContext,
  ) {
    this.barStatusItem = window.createStatusBarItem(
      StatusBarAlignment.Left,
      999,
    );
    context.subscriptions.push(this.barStatusItem);
  }

  public updateDiagnostics(
    uri: vscode.Uri,
    analyses: Analyses[],
    score: string,
    reuse?: boolean,
  ): void {
    if (reuse) {
      const activeTab = fileManager.getActiveTab(
        uri.with({ scheme: FILE_SCHEME.read }),
        uri.with({ scheme: FILE_SCHEME.edit }),
      );
      if (activeTab) {
        uri = activeTab?.document?.uri;
      }
    }
    this.analysesMap[uri.path] = [score, analyses];
    this.collection.delete(uri);
    if (uri) {
      this.collection.set(uri, FileDiagnostics.createCollection(uri, analyses));
      const editor = window.activeTextEditor;
      if (editor?.document.uri.toString() === uri.toString()) {
        this.setStatus(
          `API Score: ${score}`,
          `${uri.path.split('/').slice(-1)[0]}`,
        );
      }
    }
  }

  public openDiagnostics(uri: vscode.Uri): [string, Analyses[]] | null {
    const analyses = this.analysesMap[uri.path];
    if (analyses) {
      this.updateDiagnostics(uri, analyses[1], analyses[0], true);
      return analyses;
    }
    return null;
  }

  public cleanDiagnostics(uri: vscode.Uri) {
    const key = uri.path;
    delete this.analysesMap[key];
    this.collection.delete(uri);
  }

  public updateCollection(uri: vscode.Uri, oldUri: vscode.Uri) {
    const analyses = this.analysesMap[uri.path];
    if (analyses) {
      this.collection.delete(oldUri);
      this.updateDiagnostics(uri, analyses[1], analyses[0]);
    }
  }

  static createCollection(uri: vscode.Uri, analyses: Analyses[]) {
    const diagnostic: Diagnostic[] = [];
    analyses.forEach((analyse) => {
      const {
        data, mitigation, severity, ruleKey,
      } = analyse;
      let { message } = analyse;
      message = message ? message.replace(/\n/g, '') : '';
      let _message = '';
      if (mitigation && message) {
        _message = message;
      } else {
        _message = message || (mitigation && mitigation.replace(/\n/g, ''));
      }
      data.forEach((item) => {
        const { range } = item;
        const { start, end } = range || {};
        const { line: startLine, column: startColumn } = start || {};
        const { line: endLine, column: endColumn } = end || {};
        const vscodeRange = new vscode.Range(
          new vscode.Position(
            Math.max((startLine || 1) - 1, 0),
            Math.max(startColumn, 0),
          ),
          new vscode.Position(
            Math.max((endLine || 1) - 1, 0),
            Math.max(endColumn, 0),
          ),
        );

        diagnostic.push({
          code: `${BASE_NAME} - ${ruleKey}`,
          message: _message,
          range: vscodeRange,
          severity: vscode.DiagnosticSeverity[SeverityTypes[severity]],
          // @ts-ignore
          line: range?.start?.line,
        });
      });
    });

    // @ts-ignore
    return diagnostic.sort((a, b) => a.line - b.line);
  }

  public setStatus(text: string, tooltip?: string) {
    this.barStatusItem.text = text;
    this.barStatusItem.tooltip = tooltip;
    if (!text) {
      this.barStatusItem.hide();
    } else {
      this.barStatusItem.show();
    }
  }
}

// eslint-disable-next-line import/no-mutable-exports
export let fileDiagnostics:FileDiagnostics;
export function register(context: vscode.ExtensionContext) {
  const collection = languages.createDiagnosticCollection(name);
  fileDiagnostics = new FileDiagnostics(collection, context);

  function addFileDiagnosticCommand() {
    return function addFileDiagnostic(
      spec: APIServiceSpec | Uri,
      analyses: Analyses | Analyses[],
      score: string,
      reuse?: boolean,
    ) {
      let uri;
      if (!(spec instanceof Uri)) {
        uri = getUriBySpec(spec);
      } else {
        uri = spec;
      }
      if (!Array.isArray(analyses)) {
        analyses = [analyses];
      }
      if (!uri) return;
      fileDiagnostics.updateDiagnostics(uri, analyses, score, reuse);
    };
  }

  context.subscriptions.push(
    vscode.commands.registerCommand(
      ADD_FILE_DIAGNOSTIC_COMMAND,
      addFileDiagnosticCommand(),
    ),
    vscode.commands.registerCommand(
      OPEN_FILE_DIAGNOSTIC_COMMAND,
      fileDiagnostics.openDiagnostics.bind(fileDiagnostics),
    ),
    vscode.commands.registerCommand(
      UPDATE_FILE_DIAGNOSTIC_COLLECTION_COMMAND,
      fileDiagnostics.updateCollection.bind(fileDiagnostics),
    ),
    vscode.commands.registerCommand(
      CLEAN_DIAGNOSTICS_COMMAND,
      fileDiagnostics.cleanDiagnostics.bind(fileDiagnostics),
    ),
    vscode.commands.registerCommand(
      UPDATE_BAR_STATUS_COMMAND,
      fileDiagnostics.setStatus.bind(fileDiagnostics),
    ),
  );

  context.subscriptions.push(
    languages.registerHoverProvider('json', {
      provideHover(document, position, token) {
        const { uri } = document;
        const analysesMap = fileDiagnostics.analysesMap[uri.path];
        const mitigations: any[] = [];
        if (analysesMap) {
          const analyses = analysesMap[1];
          for (let i = 0; i < analyses.length; i += 1) {
            const { data, mitigation } = analyses[i];
            for (let j = 0; j < data.length; j += 1) {
              const { range } = data[j];
              const { start, end } = range;
              if (
                start.line - 1 === position.line
                && end.column === start.column
                && (position.character >= start.column
                  || position.character - 1 >= start.column
                  || position.character + 1 >= start.column)
              ) {
                if (mitigation) {
                  mitigations.push(mitigation);
                }
              }

              if (
                start.line - 1 === position.line
                && end.column > start.column
                && position.character >= start.column
                && position.character <= end.column
              ) {
                if (mitigation) {
                  mitigations.push(mitigation);
                }
              }
            }
          }
          if (mitigations.length > 0) {
            return new Hover(mitigations);
          }
        }
        return null;
      },
    }),
  );
}
