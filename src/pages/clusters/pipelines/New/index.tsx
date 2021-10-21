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
import {buildDeploy, deploy} from "@/services/clusters/clusters";
import {history} from 'umi'

export default (props: any) => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const {initialState} = useModel('@@initialState');
  const {name, fullPath} = initialState?.resource || {};
  const {location} = props;
  const {query} = location;
  const {type = 'deploy'} = query;
  if (!type) {
    return <NotFount/>;
  }

  const formatMessage = (suffix: string, defaultMsg: string) => {
    return intl.formatMessage({id: `pages.pipelineNew.${suffix}`, defaultMessage: defaultMsg})
  }

  const diff = "--- a/server/vendor/golang.org/x/sys/unix/zsyscall_linux_mipsle.go\n+++ b/server/vendor/golang.org/x/sys/unix/zsyscall_linux_mipsle.go\n@@ -1,7 +1,7 @@\n metadata:\n   name: web-api\n   namespace: music-cicd\n-  charVersion: v2.7.3\n+  charVersion: v2.7.4\n \n replicaCount: 2\n \n"

  const hookAfterSubmit = () => {
    notification.success({
      message: formatMessage('submit', 'Submit succeed'),
    });
    // jump to pods' url
    history.push(`${fullPath}/-/pods`)
  }

  const onSubmit = () => {
    const info = {
      title: form.getFieldValue('name'),
      description: form.getFieldValue('description'),
    }
    if (type === PublishType.BUILD_DEPLOY) {
      form.validateFields(['name', 'branch']).then(() => {
        buildDeploy(name!, {
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
        deploy(name!, info).then(() => {
          hookAfterSubmit()
        })
      });
    }
  }

  return (
    <PageWithBreadcrumb>
      <Card title={formatMessage('title', '基础信息')} className={styles.gapBetweenCards}>
        <Form layout={'vertical'} form={form} requiredMark={'optional'}>
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
          <b>old版本</b>: abc
          <br/>
          <b>new版本</b>: def
          <br/>
          <a href="https://www.baidu.com"> diffLink</a>
        </Card>
        <Card title={formatMessage('config', '配置变更')} className={styles.gapBetweenCards}>
          <CodeDiff diff={diff}/>
        </Card>
      </Card>

      <SubmitCancelButton onSubmit={onSubmit}/>
    </PageWithBreadcrumb>
  )
}
