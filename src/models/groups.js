import { useCallback, useState } from 'react';

const defaultGroups = [
  {
    title: 'music-cloud-native',
    key: 'music-cloud-native',
    children: [
      {
        title: 'app-deploy',
        key: 'app-deploy',
        children: [
          {
            title: 'dev',
            key: 'dev',
          },
        ],
      },
      {
        title: 'tomtest',
        key: 'tomtest',
      },
    ],
  },
  {
    title: 'common-code-block',
    key: 'common-code-block',
  },
  {
    title: 'music-pe',
    key: 'music-pe',
    children: [
      {
        title: 'app-deploy',
        key: 'app-deploy1',
        children: [
          {
            title: 'dev',
            key: 'dev1',
          },
        ],
      },
    ],
  },
  {
    title: 'cloudsre',
    key: 'cloudsre',
  },
];

export default function useAuthModel() {
  const [groups, setGroups] = useState(defaultGroups);

  const queryGroup = useCallback(() => {
    // queryGroups().then(({data}) => {
    //   setGroups(data);
    // });
  }, []);

  return {
    groups,
    queryGroup,
  };
}
