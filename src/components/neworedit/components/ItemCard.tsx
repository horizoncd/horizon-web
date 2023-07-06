import { Card } from 'antd';

interface ItemCardProps {
  avatar?: React.ReactNode;
  title: React.ReactNode;
  description: string;
  onClick: () => void;
}

const ItemCard = (props: ItemCardProps) => {
  const {
    avatar, title, description, onClick,
  } = props;
  return (
    <Card
      style={{ height: 150 }}
      hoverable
      onClick={onClick}
    >
      <Card.Meta
        avatar={avatar}
        title={title}
        description={description}
      />
    </Card>
  );
};

export default ItemCard;
