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
import {Rule} from "rc-field-form/lib/interface";
import {listBranch} from "@/services/code/code";

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
  if (!type) {
    return <NotFount/>;
  }

  const formatMessage = (suffix: string, defaultMsg: string) => {
    return intl.formatMessage({id: `pages.pipelineNew.${suffix}`, defaultMessage: defaultMsg})
  }

  const {data, run: refreshDiff} = useRequest((branch) => diffsOfCode(id!, branch), {
    manual: true,
  })
  const {data: branchList = [], run: refreshBranchList} = useRequest((giturl, filter) => listBranch({
    giturl,
    filter,
    pageNumber: 1,
    pageSize: 50,
  }), {
    manual: true,
  })

  const {data: cluster} = useRequest(() => getCluster(id!), {
    onSuccess: () => {
      form.setFieldsValue({branch: cluster!.git.branch})
      refreshDiff(cluster!.git.branch)
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

  const onSubmit = () => {
    const info = {
      title: form.getFieldValue('title'),
      description: form.getFieldValue('description') || '',
    }
    if (type === PublishType.BUILD_DEPLOY) {
      form.validateFields(['title', 'branch']).then(() => {
        buildDeploy(id!, {
          ...info,
          git: {
            branch: form.getFieldValue('branch'),
          }
        }).then(() => {
          hookAfterSubmit()
        })
      })
    } else {
      form.validateFields(['title']).then(() => {
        deploy(id!, info).then(() => {
          hookAfterSubmit()
        })
      });
    }
  }

  return (
    <PageWithBreadcrumb>
      <Card title={formatMessage('title', '基础信息')} className={styles.gapBetweenCards}>
        <Form layout={'vertical'} form={form}
        >
          <Form.Item label={formatMessage('title', 'Title')} name={'title'} rules={requiredRule}>
            <Input/>
          </Form.Item>
          <Form.Item label={formatMessage('description', '描述')} name={'description'}>
            <TextArea maxLength={255} autoSize={{minRows: 3}}/>
          </Form.Item>
          {
            type === PublishType.BUILD_DEPLOY && (
              <Form.Item label={formatMessage('branch', 'branch')} name={'branch'} rules={requiredRule}>
                <Select placeholder="master" showSearch
                        onSearch={(item) => {
                          if (item) {
                            refreshBranchList(cluster!.git.url, item);
                          }
                        }}>
                  {
                    branchList.map((item: string) => {
                      return <Option value={item}>{item}</Option>
                    })
                  }
                </Select>
              </Form.Item>
            )
          }
        </Form>
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

      <SubmitCancelButton onSubmit={onSubmit} onCancel={() => history.goBack()}/>
    </PageWithBreadcrumb>
  )
}
