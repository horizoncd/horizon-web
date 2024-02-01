import { toSvg } from 'jdenticon';

interface RandomAvatarProps {
  size?: number;
  name: string;
}
const IdentAvatar = (props: RandomAvatarProps) => {
  const { size = 100, name } = props;
  return (
    <div
      style={{
        borderRadius: '40%',
        border: '1px solid #ccc',
        display: 'inline-block',
        height: `${size}px`,
        width: `${size}px`,
      }}
      dangerouslySetInnerHTML={{ __html: toSvg(name, size) }}
    />
  );
};

export default IdentAvatar;
