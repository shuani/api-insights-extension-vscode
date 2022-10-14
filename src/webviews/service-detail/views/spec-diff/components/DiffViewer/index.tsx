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

import { Tooltip } from 'antd';
import {
  useCallback, useEffect, useRef, useState,
} from 'react';
import ReactDiffViewer from 'react-diff-viewer';
import { Configuration } from '../../../../../../common';
import { useConfiguration } from '../../../../../msgListenerHooks';
import { copyToClipboard } from '../../../../../Service';
import Loader from '../../../../components/Loader';
import useVscodeTheme, {
  ThemeTypes,
} from '../../../revision-detail/hooks/useVscodeTheme';
import { APIServiceSpec } from '../../../../../../types';
import './index.scss';

type Props = {
  newSpec: string;
  oldSpec: string;
  loading?: boolean;
  spec: APIServiceSpec;
};

const defaultStyle = {
  lineNumber: {
    fontSize: 'var(--vscode-editor-font-size) !important',
  },
  contentText: {
    fontSize: 'var(--vscode-editor-font-size) !important',
  },
  diffContainer: {
    '& pre': {
      lineHeight: '18px',
    },
  },

  codeFoldGutter: {
    backgroundColor: '#f7f7f7',
  },
  codeFold: {
    backgroundColor: '#fff',
    fontSize: 'var(--vscode-editor-font-size)',
    // color:'#177ddc',
    lineHeight: '18px',
    '& a': {
      textDecoration: 'none !important',
    },
    '> td:nth-child(4)': {
      backgroundColor: '#f7f7f7',
    },
    '> td:nth-child(2):empty': {
      width: '30px',
      display: 'block',
    },
    '&:nth-child(2)': {
      '.spec-diff_code-fold-message': {
        marginTop: '-16px',
      },
    },
  },
};

const style = {
  lineNumber: {
    fontSize: 'var(--vscode-editor-font-size) !important',
  },
  contentText: {
    fontSize: 'var(--vscode-editor-font-size) !important',
  },
  diffRemoved: {
    backgroundColor: 'var(--vscode-diffEditor-removedTextBackground)',
    '&:hover': {
      backgroundColor: 'var(--vscode-diffEditor-removedTextBackground)',
    },
  },
  diffAdded: {
    backgroundColor: 'var(--vscode-diffEditor-insertedTextBackground)',
    '&:hover': {
      backgroundColor: 'var(--vscode-diffEditor-insertedTextBackground)',
    },
  },
  wordAdded: {
    backgroundColor: '#4a5632',
  },
  wordRemoved: {
    backgroundColor: '#6f1313',
  },
  diffContainer: {
    '& pre': {
      lineHeight: '18px',
    },
  },
  codeFoldGutter: {
    backgroundColor: '#2c2f3a',
  },
  codeFold: {
    backgroundColor: '#2e303c',
    fontSize: 'var(--vscode-editor-font-size)',
    color: '#177ddc',
    lineHeight: '18px',
    '& a': {
      textDecoration: 'none !important',
    },
    '> td:nth-child(4)': {
      backgroundColor: '#2c2f3a',
    },
    '> td:nth-child(2):empty': {
      width: '30px',
      display: 'block',
    },
  },
};

