import {useRequest} from "@@/plugin-request/request";
import {getApplicationRegions, updateApplicationRegions} from "@/services/applications/applications";
import {useModel} from "@@/plugin-model/useModel";
import {queryEnvironments, queryRegions} from "@/services/environments/environments";
import {Card, Select, Table} from "antd";
import {useState} from "react";
import SubmitCancelButton from "@/components/SubmitCancelButton";

const {Option} = Select;

export default () => {

  const {initialState} = useModel("@@initialState")
  const {id} = initialState!.resource
  const [defaultRegions, setDefaultRegions] = useState<{
    environment: string,
    region: string,
  }[]>([]);
  const [env2DisplayName, setEnv2DisplayName] = useState<Map<string, string>>();
  const [region2DisplayName, setRegion2DisplayName] = useState({});
  const [env2Regions, setEnv2Regions] = useState<Record<string, CLUSTER.Region[]>>();
  const {successAlert} = useModel('alert')
  const {data: envs} = useRequest(queryEnvironments, {
    onSuccess: () => {
      const e = new Map<string, string>();
      envs!.forEach(item => {
        e.set(item.name, item.displayName);
        queryRegions(item.name).then(({data}) => {
          setEnv2Regions(prev => ({...prev, [item.name]: data}))
          data.forEach(region => {
            setRegion2DisplayName(prev => ({...prev, [region.name]: region.displayName}));
          })
        })
      })
      setEnv2DisplayName(e)
    }
  });

  const {data = []} = useRequest(() => getApplicationRegions(id), {
    onSuccess: () => {
      setDefaultRegions(data)
    }
  })

  const {run: updateRegions, loading} = useRequest(() => updateApplicationRegions(id, defaultRegions), {
    onSuccess: () => {
      successAlert('默认区域更新成功')
    },
    manual: true
  })

  return <Card
    title="Default Regions"
  >
    <div style={{padding: '10px 0'}}>
      可以针对不同的环境配置该环境的默认部署区域。在创建对应环境的集群时，区域会自动填充为该环境默认的部署区域。
    </div>
    <Table
      pagination={false}
      columns={[
        {
          title: '环境',
          dataIndex: 'envDisplayName',
          key: 'envDisplayName',
        }, {
          title: '区域',
          dataIndex: 'regionDisplayName',
          key: 'regionDisplayName',
          render: (regionDisplayName: string, record: { environment: string, region: string }, index: number) => {
            return <Select value={record.region} style={{width: 200}} onSelect={(region: string) => {
              const dr = [...defaultRegions]
              dr[index] = {
                environment: record.environment,
                region
              }
              setDefaultRegions(dr)
            }}>
              {
                env2Regions?.[record.environment]?.map(item => {
                  return <Option key={item.name} value={item.name}>
                    {item.displayName}
                  </Option>
                })
              }
            </Select>
          }
        }]}
      dataSource={defaultRegions.map(item => ({
        ...item,
        envDisplayName: env2DisplayName?.get(item.environment),
        regionDisplayName: region2DisplayName[item.region],
        key: item.environment,
      }))}
    />
    <div style={{padding: '10px 0'}}>
      <SubmitCancelButton onSubmit={updateRegions} loading={loading}/>
    </div>
  </Card>
}
