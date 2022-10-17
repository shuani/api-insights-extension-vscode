import { useMemo } from 'react';

const data = {
  method: '',
  path: '',
  breaking: '',
  description: '',
};
export default function useGenData() {
  const _data = useMemo(() => [1, 2, 3].map((key) => ({ ...data, key })), []);
  return _data;
}
