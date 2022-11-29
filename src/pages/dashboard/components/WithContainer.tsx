import { Row, Col } from 'antd';
import { ComponentType } from 'react';

function WithContainer<Props>(WrappedComponent: ComponentType<Props>) {
  return function Inner(props: Props) {
    return (
      <Row>
        <Col span={4} />
        <Col span={16}>
          {/* eslint-disable-next-line react/jsx-props-no-spreading */}
          <WrappedComponent {...props} />
        </Col>
        <Col span={4} />
      </Row>
    );
  };
}

export default WithContainer;
