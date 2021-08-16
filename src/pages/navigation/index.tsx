import React from 'react';
import {Card, Col, Row} from 'antd';
import info from './url.js';

export default (): React.ReactNode => {
  const {env, data} = info;

  const gridStyle = {
    width: '25%',
    textAlign: 'center',
  };

  const part = (modules) => {
    return modules.map(moudle => {
      const {moduleName, serviceSites, neteaseSites, overwrite} = moudle;

      return (
        <Col span={12}>
          <Card title={moduleName} style={{textAlign: 'center',}}>
            {
              serviceSites && serviceSites.map(site => {
                const {name, flag} = env.get(site);
                const url = `http://${moduleName}.${flag}.service.163.org`;
                return (
                  <Card.Grid style={gridStyle}>
                    <a target={'_blank'} href={url}>
                      {name}
                    </a>
                  </Card.Grid>
                );
              })
            }
          </Card>
        </Col>
      )
    })
  };
  // eslint-disable-next-line no-underscore-dangle
  const _data = data.map(item => {
    const {title, modules} = item;

    return (
      <Card key={title} title={title} style={{textAlign: 'center',}}>
        {part(modules)}
      </Card>
    );
  });

  return <Row>{_data}</Row>;
};
