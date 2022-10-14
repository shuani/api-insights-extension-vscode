import '../../__mocks__/matchMedia';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import ChangesSkeleton from '../../diff-summary/components/ChangesSkeleton';

describe('ChangesSkeleton comp', () => {
  test('not shows the children when the loading is true', () => {
    const testMessage = 'Test Message';
    render(<ChangesSkeleton loading>{testMessage}</ChangesSkeleton>);

    expect(screen.queryByText(testMessage)).toBeNull();
  });

  test('shows the children when the loading is false', () => {
    const testMessage = 'Test Message';
    render(<ChangesSkeleton loading={false}>{testMessage}</ChangesSkeleton>);

    expect(screen.queryByText(testMessage)).toBeTruthy();
  });
});
