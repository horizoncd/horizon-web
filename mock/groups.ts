import { Request, Response } from 'express';

const queryGroups = (req: Request, res: Response) => {
  res.json({
    data: [
      {
        id: 1,
        name: 'music-cloud-native',
        childrenCount: 2,
        children: [
          {
            id: 2,
            name: 'app-deploy',
            childrenCount: 1,
            children: [
              {
                id: 3,
                name: 'dev',
                type: 'application'
              },
            ],
          },
          {
            id: 4,
            name: 'tomtest',
          },
        ],
      },
      {
        id: 5,
        name: 'common-code-block',
      },
      {
        id: 6,
        name: 'music-pe',
        childrenCount: 1,
        children: [
          {
            id: 7,
            name: 'app-deploy',
            childrenCount: 1,
            children: [
              {
                id: 8,
                name: 'dev',
              },
            ],
          },
        ],
      },
      {
        id: 9,
        name: 'cloudsre',
      },
    ],
  });
};

export default {
  'GET /api/v1/groups/search': queryGroups,
};
