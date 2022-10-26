import { DownOutlined, RightOutlined } from '@ant-design/icons';
import { Space } from 'antd';
import { PropsWithChildren, useState } from 'react';
import styled from 'styled-components';

function DropdownSwitch(
  props: PropsWithChildren<{
    defaultOpened?: boolean,
    onChange?: (open: boolean) => void
    className?: string,
  }>,
) {
  const {
    defaultOpened, onChange, className, children,
  } = props;
  const [open, setOpen] = useState(defaultOpened);
  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      className={className}
      onClick={() => {
        setOpen(!open);
        onChange!(!open);
      }}
    >
      <Space>
        {
        open
          ? <DownOutlined />
          : <RightOutlined />
      }
        {` ${children}`}
      </Space>
    </div>
  );
}

DropdownSwitch.defaultProps = {
  defaultOpened: false,
  onChange: () => {},
  className: '',
};

const StyledDropdownSwitch = styled(DropdownSwitch)`
  font-weight: ${(props: { theme: Theme }) => props.theme.fontWeight};
  color: ${(props: { theme: Theme }) => props.theme.color.emphasis};
  font-size: ${(props: { theme: Theme }) => props.theme.fontSize.small};
  font-family: ${(props: { theme: Theme }) => props.theme.fontFamily};
  &:hover {
    text-decoration: underline;
    font-size: ${(props: { theme: Theme }) => props.theme.fontSize.medium}
  }
`;

export default StyledDropdownSwitch;
