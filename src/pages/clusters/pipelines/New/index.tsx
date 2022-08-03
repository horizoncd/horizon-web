import styles from "@/pages/clusters/NewOrEdit/index.less";
import {Card, Form, Input, Select} from "antd";
import {useIntl} from "@@/plugin-locale/localeExports";
import TextArea from "antd/es/input/TextArea";
import CodeDiff from '@/components/CodeDiff'
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import SubmitCancelButton from '@/components/SubmitCancelButton';
import {useModel} from "@@/plugin-model/useModel";
import NotFount from "@/pages/404";
import {PublishType} from "@/const";
import {buildDeploy, deploy, diffsOfCode, getCluster} from "@/services/clusters/clusters";
import {history} from 'umi'
import {useRequest} from "@@/plugin-request/request";
import type {FieldData} from 'rc-field-form/lib/interface'
import type {Rule} from "rc-field-form/lib/interface";
import {gitRefTypeList, listGitRef, parseGitRef, GitRefType} from "@/services/code/code";
import {useState} from "react";
import HForm from '@/components/HForm'

const {Option} = Select;


export default (props: any) => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const {initialState} = useModel('@@initialState');
  const {successAlert} = useModel('alert')
  const {id, fullPath} = initialState?.resource || {};
  const {location} = props;
  const {query} = location;
  const {type} = query;
  const [refType, setRefType] = useState('');
  if (!type) {
    return <NotFount/>;
  }

  const formatMessage = (suffix: string, defaultMsg: string) => {
    return intl.formatMessage({id: `pages.pipelineNew.${suffix}`, defaultMessage: defaultMsg})
  }

  const {data, run: refreshDiff} = useRequest((gitRef) => diffsOfCode(id!, form.getFieldValue('refType'), gitRef), {
    manual: true,
  })

  const {data: gitRefList = [], run: refreshGitRefList} = useRequest((filter?: string) => listGitRef({
    refType: form.getFieldValue('refType'),
    giturl: cluster!.git.url,
    filter,
    pageNumber: 1,
    pageSize: 50,
  }), {
    debounceInterval: 100,
  })

  const {data: cluster} = useRequest(() => getCluster(id!), {
    onSuccess: () => {
      const {gitRefType, gitRef} = parseGitRef(cluster.git)
      setRefType(gitRefType)
      form.setFieldsValue({
        refType: gitRefType,
        refValue: gitRef,
      })
      refreshDiff(gitRef)
      refreshGitRefList();
    }
  });

  const hookAfterSubmit = () => {
    successAlert(formatMessage('submit', 'Pipeline Started'))
    // jump to pods' url
    history.push(`/clusters${fullPath}/-/pods`)
  }

  const requiredRule: Rule[] = [
    {
      required: true,
    },
  ];

  const {
    run: startBuildDeploy,
    loading: buildDeployLoading
  } = useRequest((clusterID: number, d: CLUSTER.ClusterBuildDeploy) => buildDeploy(clusterID, d), {
    onSuccess: () => {
      hookAfterSubmit()
    },
    manual: true
  })

  const {
    run: startDeploy,
    loading: deployLoading
  } = useRequest((clusterID: number, d: CLUSTER.ClusterDeploy) => deploy(clusterID, d), {
    onSuccess: () => {
      hookAfterSubmit()
    },
    manual: true
  })

  const onSubmit = () => {
    const info = {
      title: form.getFieldValue('title'),
      description: form.getFieldValue('description') || '',
    }
    if (type === PublishType.BUILD_DEPLOY) {
      form.validateFields(['title', 'refType', 'refValue']).then(() => {
        startBuildDeploy(id!, {
          ...info,
          git: {
            [form.getFieldValue('refType')]: form.getFieldValue('refValue'),
          }
        })
      })
    } else {
      form.validateFields(['title']).then(() => {
        startDeploy(id!, info)
      });
    }
  }

  const onCancel = () => {
    history.goBack()
  }

  return (
    <PageWithBreadcrumb>
      <Card title={formatMessage('title', '基础信息')} className={styles.gapBetweenCards}>
        <HForm layout={'vertical'} form={form}
               onFieldsChange={(a: FieldData[]) => {
                 if (a[0].name[0] === 'branch') {
                   refreshDiff(a[0].value)
                 }
               }}
        >
          <Form.Item label={formatMessage('title', 'Title')} name={'title'} rules={requiredRule}>
            <Input/>
          </Form.Item>
          <Form.Item label={formatMessage('description', '描述')} name={'description'}>
            <TextArea maxLength={255} autoSize={{minRows: 3}}/>
          </Form.Item>
          {
            type === PublishType.BUILD_DEPLOY && (
              <Form.Item
                label={"版本"} name={'ref'}
                rules={requiredRule}
              >
                <Form.Item
                  name={"refType"}
                  style={{display: 'inline-block', width: '100px'}}
                >
                  <Select 
                      onSelect={(key: any) => {
                        setRefType(key);
                        form.setFieldsValue({"refValue": ""})
                        if (key != GitRefType.Commit) {
                          refreshGitRefList();
                        }
                      }}
                  >
                    {
                      gitRefTypeList.map((item) => {
                        return <Option key={item.key} value={item.key}>{item.displayName}</Option>
                      })
                    }
                  </Select>
                </Form.Item>
                <Form.Item
                  name={"refValue"}
                  style={{display: 'inline-block', width: 'calc(100% - 100px)'}}
                >
                  {
                    refType==GitRefType.Commit ? <Input
                      onPressEnter={()=>{
                        refreshDiff(form.getFieldValue('refValue'))
                      }}
                    /> : <Select 
                           allowClear
                           onSelect={(key: any) => {
                              refreshDiff(key);
                           }}
                           showSearch
                           onSearch={(item) => {
                             refreshGitRefList(item);
                          }}>
                      {
                        gitRefList.map((item: string) => {
                          return <Option key={item} value={item}>{item}</Option>
                        })
                      }
                    </Select>
                  }
                </Form.Item>
              </Form.Item>
            )
          }
        </HForm>
      </Card>

      <Card title={formatMessage('changes', '变更')} className={styles.gapBetweenCards}>
        {
          type === PublishType.BUILD_DEPLOY &&
          <Card title={formatMessage('codeChange', '代码变更')} className={styles.gapBetweenCards}>
            <b>Commit ID</b>
            <br/>
            {data?.codeInfo.commitID}
            <br/>
            <br/>
            <b>Commit Log</b>
            <br/>
            {data?.codeInfo.commitMsg}
            <br/>
            <br/>
            <b>Commit History</b>
            <br/>
            <a href={data?.codeInfo.link}>Link</a>
          </Card>
        }
        <Card title={formatMessage('configChange', '配置变更')} className={styles.gapBetweenCards}>
          <CodeDiff diff={data?.configDiff || ''}/>
        </Card>
      </Card>

      <SubmitCancelButton onSubmit={onSubmit} onCancel={onCancel} loading={buildDeployLoading || deployLoading}/>
    </PageWithBreadcrumb>
  )
}
