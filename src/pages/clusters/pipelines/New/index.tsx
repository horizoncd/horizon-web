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
  const {id, name, fullPath} = initialState?.resource || {};
  const {location} = props;
  const {query} = location;
  const {type = 'deploy'} = query;
  if (!type) {
    return <NotFount/>;
  }

  const formatMessage = (suffix: string, defaultMsg: string) => {
    return intl.formatMessage({id: `pages.pipelineNew.${suffix}`, defaultMessage: defaultMsg})
  }

  const diff = "-- a/core/controller/cluster/models.go\n" +
    "+++ b/core/controller/cluster/models.go\n" +
    "@@ -1 +1,11 @@\n" +
    " package cluster\n" +
    "+\n" +
    "+type Base struct {\n" +
    "+   Description string `json:\"description\"`\n" +
    "+   Git         *Git   `json:\"git\"`\n" +
    "+}\n" +
    "+\n" +
    "+// Git struct about git\n" +
    "+type Git struct {\n" +
    "+   Branch string `json:\"branch\"`\n" +
    "+}\n" +
    "--- a/lib/gitlab/gitlab.go\n" +
    "+++ b/lib/gitlab/gitlab.go\n" +
    "@@ -93,6 +93,11 @@ type Interface interface {\n" +
    "    // EditNameAndPathForProject update name and path for a specified project.\n" +
    "    // The pid can be the project's ID or relative path such as fist/second.\n" +
    "    EditNameAndPathForProject(ctx context.Context, pid interface{}, newName, newPath *string) error\n" +
    "+\n" +
    "+   // Compare branches, tags or commits.\n" +
    "+   // The pid can be the project's ID or relative path such as fist/second.\n" +
    "+   // See https://docs.gitlab.com/ee/api/repositories.html#compare-branches-tags-or-commits for more information.\n" +
    "+   Compare(ctx context.Context, pid interface{}, from, to string, straight *bool) (*gitlab.Compare, error)\n" +
    " }\n" +
    " \n" +
    " var _ Interface = (*helper)(nil)\n" +
    "@@ -360,6 +365,23 @@ func (h *helper) EditNameAndPathForProject(ctx context.Context, pid interface{},\n" +
    "    return nil\n" +
    " }\n" +
    " \n" +
    "+func (h *helper) Compare(ctx context.Context, pid interface{}, from, to string,\n" +
    "+   straight *bool) (_ *gitlab.Compare, err error) {\n" +
    "+   const op = \"gitlab: compare branchs\"\n" +
    "+   defer wlog.Start(ctx, op).Stop(func() string { return wlog.ByErr(err) })\n" +
    "+\n" +
    "+   compare, resp, err := h.client.Repositories.Compare(pid, &gitlab.CompareOptions{\n" +
    "+       From:     &from,\n" +
    "+       To:       &to,\n" +
    "+       Straight: straight,\n" +
    "+   }, gitlab.WithContext(ctx))\n" +
    "+   if err != nil {\n" +
    "+       return nil, parseError(op, resp, err)\n" +
    "+   }\n" +
    "+\n" +
    "+   return compare, nil\n" +
    "+}\n" +
    "+\n" +
    " func parseError(op errors.Op, resp *gitlab.Response, err error) error {\n" +
    "    if err == nil {\n" +
    "        return nil\n" +
    "--- a/pkg/cluster/dao/dao.go\n" +
    "+++ b/pkg/cluster/dao/dao.go\n" +
    "@@ -1 +1,57 @@\n" +
    " package dao\n" +
    "+\n" +
    "+import (\n" +
    "+   \"context\"\n" +
    "+\n" +
    "+   \"g.hz.netease.com/horizon/lib/orm\"\n" +
    "+   \"g.hz.netease.com/horizon/pkg/cluster/models\"\n" +
    "+   \"g.hz.netease.com/horizon/pkg/common\"\n" +
    "+)\n" +
    "+\n" +
    "+type DAO interface {\n" +
    "+   Create(ctx context.Context, cluster *models.Cluster) (*models.Cluster, error)\n" +
    "+   GetByName(ctx context.Context, name string) (*models.Cluster, error)\n" +
    "+   ListByApplication(ctx context.Context, application string) ([]*models.Cluster, error)\n" +
    "+}\n" +
    "+\n" +
    "+type dao struct {\n" +
    "+}\n" +
    "+\n" +
    "+func NewDAO() DAO {\n" +
    "+   return &dao{}\n" +
    "+}\n" +
    "+\n" +
    "+func (d *dao) Create(ctx context.Context, cluster *models.Cluster) (*models.Cluster, error) {\n" +
    "+   db, err := orm.FromContext(ctx)\n" +
    "+   if err != nil {\n" +
    "+       return nil, err\n" +
    "+   }\n" +
    "+\n" +
    "+   result := db.Create(cluster)\n" +
    "+\n" +
    "+   return cluster, result.Error\n" +
    "+}\n" +
    "+\n" +
    "+func (d *dao) GetByName(ctx context.Context, name string) (*models.Cluster, error) {\n" +
    "+   db, err := orm.FromContext(ctx)\n" +
    "+   if err != nil {\n" +
    "+       return nil, err\n" +
    "+   }\n" +
    "+\n" +
    "+   var cluster models.Cluster\n" +
    "+   result := db.Raw(common.ClusterQueryByName, name).First(&cluster)\n" +
    "+\n" +
    "+   return &cluster, result.Error\n" +
    "+}\n" +
    "+\n" +
    "+func (d *dao) ListByApplication(ctx context.Context, application string) ([]*models.Cluster, error) {\n" +
    "+   db, err := orm.FromContext(ctx)\n" +
    "+   if err != nil {\n" +
    "+       return nil, err\n" +
    "+   }\n" +
    "+\n" +
    "+   var clusters []*models.Cluster\n" +
    "+   result := db.Raw(common.ClusterQueryByApplication, application).Scan(&clusters)\n" +
    "+\n" +
    "+   return clusters, result.Error\n" +
    "+}"
  // const diff = "--- a/server/vendor/golang.org/x/sys/unix/zsyscall_linux_mipsle.go\n+++ b/server/vendor/golang.org/x/sys/unix/zsyscall_linux_mipsle.go\n@@ -1,7 +1,7 @@\n metadata:\n   name: web-api\n   namespace: music-cicd\n-  charVersion: v2.7.3\n+  charVersion: v2.7.4\n \n replicaCount: 2\n \n"

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

      <SubmitCancelButton onSubmit={onSubmit} onCancel={() => history.goBack()}/>
    </PageWithBreadcrumb>
  )
}
