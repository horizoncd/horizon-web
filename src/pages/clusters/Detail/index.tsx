import DetailCard, {Param} from '@/components/DetailCard'
import {useState} from "react";
import {Avatar, Button, Card, Divider, Table, Tooltip} from 'antd';
import {querySchema} from '@/services/templates/templates';
import Detail from '@/components/PageWithBreadcrumb';
import {useModel} from '@@/plugin-model/useModel';
import 'antd/lib/form/style';
import styles from './index.less'
import utils from '@/utils';
import {QuestionCircleOutlined, ReloadOutlined} from '@ant-design/icons';
import {useHistory, useIntl} from 'umi';
import JsonSchemaForm from '@/components/JsonSchemaForm';
import {useRequest} from '@@/plugin-request/request';
import {
  getCluster,
  getClusterOutputs,
  getClusterTags,
  getClusterTemplateSchemaTags
} from "@/services/clusters/clusters";
import RBAC from '@/rbac';
import {ResourceType} from "@/const";
import copy from "copy-to-clipboard";
import {queryEnvironments, queryRegions} from "@/services/environments/environments";

export default () => {
  const intl = useIntl();
  const history = useHistory();
  const {initialState} = useModel("@@initialState")
  const {id: clusterID, name: clusterName, fullPath: clusterFullPath, type} = initialState!.resource
  const {successAlert} = useModel('alert')
  const [env2DisplayName, setEnv2DisplayName] = useState<Map<string, string>>();
  const [region2DisplayName, setRegion2DisplayName] = useState<Map<string, string>>();const defaultCluster: CLUSTER.Cluster = {
    createdBy: {name: ""},
    updatedBy: {name: ""},
    latestDeployedCommit: "",
    id: 0,
    application: {
      id: 0,
      name: '',
    },
    name: '',
    priority: 'P0',
    description: '',
    template: {
      name: '',
      release: '',
    },
    git: {
      url: '',
      subfolder: '',
      branch: '',
      commit: '',
    },
    scope: {
      environment: '',
      region: '',
      regionDisplayName: '',
    },
    templateInput: undefined,
    fullPath: '',
    createdAt: '',
    updatedAt: ''
  }
  const [cluster, setCluster] = useState<CLUSTER.Cluster>(defaultCluster)
  const [template, setTemplate] = useState([])
  const {data: envs} = useRequest(queryEnvironments, {
    onSuccess: () => {
      const e = new Map<string, string>();
      envs!.forEach(item => e.set(item.name, item.displayName))
      setEnv2DisplayName(e)
    }
  });
  const {data: regions} = useRequest(() => queryRegions(cluster!.scope.environment), {
    onSuccess: () => {
      const e = new Map<string, string>();
      regions!.forEach(item => e.set(item.name, item.displayName))
      setRegion2DisplayName(e)
    },
    ready: !!cluster.scope.environment
  });
  const serviceDetail: Param[][] = [
    [
      {key: intl.formatMessage({id: 'pages.clusterDetail.basic.name'}), value: cluster.name},
      {key: intl.formatMessage({id: 'pages.clusterDetail.basic.priority'}), value: cluster.priority},
      {key: intl.formatMessage({id: 'pages.clusterDetail.basic.description'}), value: cluster.description || ''},
      {
        key: '区域',
        value: (cluster && region2DisplayName) ? region2DisplayName.get(cluster.scope.region) : ''
      },
      {
        key: '环境',
        value: (cluster && env2DisplayName) ? env2DisplayName.get(cluster.scope.environment) : ''
      }
    ],
    [
      {
        key: intl.formatMessage({id: 'pages.clusterDetail.basic.release'}),
        value: `${cluster.template.name}-${cluster.template.release}`
      },
      {key: intl.formatMessage({id: 'pages.clusterDetail.basic.url'}), value: cluster.git.url},
      {key: intl.formatMessage({id: 'pages.clusterDetail.basic.branch'}), value: cluster.git.branch},
      {key: intl.formatMessage({id: 'pages.clusterDetail.basic.subfolder'}), value: cluster.git.subfolder},
    ],
    [
      {
        key: intl.formatMessage({id: 'pages.clusterDetail.basic.createTime'}),
        value: utils.timeToLocal(cluster.createdAt)
      },
      {
        key: '创建人',
        value: cluster.createdBy.name
      },
      {
        key: intl.formatMessage({id: 'pages.clusterDetail.basic.updateTime'}),
        value: utils.timeToLocal(cluster.updatedAt)
      },
      {
        key: '修改人',
        value: cluster.updatedBy.name
      },
    ],
  ]

  const {run: refreshCluster} = useRequest(() => {
    return getCluster(clusterID).then(({data: result}) => {
      setCluster(result);
      // query schema by template and release
      querySchema(result.template.name, result.template.release, {
        resourceType: ResourceType.CLUSTER,
        clusterID
      }).then(({data}) => {
        setTemplate(data);
      });
    });
  }, {
    ready: type === ResourceType.CLUSTER && !!clusterID,
    refreshDeps: [clusterID]
  })

  const {data: tags} = useRequest(() => getClusterTags(clusterID), {
    refreshDeps: [clusterID],
  })

  const [clusterOutputArray, setClusterOutputArray] = useState()
  const {data: clusterOutputs} = useRequest(() => getClusterOutputs(clusterID), {
    refreshDeps: [clusterID],
    onSuccess: () => {
      let outputs: any = []
      for (const name in clusterOutputs) {
        outputs = outputs.concat({
          key: name,
          description: clusterOutputs[name].description,
          value: clusterOutputs[name].value,
        })
        setClusterOutputArray(outputs)
      }
    }
  })

  const {data: adminTags} = useRequest(() => getClusterTemplateSchemaTags(clusterID), {
    refreshDeps: [clusterID]
  })

  const firstLetter = clusterName.substring(0, 1).toUpperCase();

  const editClusterRoute = `/clusters${clusterFullPath}/-/edit`;
  const manageTagsRoute = `/clusters${clusterFullPath}/-/tags`;
  const manageAdminTagsRoute = `/clusters${clusterFullPath}/-/admintags`;
  const tagColumns = [
    {
      title: <span className={styles.tableColumn}>键</span>,
      dataIndex: 'key',
      key: 'key',
      width: '30%',
      className: styles.tableHeader
    },
    {
      title: <span className={styles.tableColumn}>值</span>,
      dataIndex: 'value',
      key: 'value',
      width: '70%',
      className: styles.tableHeader
    }
  ]

  const outputColumns = [
    {
      title: <span className={styles.tableColumn}>键</span>,
      dataIndex: 'key',
      key: 'key',
      render: (text: string, record: any) => {
        return <div style={{display: "flex", alignItems: "center"}}>
          <span style={{marginRight: "5px"}}>{text}</span>
          <Tooltip placement={"right"} className={styles.textDescription}
                   title={<span style={{
                     whiteSpace: "pre-line"
                   }}>{record.description}</span>}>
            <QuestionCircleOutlined/>
          </Tooltip>
        </div>
      },
      width: '30%',
      className: styles.tableHeader
    },
    {
      title: <span className={styles.tableColumn}>值</span>,
      dataIndex: 'value',
      key: 'value',
      width: '70%',
      className: styles.tableHeader
    }
  ]

  return (
    <Detail>
      <div>
        <div className={styles.avatarBlock}>
          <Avatar className={`${styles.avatar} identicon bg${utils.getAvatarColorIndex(clusterName)}`} size={64}
                  shape={"square"}>
            <span className={styles.avatarFont}>{firstLetter}</span>
          </Avatar>
          <div className={styles.flexColumn}>
            <div className={styles.titleFont}>{clusterName}</div>
            <div className={styles.idFont}>
              <Tooltip title="单击可复制ID">
                <span onClick={() => {
                  copy(String(clusterID))
                  successAlert('ID复制成功')
                }}>
                  Cluster ID: {clusterID}
                </span>
              </Tooltip>
            </div>
          </div>
          <div className={styles.flex}/>
          <Button className={styles.button} onClick={refreshCluster}><ReloadOutlined/></Button>
          {
            <Button
              disabled={!RBAC.Permissions.updateCluster.allowed}
              type="primary" className={styles.button}
              onClick={() =>
                history.push({
                  pathname: editClusterRoute,
                })
              }
            >
              {intl.formatMessage({id: 'pages.clusterDetail.basic.edit'})}
            </Button>
          }
        </div>
      </div>
      <Divider className={styles.groupDivider}/>
      <DetailCard title={(
        <span className={styles.cardTitle}>{intl.formatMessage({id: 'pages.clusterDetail.basic.detail'})}</span>)}
                  data={serviceDetail}/>
      <Card title={(
        <span className={styles.cardTitle}>{intl.formatMessage({id: 'pages.clusterDetail.basic.config'})}</span>)}
            type={"inner"}>
        {
          template && Object.keys(template).map((item) => {
            return (
              <JsonSchemaForm
                key={item}
                disabled={true}
                uiSchema={template[item].uiSchema}
                formData={cluster.templateInput[item]}
                jsonSchema={template[item].jsonSchema}
              />)
          })
        }
      </Card>
      {
        <Card
          style={{marginTop: '20px'}}
          title={(<span className={styles.cardTitle}>输出</span>)}
          type={"inner"}>
          <Table
            tableLayout={"fixed"}
            dataSource={clusterOutputArray}
            columns={outputColumns}
          />
        </Card>
      }
      <Card
        style={{marginTop: '20px'}}
        title={(
          <div style={{display: "flex"}}>
            <span className={styles.cardTitle}>标签</span>
            <div style={{flex: 1}}/>
            {
              <Button
                disabled={!RBAC.Permissions.updateTags.allowed}
                onClick={
                  () =>
                    history.push({
                      pathname: manageTagsRoute,
                    })
                }
              >管理标签</Button>
            }
          </div>
        )}
        type={"inner"}>
        <Table
          tableLayout={"fixed"}
          dataSource={tags?.tags}
          columns={tagColumns}
        />
      </Card>
      <Card
        style={{marginTop: '20px'}}
        title={(
          <div style={{display: "flex"}}>
            <span className={styles.cardTitle}>管理员标签</span>
            <div style={{flex: 1}}/>
            {
              <Button
                disabled={!RBAC.Permissions.updateTemplateSchemaTags.allowed}
                onClick={
                  () =>
                    history.push({
                      pathname: manageAdminTagsRoute,
                    })
                }
              >管理标签</Button>
            }
          </div>
        )}
        type={"inner"}>
        <Table
          tableLayout={"fixed"}
          dataSource={adminTags?.tags}
          columns={tagColumns}
        />
      </Card>
    </Detail>
  )
}