const copyTimeout = 2500;
function SpecDiff(props: Props) {
  const {
    newSpec, oldSpec, loading, spec,
  } = props;
  const noSpec = !newSpec && !oldSpec;

  const codeFoldMessageRenderer = useCallback((total) => (
    <div className="spec-diff_code-fold-message">
      <i className="codicon codicon-chevron-right" />
      Expand
      {' '}
      {total}
      {' '}
      lines
      ...
    </div>
  ), []);
  const [oldSpecCopied, setOldSpecCopied] = useState(false);
  const [newSpecCopied, setNewSpecCopied] = useState(false);
  const [leftCopyX, setLeftCopyX] = useState<number | undefined>();
  const [rightCopyX, setRightCopyX] = useState<number | undefined>();
  const [showLeftCopy, setShowLeftCopy] = useState(false);
  const [showRightCopy, setShowRightCopy] = useState(false);
  const cfg: Configuration = useConfiguration(webviewVsc) as Configuration;
  const rootRef = useRef(null);
  const copyOldSpec = useCallback(() => {
    if (!oldSpecCopied) {
      copyToClipboard(oldSpec, cfg?.format);
      setOldSpecCopied(true);
      setTimeout(() => setOldSpecCopied(false), copyTimeout);
    }
  }, [cfg?.format, oldSpec, oldSpecCopied]);

  const copyNewSpec = useCallback(() => {
    if (!newSpecCopied) {
      copyToClipboard(newSpec, cfg?.format);
      setNewSpecCopied(true);
      setTimeout(() => setNewSpecCopied(false), copyTimeout);
    }
  }, [cfg?.format, newSpec, newSpecCopied]);

  const [mounted, setMounted] = useState(false);

  const theme = useVscodeTheme();
  const isDarkTheme = theme === ThemeTypes.dark;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const rootDom = rootRef.current;
    let onRelease = () => { };
    if (oldSpec && newSpec && mounted && rootDom) {
      const diffViwer = rootDom.querySelector('.spec-diff-viewer');

      const firstRow = diffViwer.querySelector('table tr');
      if (firstRow) {
        const firstCell = firstRow.firstChild;
        const leftBox = (firstCell as Element).getBoundingClientRect();
        const firstRowBox = (firstRow as Element).getBoundingClientRect();
        setLeftCopyX(leftBox.width - 30);
        setRightCopyX(firstRowBox.width - 30);

        const leftX = 20 + leftBox.width;
        const tableY = leftBox.y;
        const showLeftFn = () => {
          setShowLeftCopy(true);
          setShowRightCopy(false);
        };
        const showRightFn = () => {
          setShowRightCopy(true);
          setShowLeftCopy(false);
        };
        const hideAllFn = () => {
          setShowLeftCopy(false);
          setShowRightCopy(false);
        };
        const onMouseOver = (e: MouseEvent) => {
          if (e.pageY < tableY) {
            hideAllFn();
            return;
          }

          if (e.pageX < leftX) {
            showLeftFn();
          } else if (e.pageX > leftX) {
            showRightFn();
          } else {
            hideAllFn();
          }
        };
        diffViwer.addEventListener('mouseover', onMouseOver);

        const onMouseLeave = (e) => {
          if (
            !e.relatedTarget
            || !(e.relatedTarget as Element).classList.contains('ant-tooltip')
          ) {
            setShowLeftCopy(false);
            setShowRightCopy(false);
          }
        };
        diffViwer.addEventListener('mouseleave', onMouseLeave);

        onRelease = () => {
          diffViwer.removeEventListener('mouseover', onMouseOver);
          diffViwer.removeEventListener('mouseleave', onMouseLeave);
        };
      }
    }
    return onRelease;
  }, [oldSpec, newSpec, mounted]);

  return (
    <div className="spec-diff-wrapper" ref={rootRef}>
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="spec-diff-titles-wrapper">
            {noSpec ? (
              <div className="spec-diff-titles_no-diff">No Spec Available</div>
            ) : (
              null
              // <>
              //   <div className="spec-diff-title spec-diff-titles-documented">Documented</div>
              //         <div className="spec-diff-title spec-diff-titles-detected">Detected</div>
              // </>
            )}
          </div>
          {!noSpec && (
            <div className="spec-diff-viewer">
              <div
                className={`left-copy __copy copied-${oldSpecCopied} ${showLeftCopy ? 'show' : 'hidden'}`}
                style={leftCopyX ? { left: `${leftCopyX}px` } : {}}
                onClick={copyOldSpec}
              >
                <Tooltip
                  visible={oldSpecCopied && showLeftCopy}
                  title="Copied"
                  placement="top"
                  overlayClassName="copy-tooltip"
                >
                  <i className={`codicon codicon-${oldSpecCopied ? 'check' : 'copy'}`} />
                </Tooltip>
              </div>
              <div
                className={`right-copy __copy copied-${newSpecCopied} ${showRightCopy ? 'show' : 'hidden'}`}
                style={rightCopyX ? { left: `${rightCopyX}px` } : {}}
                onClick={copyNewSpec}
              >
                <Tooltip
                  title="Copied"
                  visible={newSpecCopied && showRightCopy}
                  placement="top"
                  overlayClassName="copy-tooltip"
                >
                  <i className={`codicon codicon-${newSpecCopied ? 'check' : 'copy'}`} />
                </Tooltip>
              </div>
              <ReactDiffViewer
                codeFoldMessageRenderer={codeFoldMessageRenderer}
                styles={isDarkTheme ? style : defaultStyle}
                leftTitle={`${spec.version} r${spec.revision}`}
                rightTitle="Live Deployed"
                useDarkTheme={isDarkTheme}
                oldValue={oldSpec}
                newValue={newSpec}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default SpecDiff;
