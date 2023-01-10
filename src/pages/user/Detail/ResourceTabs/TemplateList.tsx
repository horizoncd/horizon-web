import { useState } from 'react';
import { useRequest } from 'umi';
import { DTree } from '@/components/DirectoryTree';
import { listTemplatesV2 } from '@/services/templates/templates';

function TemplateList(props: { userID: number }) {
  const { userID } = props;

  const [items, setItems] = useState([] as Templates.Template[]);
  useRequest(
    () => listTemplatesV2({
      fullpath: true, userID,
    }),
    {
      onSuccess: (data) => {
        const tpls = data.map((item) => {
          const t = item;
          if (t.fullPath) {
            t.fullName = t.fullPath.substring(1);
            t.fullPath = `/templates${t.fullPath}/-/detail`;
          }
          return t;
        });
        setItems(tpls);
      },
      refreshDeps: [userID],
    },
  );

  return (
    <DTree items={items} />
  );
}

export default TemplateList;
