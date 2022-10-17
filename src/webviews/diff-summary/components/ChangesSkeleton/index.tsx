import { PropsWithChildren } from 'react';
import { Table, Skeleton } from 'antd';
import useGenColumns from './hooks/useGenColumns';
import useGenData from './hooks/useGenData';

export default function ChangesSkeleton(props: PropsWithChildren<{ loading: boolean }>) {
  const {
    loading,
    children,
  } = props;

  const columns = useGenColumns();
  const _data = useGenData();
  return (
    loading ? (
      <>
        <div>
          <Skeleton active paragraph={false} title={{ width: 100 }} />
        </div>

        <Table
          size="middle"
          bordered
          pagination={false}
          columns={columns}
          dataSource={_data}
        />
      </>
    ) : <div>{children}</div>
  );
}
