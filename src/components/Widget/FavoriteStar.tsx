import { StarFilled, StarTwoTone } from '@ant-design/icons';
import { useRequest } from 'umi';
import { addFavorite, deleteFavorite } from '@/services/clusters/clusters';

interface Props {
  isFavorite: boolean;
  clusterID: number;
  onStarClick?: () => void;
}

function FavoriteStar(props: Props) {
  const { isFavorite, clusterID: id, onStarClick } = props;
  const { run: updateFavorite } = useRequest((favorite: boolean) => (favorite ? addFavorite(id) : deleteFavorite(id)), {
    onSuccess: () => {
      if (onStarClick) {
        onStarClick();
      }
    },
    refreshDeps: [id, isFavorite],
    manual: true,
    throttleInterval: 500,
  });

  return (
    isFavorite
      ? <StarFilled onClick={() => updateFavorite(false)} style={{ color: '#F4D03F' }} />
      : <StarTwoTone onClick={() => updateFavorite(true)} twoToneColor="#F4D03F" />
  );
}

FavoriteStar.defaultProps = {
  onStarClick: () => {},
};

export default FavoriteStar;
