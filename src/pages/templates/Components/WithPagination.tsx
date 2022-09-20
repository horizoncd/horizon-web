import { Pagination } from 'antd';
import React, { PropsWithChildren } from 'react';

interface EnhancedPaginationProps {
  pageSize: number,
  page: number,
  total: number,
  onPageChange: (page: number, pageSize: number) => void
}

function WithPagination<Props>(WrappedComponent: React.ComponentType<Props>) {
  return (props: PropsWithChildren<Props> & EnhancedPaginationProps) => {
    const {
      pageSize, page, total, onPageChange,
    } = props;
    return (
      <div
        style={
                {
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }
            }
      >
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <WrappedComponent {...props as PropsWithChildren<Props>} />
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

export default WithPagination;
