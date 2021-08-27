import { Request, Response } from 'express';

const part = [
  {
    id: 1,
    name: 'music-cloud-native',
    path: '/music-cloud-native',
    childrenCount: 2,
    children: [
      {
        id: 2,
        name: 'app-deploy',
        childrenCount: 1,
        path: '/music-cloud-native/app-deploy',
        parentId: 1,
        children: [{
          id: 3,
          name: 'dev',
          type: 'application',
          path: '/music-cloud-native/app-deploy/dev',
          parentId: 2,
        }],
      }]
  }
]
const demo = [
  {
    id: 1,
    name: 'music-cloud-native',
    path: '/music-cloud-native',
    childrenCount: 2,
    children: [
      {
        id: 2,
        name: 'app-deploy',
        childrenCount: 1,
        path: '/music-cloud-native/app-deploy',
        children: [{
          id: 3,
          name: 'dev',
          type: 'application',
          path: '/music-cloud-native/app-deploy/dev',
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
];

const queryGroups = (req: Request, res: Response) => {
  const { filter } = req.query;

  res.json({
    data: part
  });
};

export default {
  'GET /api/v1/groups/search': queryGroups,
};
