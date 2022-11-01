import { Avatar } from 'antd';
import styled from 'styled-components';
import utils from '@/utils';

const AvatarText = styled.span`
  font-size: 25px;
  color: black;
`;

const ResourceAvatar = (props: { name: string, size: number }) => {
  const { name, size } = props;
  const className = `identicon bg${utils.getAvatarColorIndex(name)}`;
  const firstLetter = name.substring(0, 1).toUpperCase();
  return (
    <Avatar
      className={className}
      style={{ borderRadius: '15%' }}
      size={size}
      shape="square"
    >
      <AvatarText>{firstLetter}</AvatarText>
    </Avatar>
  );
};

export default ResourceAvatar;
