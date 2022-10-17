import { useRequest } from '@@/plugin-request/request';
import { useModel } from '@@/plugin-model/useModel';
import { useState } from 'react';
import Basic1 from './v1';
import Basic2 from './v2';

import { applicationVersion1, getApplicationV2 } from '@/services/applications/applications';
import { API } from '@/services/typings';

export default () => {
  const { initialState } = useModel('@@initialState');
  const { id: applicationID } = initialState!.resource;
  const [called, setCalled] = useState<API.GetApplicationResponse2 | undefined>(undefined);
  const [ifVersion1, setIfVersion1] = useState<boolean>(false);
  useRequest(() => getApplicationV2(applicationID).then(
    ({ data: result }) => {
      if (result.manifest && result.manifest.manifestVersion !== applicationVersion1) {
        setCalled(result);
        setIfVersion1(false);
      } else {
        setIfVersion1(true);
        setCalled(result);
      }
    },
  ));
  return (
    <div>
      {
        called && ifVersion1 && <Basic1 />
      }
      {
        called && !ifVersion1 && <Basic2 />
      }
    </div>
  );
};
