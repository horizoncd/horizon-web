import { Request, Response } from 'express';

const getGroups = (req: Request, res: Response) => {
  res.json({
    data: [
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
      },
      {
        title: 'cloudsre',
        key: 'cloudsre',
      },
    ],
  });
};

export default {
  'GET /api/groups': getGroups,
};
