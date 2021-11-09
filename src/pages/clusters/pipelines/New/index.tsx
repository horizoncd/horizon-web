import styles from "@/pages/clusters/NewOrEdit/index.less";
import {Card, Form, Input, notification} from "antd";
import {useIntl} from "@@/plugin-locale/localeExports";
import TextArea from "antd/es/input/TextArea";
import CodeDiff from '@/components/CodeDiff'
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import SubmitCancelButton from '@/components/SubmitCancelButton';
import {useModel} from "@@/plugin-model/useModel";
import NotFount from "@/pages/404";
import {PublishType} from "@/const";
import {buildDeploy, deploy, diffsOfCode} from "@/services/clusters/clusters";
import {history} from 'umi'
import {useRequest} from "@@/plugin-request/request";

export default (props: any) => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const {initialState} = useModel('@@initialState');
  const {id, fullPath} = initialState?.resource || {};
  const {location} = props;
  const {query} = location;
  const {type = 'deploy'} = query;
  if (!type) {
    return <NotFount/>;
  }

  const formatMessage = (suffix: string, defaultMsg: string) => {
    return intl.formatMessage({id: `pages.pipelineNew.${suffix}`, defaultMessage: defaultMsg})
  }

  const {data, run: refreshDiff} = useRequest((branch) => diffsOfCode(id!, branch), {
    manual: true,
  })

  const hookAfterSubmit = () => {
    notification.success({
      message: formatMessage('submit', 'Pipeline Started'),
    });
    // jump to pods' url
    history.push(`/clusters${fullPath}/-/pods`)
  }

  const onSubmit = () => {
    const info = {
      title: form.getFieldValue('name'),
      description: form.getFieldValue('description'),
    }
    if (type === PublishType.BUILD_DEPLOY) {
      form.validateFields(['name', 'branch']).then(() => {
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
      form.validateFields(['name']).then(() => {
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
              onFieldsChange={(a) => {
                // query regions when environment selected
                if (a[0].name[0] === 'branch') {
                  refreshDiff(a[0].value)
                }
              }}
        >
          <Form.Item label={formatMessage('title', 'Title')} name={'title'} required>
            <Input/>
          </Form.Item>
          <Form.Item label={formatMessage('description', '描述')} name={'description'}>
            <TextArea maxLength={255}/>
          </Form.Item>
          {
            type === PublishType.BUILD_DEPLOY && (
              <Form.Item label={ formatMessage('branch', 'branch') } name={ 'branch' } required>
                <Input placeholder="master" />
              </Form.Item>
            )
          }
        </Form>
      </Card>

      <Card title={formatMessage('changes', '变更')} className={styles.gapBetweenCards}>
        <Card title={formatMessage('config', '代码变更')} className={styles.gapBetweenCards}>
          <b>Commit ID</b>: {data?.codeInfo.commitID}
          <br/>
          <b>Commit Log</b>: {data?.codeInfo.commitMsg}
          <br/>
          <b>Commit History</b>: <a href={data?.codeInfo.link}>History</a>
        </Card>
        <Card title={formatMessage('config', '配置变更')} className={styles.gapBetweenCards}>
          <CodeDiff diff={data?.configDiff || ''}/>
        </Card>
      </Card>

      <SubmitCancelButton onSubmit={onSubmit} onCancel={() => history.goBack()}/>
    </PageWithBreadcrumb>
  )
}
