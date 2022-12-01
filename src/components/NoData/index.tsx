import { Col, Row } from 'antd';
import { useIntl } from 'umi';

export default (props: { titleID: string, descID: string }) => {
  // id 为 useIntl() hook 需要的 id
  const { titleID, descID } = props;
  const intl = useIntl();
  return (
    <Row style={{ textAlign: 'center' }}>
      <Col offset={3} span={18}>
        <div style={{ fontSize: '16px', color: 'black' }}>
          {intl.formatMessage({ id: titleID })}
        </div>
        <div style={{ fontSize: '14px', color: 'grey' }}>
          {intl.formatMessage({ id: descID })}
        </div>
        <Row>
          <Col offset={3} span={18}>
            <img src="/h.svg" alt="horizon" style={{ height: '400px' }} />
          </Col>
        </Row>
      </Col>
    </Row>
  );
};
