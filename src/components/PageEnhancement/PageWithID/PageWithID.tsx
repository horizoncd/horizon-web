import { useParams } from 'umi';
import NotFoundPage from '@/pages/404';

interface WithID {
  id: number,
}

function PageWithID<Props extends WithID>(Component: React.ComponentType<Props>) {
  return function ComponentWithID(props: Omit<Props, 'id'>) {
    const { id: idStr } = useParams<{ id: string }>();
    const id = parseInt(idStr, 10);
    if (Number.isNaN(id)) {
      return <NotFoundPage />;
    }
    const unionProps = {
      id,
      ...props,
    } as Props;
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <Component {...unionProps} />;
  };
}

export default PageWithID;
