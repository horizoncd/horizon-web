import { useHistory, useModel } from 'umi';

export default () => {
  const history = useHistory();
  const { initialState } = useModel('@@initialState');
  const { fullPath } = initialState!.resource;

  // todo: navigation page for new cluster
  history.push(fullPath);
  return (
    <div />
  );
};
