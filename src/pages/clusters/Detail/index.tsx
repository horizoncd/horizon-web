import DetailCard, {Param} from '@/components/DetailCard'
import {useEffect, useState} from "react";
import {Avatar, Button, Card, Divider, Dropdown, Menu, Modal, notification} from 'antd';
import {querySchema} from '@/services/templates/templates';
import Detail from '@/components/PageWithBreadcrumb';
import {useModel} from '@@/plugin-model/useModel';
import 'antd/lib/form/style';
import styles from './index.less'
import utils from '@/utils';
import {DownOutlined, ExclamationCircleOutlined, ReloadOutlined} from '@ant-design/icons';
import {useHistory, useIntl} from 'umi';
import {stringify} from 'querystring';
import JsonSchemaForm from '@/components/JsonSchemaForm';
import {useRequest} from '@@/plugin-request/request';
import {deleteCluster, getCluster} from "@/services/clusters/clusters";

export default () => {
  const intl = useIntl();
  const history = useHistory();
  const {initialState} = useModel("@@initialState")
  const {id: clusterID, name: clusterName, fullPath: clusterFullPath} = initialState!.resource
  const defaultCluster: CLUSTER.Cluster = {
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
    },
    templateInput: undefined,
    fullPath: '',
    createdAt: '',
    updatedAt: '',
  }
  const [cluster, setCluster] = useState<CLUSTER.Cluster>(defaultCluster)
  const [template, setTemplate] = useState([])
  const serviceDetail: Param[][] = [
    [
      {key: intl.formatMessage({id: 'pages.clusterDetail.basic.name'}), value: cluster.name},
      {key: intl.formatMessage({id: 'pages.clusterDetail.basic.description'}), value: cluster.description || ''},
      {key: intl.formatMessage({id: 'pages.clusterDetail.basic.priority'}), value: cluster.priority},
      {key: intl.formatMessage({id: 'pages.clusterDetail.basic.url'}), value: cluster.git.url},
      {key: intl.formatMessage({id: 'pages.clusterDetail.basic.subfolder'}), value: cluster.git.subfolder},
      {key: intl.formatMessage({id: 'pages.clusterDetail.basic.branch'}), value: cluster.git.branch},
    ],
    [
      {
        key: intl.formatMessage({id: 'pages.clusterDetail.basic.release'}),
        value: cluster.template.name + '-' + cluster.template.release
      },
    ],
    [
      {key: intl.formatMessage({id: 'pages.clusterDetail.basic.createTime'}), value: cluster.createdAt},
      {key: intl.formatMessage({id: 'pages.clusterDetail.basic.updateTime'}), value: cluster.updatedAt},
    ],
  ]

  const {run: refreshCluster} = useRequest(() => {
    return getCluster(clusterID).then(({data: result}) => {
      setCluster(result);
      // query schema by template and release
      querySchema(result.template.name, result.template.release).then(({data}) => {
        setTemplate(data);
      });
    });
  }, {manual: true})

  const {run: delCluster} = useRequest(() => {
    return deleteCluster(clusterID).then(() => {
      notification.success({
        message: intl.formatMessage({id: "pages.clusterDelete.success"}),
      });
      window.location.href = clusterFullPath.substring(0, clusterFullPath.lastIndexOf('/'));
    });
  }, {manual: true})

  useEffect(() => {
    refreshCluster().then();
  }, []);


  const firstLetter = clusterName.substring(0, 1).toUpperCase();
  const operateDropdown = (
    <Menu>
      <Menu.Item onClick={() => {
        Modal.confirm({
          title: intl.formatMessage({id: 'pages.clusterDelete.confirm.title'}, {
            cluster: <span className={styles.bold}> {clusterName}</span>
          }),
          icon: <ExclamationCircleOutlined/>,
          content: <div
            className={styles.bold}>{intl.formatMessage({id: 'pages.clusterDelete.confirm.content'})} </div>,
          okText: intl.formatMessage({id: 'pages.clusterDelete.confirm.ok'}),
          cancelText: intl.formatMessage({id: 'pages.clusterDelete.confirm.cancel'}),
          onOk: () => {
            delCluster().then();
          },
        });
      }}>
        <a>{intl.formatMessage({id: 'pages.clusterDetail.basic.delete'})}</a>
      </Menu.Item>
    </Menu>
  );

  const editClusterRoute = '/clusters/edit';

  return (
    <Detail>
      <div>
        <div className={styles.avatarBlock}>
          <Avatar className={`${styles.avatar} identicon bg${utils.getAvatarColorIndex(clusterName)}`} size={64}
                  shape={"square"}>
            <span className={styles.avatarFont}>{firstLetter}</span>
          </Avatar>
          <span className={styles.titleFont}>{clusterName}</span>
          <div className={styles.flex}/>
          <Button className={styles.button} onClick={refreshCluster}><ReloadOutlined/></Button>
          <Button
            type="primary" className={styles.button}
            onClick={() =>
              history.push({
                pathname: editClusterRoute,
                search: stringify({
                  cluster: clusterName,
                }),
              })
            }
          >
            {intl.formatMessage({id: 'pages.clusterDetail.basic.edit'})}
          </Button>
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
    </Detail>
  )
}
