import { useIntl, useRequest } from 'umi';
import { useState } from 'react';
import { Button, Table } from 'antd';
import { getAuthEndpoints } from '@/services/idp/idp';
import { API } from '@/services/typings';
import { deleteLinks, listLinks } from '@/services/users/users';
import { IdpSetState } from '@/utils';
import { MainText } from '@/components/Widget';

export default function LinkList(props: { userID: number, withButton: boolean }) {
  const { userID, withButton } = props;

  const intl = useIntl();
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
      title: intl.formatMessage({ id: 'pages.common.name' }),
      width: '30%',
      dataIndex: 'displayName',
    },
    {
      title: 'Sub',
      dataIndex: 'link',
      render: (link: API.Link) => {
        if (link) {
          return link.sub;
        }
        return '';
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.profile.link' }),
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
              {intl.formatMessage({ id: 'pages.profile.unlink' })}
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
              {intl.formatMessage({ id: 'pages.profile.link' })}
            </Button>
          );
        }
        return <MainText>Not Linked</MainText>;
      },
    },
  ];
  return (
    <Table
      bordered
      columns={columns}
      dataSource={idps}
      pagination={false}
    />
  );
}
