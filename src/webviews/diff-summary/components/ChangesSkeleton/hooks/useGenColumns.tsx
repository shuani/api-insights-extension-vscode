import { useMemo } from 'react';
import { Skeleton } from 'antd';

export default function useGenColumns() {
  const columns = useMemo(() => [
    {
      title: 'Method',
      dataIndex: 'method',
      key: 'method',
      render: () => <Skeleton active paragraph={false} />,
    },
    {
      title: 'Path',
      dataIndex: 'path',
      key: 'path',
      render: () => <Skeleton active paragraph={false} />,
    },
    {
      title: 'Type',
      dataIndex: 'breaking',
      key: 'breaking',
      render: () => <Skeleton active paragraph={false} />,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: () => <Skeleton active paragraph={false} />,
    },
    {
      title: 'Action',
      key: 'action',
      render: () => <Skeleton active paragraph={false} />,

    },
  ], []);

  return columns;
}
