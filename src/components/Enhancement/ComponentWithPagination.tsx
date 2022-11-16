import { Pagination } from 'antd';
import React, { PropsWithChildren } from 'react';

export interface EnhancedPaginationProps {
  pageSize: number,
  page: number,
  total: number,
  onPageChange: (page: number, pageSize: number) => void
}

export function ComponentWithPagination<Props>(WrappedComponent: React.ComponentType<Props>) {
  return (props: PropsWithChildren<Props & EnhancedPaginationProps>) => {
    const {
      pageSize, page, total, onPageChange, ...restProps
    } = props;
    return (
      <div
        style={
          {
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }
        }
      >
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <WrappedComponent style={{ width: '100%' }} {...restProps as PropsWithChildren<Props>} />
        <div style={{ marginTop: '2%' }} />
        {
          total > pageSize
          && (
            <Pagination
              current={page}
              showSizeChanger
              defaultCurrent={1}
              total={total}
              pageSizeOptions={[10, 20, 50]}
              onChange={onPageChange}
            />
          )
        }
      </div>
    );
  };
}

export default ComponentWithPagination;
