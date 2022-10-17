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

/* eslint-disable no-undef */

const languages = {
  createDiagnosticCollection: jest.fn(),
};

const StatusBarAlignment = {};

const window = {
  createStatusBarItem: jest.fn(() => ({
    show: jest.fn(),
  })),
  showErrorMessage: jest.fn(),
  showWarningMessage: jest.fn(),
  createTextEditorDecorationType: jest.fn(),
};

const workspace = {
  getConfiguration: jest.fn(),
  workspaceFolders: [],
  onDidSaveTextDocument: jest.fn(),
  onDidChangeConfiguration: jest.fn(),
};

const configurationValue = {
  get: jest.fn(),
};
configurationValue.get.mockImplementation((name) => {
  if (name === 'API Insights.endpointURL') {
    return 'https://devnet-testing.cisco.com/v1/apiregistry';
  }
  if (name === 'API Insights.auth.type') {
    return 'OAuth';
  }

  if (name === 'API Insights.auth.token') {
    return {
      'Token Type': '',
      'Token Value': '',
    };
  }

  if (name === 'API Insights.auth.OAuth') {
    return {
      'Token URL': '',
      'Client ID': '',
      'Client Secret': '',
    };
  }
});

workspace.getConfiguration.mockReturnValue(configurationValue);

const OverviewRulerLane = {
  Left: null,
};

const Uri = {
  file: (p) => {
    const uri = {
      query: 'a=1&b=2',
      scheme: 'file',
      authority: '',
      path: p,
      fragment: '',
      fsPath: '',
    };
    return uri;
  },
  parse: jest.fn(),
};
const Range = jest.fn();
const Diagnostic = jest.fn();
const DiagnosticSeverity = {
  Error: 0, Warning: 1, Information: 2, Hint: 3,
};

const commands = {
  executeCommand: jest.fn(),
};

const vscode = {
  languages,
  StatusBarAlignment,
  window,
  workspace,
  OverviewRulerLane,
  Uri,
  Range,
  Diagnostic,
  DiagnosticSeverity,
  commands,
};

module.exports = vscode;
