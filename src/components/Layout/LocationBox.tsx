import styled from 'styled-components';

interface LocationBoxProps {
  horizontal?: 'left' | 'right' | 'center',
  vertical?: 'top' | 'bottom' | 'center',
}

const LocationBox = styled.div`
    width: ${(props: LocationBoxProps) => {
    const { horizontal } = props;
    if (!horizontal) {
      return '';
    }
    return '100%';
  }};
    height: ${(props: LocationBoxProps) => {
    const { vertical } = props;
    if (!vertical) {
      return '';
    }
    return '100%';
  }};
    display: inline-flex;
    justify-content: ${(props: LocationBoxProps) => {
    const { horizontal } = props;
    switch (horizontal) {
      case undefined:
        return '';
      case 'left':
        return 'flex-start';
      case 'right':
        return 'flex-end';
      case 'center':
        return 'center';
      default:
        return 'center';
    }
  }};
    align-items: ${(props: LocationBoxProps) => {
    const { vertical } = props;
    switch (vertical) {
      case undefined:
        return '';
      case 'top':
        return 'flex-start';
      case 'bottom':
        return 'flex-end';
      case 'center':
        return 'center';
      default:
        return 'center';
    }
  }};
`;

export default LocationBox;
