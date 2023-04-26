import React from 'react';
import { Result } from 'antd';
import { WarningOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { useIntl } from 'umi';

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const GrafanaAlert: React.FC = () => {
  const intl = useIntl();
  return (
    <Container>
      <Result
        icon={<WarningOutlined />}
        title={intl.formatMessage({ id: 'pages.cluster.monitor.grafanaNotConfigured' })}
        subTitle={intl.formatMessage({ id: 'pages.cluster.monitor.grafanaNotConfigured.subTitle' })}
      />
    </Container>
  );
};

export default GrafanaAlert;
