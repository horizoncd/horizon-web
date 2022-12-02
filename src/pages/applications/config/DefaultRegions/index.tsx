import { useRequest } from '@@/plugin-request/request';
import { useModel } from '@@/plugin-model/useModel';
import { Card, Select, Table } from 'antd';
import { useState } from 'react';
import { useIntl } from 'umi';
import { queryEnvironments } from '@/services/environments/environments';
import { getApplicationRegions, updateApplicationRegions, queryRegions } from '@/services/applications/applications';
import SubmitCancelButton from '@/components/SubmitCancelButton';

const { Option } = Select;

export default () => {
  const intl = useIntl();
  const { initialState } = useModel('@@initialState');
  const { id } = initialState!.resource;
  const [defaultRegions, setDefaultRegions] = useState<{
    environment: string,
    region: string,
  }[]>([]);
  const [env2DisplayName, setEnv2DisplayName] = useState<Map<string, string>>();
  const [region2DisplayName, setRegion2DisplayName] = useState({});
  const [env2Regions, setEnv2Regions] = useState<Record<string, CLUSTER.Region[]>>();
  const { successAlert } = useModel('alert');
  const { data: envs } = useRequest(queryEnvironments, {
    onSuccess: () => {
      const e = new Map<string, string>();
      envs!.forEach((item) => {
        e.set(item.name, item.displayName);
        queryRegions(id, item.name).then(({ data }) => {
          setEnv2Regions((prev) => ({ ...prev, [item.name]: data }));
          data?.forEach((region) => {
            setRegion2DisplayName((prev) => ({ ...prev, [region.name]: region.displayName }));
          });
        });
      });
      setEnv2DisplayName(e);
    },
  });

  const { data = [] } = useRequest(() => getApplicationRegions(id), {
    onSuccess: () => {
      setDefaultRegions(data);
    },
  });

  const { run: updateRegions, loading } = useRequest(() => updateApplicationRegions(id, defaultRegions), {
    onSuccess: () => {
      successAlert(intl.formatMessage({ id: 'pages.message.defaultRegion.success' }));
    },
    manual: true,
  });

  return (
    <Card
      title={intl.formatMessage({ id: 'pages.applicationAdvance.defaultRegion' })}
    >
      <div style={{ padding: '10px 0' }}>
        {intl.formatMessage({ id: 'pages.message.defaultRegion.hint' })}
      </div>
      <Table
        pagination={false}
        columns={[
          {
            title: intl.formatMessage({ id: 'pages.common.env' }),
            dataIndex: 'envDisplayName',
            key: 'envDisplayName',
          }, {
            title: intl.formatMessage({ id: 'pages.common.region' }),
            dataIndex: 'regionDisplayName',
            key: 'regionDisplayName',
            render: (regionDisplayName: string, record: { environment: string, region: string }, index: number) => (
              <Select
                value={record.region}
                style={{ width: 200 }}
                onSelect={(region: string) => {
                  const dr = [...defaultRegions];
                  dr[index] = {
                    environment: record.environment,
                    region,
                  };
                  setDefaultRegions(dr);
                }}
              >
                {
                env2Regions?.[record.environment]?.map((item) => {
                  const text = item.disabled ? `${item.displayName} (disabled)` : item.displayName;
                  return (
                    <Option key={item.name} value={item.name} disabled={item.disabled}>
                      {text}
                    </Option>
                  );
                })
              }
              </Select>
            ),
          }]}
        dataSource={defaultRegions.map((item) => ({
          ...item,
          envDisplayName: env2DisplayName?.get(item.environment),
          regionDisplayName: region2DisplayName[item.region],
          key: item.environment,
        }))}
      />
      <div style={{ padding: '10px 0' }}>
        <SubmitCancelButton onSubmit={updateRegions} loading={loading} />
      </div>
    </Card>
  );
};
