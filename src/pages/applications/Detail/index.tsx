import type {Param} from '@/components/DetailCard';
import DetailCard from '@/components/DetailCard'
import {useEffect, useState} from "react";
import {deleteApplication, getApplication} from '@/services/applications/applications';
import {Avatar, Button, Card, Divider, Dropdown, Menu, Modal} from 'antd';
import {querySchema} from '@/services/templates/templates';
import Detail from '@/components/PageWithBreadcrumb';
import {useModel} from '@@/plugin-model/useModel';
import 'antd/lib/form/style';
import styles from './index.less'
import utils from '@/utils';
import {DownOutlined, ExclamationCircleOutlined, ReloadOutlined} from '@ant-design/icons';
import {useHistory, useIntl} from 'umi';
import JsonSchemaForm from '@/components/JsonSchemaForm';
import {useRequest} from '@@/plugin-request/request';
import RBAC from '@/rbac'

export default () => {
  const intl = useIntl();
  const history = useHistory();
  const {initialState} = useModel("@@initialState")
  const {id, name: applicationName, fullPath: applicationFullPath} = initialState!.resource
  const defaultApplication: API.Application = {
    fullPath: "",
    id: 0,
    groupID: 0,
    name: '',
    priority: 'P0',
    description: '',
    template: {
      name: '',
      release: '',
      recommendedRelease: '',
    },
    git: {
      url: '',
      subfolder: '',
      branch: '',
    },
    templateInput: undefined,
    createdAt: '',
    updatedAt: ''
  }
  const {successAlert} = useModel('alert')
  const [application, setApplication] = useState<API.Application>(defaultApplication)
  const [template, setTemplate] = useState([])
  const serviceDetail: Param[][] = [
    [
      {key: intl.formatMessage({id: 'pages.applicationNew.basic.name'}), value: application.name},
      {key: intl.formatMessage({id: 'pages.applicationNew.basic.description'}), value: application.description || ''},
      {key: intl.formatMessage({id: 'pages.applicationNew.basic.priority'}), value: application.priority},
    ],
    [
      {
        key: intl.formatMessage({id: 'pages.applicationDetail.basic.release'}),
        value: `${application.template.name}-${application.template.release}`
      },
      {key: intl.formatMessage({id: 'pages.applicationNew.basic.url'}), value: application.git.url},
      {key: intl.formatMessage({id: 'pages.applicationNew.basic.subfolder'}), value: application.git.subfolder},
      {key: intl.formatMessage({id: 'pages.applicationNew.basic.branch'}), value: application.git.branch},
    ],
    [
      {
        key: intl.formatMessage({id: 'pages.applicationDetail.basic.createTime'}),
        value: utils.timeToLocal(application.createdAt),
      },
      {
        key: intl.formatMessage({id: 'pages.applicationDetail.basic.updateTime'}),
        value: utils.timeToLocal(application.updatedAt)
      },
    ],
  ]

  // 仅当推荐版本与当前版本不一致时显示推荐信息
  if (application.template.release !== application.template.recommendedRelease) {
    serviceDetail[1] = serviceDetail[1].concat({
      key: intl.formatMessage({id: 'pages.applicationNew.basic.recommendedRelease'}),
      value: `${application.template.name}-${application.template.recommendedRelease}`
    })
  }

  const {run: refreshApplication} = useRequest(() => {
    return getApplication(id).then(({data: result}) => {
      setApplication(result);
      // query schema by template and release
      querySchema(result.template.name, result.template.release).then(({data}) => {
        setTemplate(data);
      });
    });
  }, {manual: true})

  const {run: delApplication} = useRequest(() => {
    return deleteApplication(id).then(() => {
      successAlert(intl.formatMessage({id: "pages.applicationDelete.success"}))
      window.location.href = applicationFullPath.substring(0, applicationFullPath.lastIndexOf('/'))
    });
  }, {manual: true})

  useEffect(() => {
    refreshApplication();
  }, []);


  const firstLetter = applicationName.substring(0, 1).toUpperCase();
  const operateDropdown = (
    <Menu>
      <Menu.Item onClick={() => {
        Modal.confirm({
          title: intl.formatMessage({id: 'pages.applicationDelete.confirm.title'}, {
            application: <span className={styles.bold}> {applicationName}</span>
          }),
          icon: <ExclamationCircleOutlined/>,
          content: <div
            className={styles.bold}>{intl.formatMessage({id: 'pages.applicationDelete.confirm.content'})} </div>,
          okText: intl.formatMessage({id: 'pages.applicationDelete.confirm.ok'}),
          cancelText: intl.formatMessage({id: 'pages.applicationDelete.confirm.cancel'}),
          onOk: () => {
            delApplication().then();
          },
        });
      }}>
        <a>{intl.formatMessage({id: 'pages.applicationDetail.basic.delete'})}</a>
      </Menu.Item>
    </Menu>
  );

  const editApplicationRoute = `/applications${applicationFullPath}/-/edit`;

  return (
    <Detail>
      <div>
        <div className={styles.avatarBlock}>
          <Avatar className={`${styles.avatar} identicon bg${utils.getAvatarColorIndex(applicationName)}`} size={64}
                  shape={"square"}>
            <span className={styles.avatarFont}>{firstLetter}</span>
          </Avatar>
          <span className={styles.titleFont}>{applicationName}</span>
          <div className={styles.flex}/>
          <Button className={styles.button} onClick={refreshApplication}><ReloadOutlined/></Button>
          {
            RBAC.Permissions.updateApplication.allowed &&
            <Button
              type="primary" className={styles.button}
              onClick={() =>
                history.push({
                  pathname: editApplicationRoute,
                })
              }
            >
              {intl.formatMessage({id: 'pages.applicationDetail.basic.edit'})}
            </Button>
          }
          {
            RBAC.Permissions.deleteApplication.allowed &&
            <Dropdown className={styles.button} overlay={operateDropdown}
                      trigger={["click"]}>
              <Button>{intl.formatMessage({id: 'pages.applicationDetail.basic.operate'})}<DownOutlined/></Button></Dropdown>
          }
        </div>
      </div>
      <Divider className={styles.groupDivider}/>
      <DetailCard title={(
        <span className={styles.cardTitle}>{intl.formatMessage({id: 'pages.applicationDetail.basic.detail'})}</span>)}
                  data={serviceDetail}/>
      <Card title={(
        <span className={styles.cardTitle}>{intl.formatMessage({id: 'pages.applicationDetail.basic.config'})}</span>)}
            type={"inner"}>
        {
          template && Object.keys(template).map((item) => {
            return (
              <JsonSchemaForm
                key={item}
                disabled={true}
                uiSchema={template[item].uiSchema}
                formData={application.templateInput[item]}
                jsonSchema={template[item].jsonSchema}
              />)
          })
        }
      </Card>
    </Detail>
  )
}
