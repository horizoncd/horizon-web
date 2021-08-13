import React from 'react';
import { Space, Card, Col, Row, Divider } from 'antd';
import info from './url.js';

export default (): React.ReactNode => {
  const { env, data } = info;

  const part = (sites: { [x: string]: any }, head: {} | null | undefined, urlPostfix: string) => (
    <Card title={head}>
      <Space size={'large'} direction="horizontal" wrap>
        {Object.keys(sites).map((key) => {
          const urlPrefix = sites[key];
          const zhName = env.get(key);
          const url = `http://${urlPrefix}.${urlPostfix}`;
          return (
            <div key={url}>
              <a target={'_blank'} href={url}>
                {zhName}
              </a>
            </div>
          );
        })}
      </Space>
    </Card>
  );
  // eslint-disable-next-line no-underscore-dangle
  const _data = data.map((item: { name: any; sites: any }) => {
    const { name, sites } = item;

    return (
      <Col span={6}>
        <Card key={name} title={name}>
          {part(sites, '办公网', 'netease.com')}
          <Divider />
          {part(sites, '内网', 'service.163.org')}
        </Card>
      </Col>
    );
  });

  return <Row gutter={16}>{_data}</Row>;
};
