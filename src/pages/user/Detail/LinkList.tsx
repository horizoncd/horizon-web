import { useRequest } from 'umi';
import { useState } from 'react';
import { Button, Table } from 'antd';
import { getAuthEndpoints } from '@/services/idp/idp';
import { API } from '@/services/typings';
import { deleteLinks, listLinks } from '@/services/users/users';
import { IdpSetState } from '@/utils';
import { MainText } from '@/components/Widget';

export default function LinkList(props: { userID: number, withButton: boolean }) {
  const { userID, withButton } = props;

  const [idps, setIdps] = useState([] as (API.AuthEndpoint & { link?: API.Link })[]);

  const { loading: idpsLoading } = useRequest(() => getAuthEndpoints(window.location.toString()), {
    onSuccess: (items) => {
      setIdps(items);
    },
  });
  const { refresh, loading: linksLoading } = useRequest(() => listLinks(userID), {
    onSuccess: (items) => {
      const m = new Map();
      items.forEach((item) => m.set(item.idpId, item));
      const nIdps = idps.map((idp) => { const { link, ...t } = idp; return { link: m.get(idp.id), ...t }; });
      setIdps(nIdps);
    },
  });

  if (idpsLoading || linksLoading) {
    return null;
  }

  const columns = [
    {
      title: '名称',
      width: '30%',
      dataIndex: 'displayName',
    },
    {
      title: 'sub',
      dataIndex: 'link',
      render: (link: API.Link) => {
        if (link) {
          return link.sub;
        }
        return '';
      },
    },
    {
      title: 'link',
      width: '30%',
      dataIndex: 'link',
      render: (link: API.Link, item: API.AuthEndpoint) => {
        if (link) {
          return (
            <Button
              disabled={!link.unlinkable}
              danger
              onClick={() => {
                deleteLinks(link.id).then(refresh);
              }}
            >
              Unlink
            </Button>
          );
        }
        if (withButton) {
          return (
            <Button onClick={() => {
              window.location.href = IdpSetState(
                item.authURL,
                true,
                window.location.href,
              );
            }}
            >
              Link
            </Button>
          );
        }
        return <MainText>Not Linked</MainText>;
      },
    },
  ];
  return (
    <Table
      columns={columns}
      dataSource={idps}
      pagination={false}
    />
  );
}
