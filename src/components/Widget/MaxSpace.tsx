import { Space } from 'antd';
import styled from 'styled-components';

const MaxSpace = styled(Space)`
        height: ${(props) => {
    switch (props.direction) {
      case 'horizontal':
        return '100%';
      default:
        return 'auto';
    }
  }};
        width: ${(props) => {
    switch (props.direction) {
      case 'vertical':
        return '100%';
      default:
        return 'auto';
    }
  }};`;

export default MaxSpace;
