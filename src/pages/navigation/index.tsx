import React from 'react';
import { Space, Card, Col, Row } from 'antd';
import info from './url.js';

export default (): React.ReactNode => {
  const { env, data } = info;
  console.log(info);
  // eslint-disable-next-line no-underscore-dangle
  const _data = data.map((item: { name: any; sites: any }) => {
    const { name, sites } = item;

    return (
      <Card key={name} title={name} style={{ width: 300 }}>
        {Object.keys(sites).map((key) => {
          const urlPrefix = sites[key];
          const zhName = env.get(key);
          const url = `http://${urlPrefix}.netease.com`;
          return (
            <div key={url}>
              <a target={'_blank'} href={url}>
                {zhName}
              </a>
            </div>
          );
        })}
      </Card>
    );
  });

  return (
    <Row>
      <Col span={2} />
      <Col span={16}>
        <Space size={'large'} direction="horizontal">
          {_data}
        </Space>
      </Col>
      <Col span={2} />
    </Row>
  );
};
