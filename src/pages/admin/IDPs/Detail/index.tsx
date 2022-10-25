import { useIntl, useModel, useRequest } from 'umi';
import { Space } from 'antd';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import CenterSpin from '@/components/Widget/CenterSpin';
import { getIDPByID } from '@/services/idps';
import DetailCard, { Param } from '@/components/DetailCard';
import PageWithID from '@/components/PageEnhancement/PageWithID/PageWithID';
import PopupTime from '@/components/Widget/Time';
import { IDPDeleteButton, IDPEditButton } from '../Components/Bottons';

const defaultTime = '2006-05-04 03:02:01';

function IDPDetail(props: { id: number }) {
  const { id } = props;
  const { data: idp, loading } = useRequest(() => getIDPByID(id));
  const { successAlert } = useModel('alert');
  const intl = useIntl();

  if (loading || !idp) {
    return <CenterSpin />;
  }

  const data: Param[][] = [
    [
      {
        key: intl.formatMessage({ id: 'pages.idps.entity.displayName' }),
        value: idp.displayName,
      },
      {
        key: 'Auth Endpoint',
        value: idp.authorizationEndpoint,
      },
      {
        key: 'Token Endpoint',
        value: idp.tokenEndpoint,
      },
    ],
    [
      {
        key: 'Client ID',
        value: idp.clientID,
      },
      {
        key: 'Client Secret',
        value: idp.clientSecret,
      },
    ],
    [
      {
        key: intl.formatMessage({ id: 'pages.common.createdAt' }),
        value: <PopupTime time={idp?.createdAt ?? defaultTime} />,
      },
      {
        key: intl.formatMessage({ id: 'pages.common.updatedAt' }),
        value: <PopupTime time={idp?.updatedAt ?? defaultTime} />,
      },
    ],
  ];

  return (
    <PageWithBreadcrumb>
      <DetailCard
        title={<span>{intl.formatMessage({ id: 'pages.common.basicInfo' })}</span>}
        data={data}
        extra={(
          <Space>
            <IDPEditButton id={id} />
            <IDPDeleteButton id={id} onSuccess={() => { successAlert(intl.formatMessage({ id: 'pages.common.delete.success' })); }} />
          </Space>
        )}
      />
    </PageWithBreadcrumb>
  );
}

export default PageWithID(IDPDetail);
