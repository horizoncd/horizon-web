import { useRequest } from '@@/plugin-request/request';
import { useEffect, useRef, useState } from 'react';
import { useModel } from '@@/plugin-model/useModel';
import { useIntl } from '@@/plugin-locale/localeExports';
import { useHistory } from 'umi';
import {
  Button, Card, Select, Space, Tabs,
} from 'antd';
import TabPane from 'antd/lib/tabs/TabPane';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import Basic from '../Basic';
import {
  deleteApplication,
  getApplicationEnvTemplate,
  getApplicationV2,
  updateApplicationEnvTemplateV2,
  updateApplicationTags,
} from '@/services/applications/applications';
import { Param } from '@/components/DetailCard';
import utils from '@/utils';
import { parseGitRef } from '@/services/code/code';
import styles from '@/pages/applications/Detail/index.less';
import { queryEnvironments } from '@/services/environments/environments';
import BuildConfig from '@/pages/applications/NewOrEdit/v2/BuildConfig';
import TemplateConfig from '@/pages/applications/NewOrEdit/v2/Config';
import { CenterSpin, MaxSpace } from '@/components/Widget';
import { TagCard } from '@/components/tag';
import rbac from '@/rbac';

const { Option } = Select;

export default () => {
  const intl = useIntl();
  const { initialState } = useModel('@@initialState');
  const { id, name: applicationName, fullPath: applicationFullPath } = initialState!.resource;
  const { successAlert } = useModel('alert');
  const history = useHistory();
  const defaultApplication: API.GetApplicationResponseV2 = {
    id: 0,
    name: '',
    description: '',
    priority: '',
    git: {
      url: '',
      subfolder: '',
      branch: '',
      tag: '',
      commit: '',
    },
    buildConfig: null,
    templateInfo: {
      name: '',
      release: '',
    },
    templateConfig: null,
    manifest: null,

    fullPath: '',
    groupID: 0,
    createdAt: '',
    updatedAt: '',
    tags: [],
  };
  const [templateBasic, setTemplateBasic] = useState<API.Template>({ description: '', name: '' });
  const [application, setApplication] = useState<API.GetApplicationResponseV2>(defaultApplication);
  const [buildConfig, setBuildConfig] = useState({});
  const [buildConfigErrors, setBuildConfigErrors] = useState<[]>([]);
  const [templateConfig, setTemplateConfig] = useState({});
  const [templateConfigErrors, setTemplateConfigErrors] = useState<[]>([]);
  const [releaseName, setReleaseName] = useState<string>();
  const { gitRefType, gitRef } = parseGitRef({
    httpURL: '',
    url: application.git?.url || '',
    subfolder: application.git?.subfolder || '',
    branch: application.git?.branch || '',
    tag: application.git?.tag || '',
    commit: application.git?.commit || '',
  });
  const serviceDetail: Param[][] = [
    [
      { key: intl.formatMessage({ id: 'pages.applicationNew.basic.name' }), value: application.name },
      { key: intl.formatMessage({ id: 'pages.applicationNew.basic.description' }), value: application.description || '' },
      { key: intl.formatMessage({ id: 'pages.applicationNew.basic.priority' }), value: application.priority },
    ],
    [
      {
        key: intl.formatMessage({ id: 'pages.applicationDetail.basic.release' }),
        value: `${application.templateInfo!.name}-${application.templateInfo!.release}`,
      },
      { key: intl.formatMessage({ id: 'pages.applicationNew.basic.url' }), value: application.git?.url },
      {
        key: intl.formatMessage({ id: `pages.clusterDetail.basic.${gitRefType}` }),
        value: gitRef,
      },
      { key: intl.formatMessage({ id: 'pages.applicationNew.basic.subfolder' }), value: application.git?.subfolder },
    ],
    [
      {
        key: intl.formatMessage({ id: 'pages.applicationDetail.basic.createTime' }),
        value: utils.timeToLocal(application.createdAt),
      },
      {
        key: intl.formatMessage({ id: 'pages.applicationDetail.basic.updateTime' }),
        value: utils.timeToLocal(application.updatedAt),
      },
    ],
  ];
  const { run: refreshApplication } = useRequest(
    () => getApplicationV2(id).then(({ data: result }) => {
      const basic: API.Template = {
        name: result.templateInfo!.name,
      };
      setBuildConfig(result.buildConfig);
      setTemplateConfig(result.templateConfig);
      setTemplateBasic(basic);
      setReleaseName(result.templateInfo!.release);
      setApplication(result);
    }),
    {
      manual: true,
    },
  );
  useEffect(() => {
    refreshApplication();
  }, [refreshApplication]);

  const { run: delApplication } = useRequest(() => deleteApplication(id).then(() => {
    successAlert(intl.formatMessage({ id: 'pages.applicationDelete.success' }));
    window.location.href = applicationFullPath.substring(0, applicationFullPath.lastIndexOf('/'));
  }), {
    manual: true,
  });

  const onEditClick = () => {
    if (application.git?.url) {
      history.push({
        pathname: `/applications${applicationFullPath}/-/editv2/gitimport`,
      });
    } else if (application.image) {
      history.push({
        pathname: `/applications${applicationFullPath}/-/editv2/imagedeploy`,
      });
    }
  };

  const { data: environments } = useRequest(() => queryEnvironments());

  const [editing, setEditing] = useState(false);
  const [currentEnv, setCurrentEnv] = useState('');

  const templateInputHasError = () => {
    if (buildConfigErrors.length > 0
      || templateConfigErrors.length > 0) {
      return true;
    }
    return false;
  };
  const [buildSubmitted, setBuildSubmitted] = useState(false);
  const [templateConfigSubmitted, setTemplateConfigSubmitted] = useState(false);
  const buildConfigRef = useRef();
  const templateConfigRef = useRef();
  useEffect(() => {
    if (templateConfigSubmitted && (buildSubmitted || !buildConfigRef.current)) {
      const updateData: API.AppSchemeConfigs = {
        application: templateConfig,
        pipeline: buildConfig,
      };
      updateApplicationEnvTemplateV2(id, currentEnv, updateData).then(() => {
        successAlert(intl.formatMessage({ id: 'pages.message.template.update.success' }));
      });
      setTemplateConfigSubmitted(false);
      setBuildSubmitted(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildConfig, buildSubmitted, templateConfig, templateConfigSubmitted]);

  if (application.id === 0) {
    return (
      <PageWithBreadcrumb>
        <CenterSpin />
      </PageWithBreadcrumb>
    );
  }

  return (
    <PageWithBreadcrumb>
      <MaxSpace direction="vertical">
        <Basic
          id={id}
          name={applicationName}
          refreshApplication={refreshApplication}
          delApplication={delApplication}
          onEditClick={onEditClick}
          serviceDetail={serviceDetail}
        />
        <Tabs>
          <TabPane
            tab={intl.formatMessage({ id: 'pages.applicationDetail.basic.config' })}
            key="config"
          >
            <Card
              title={(
                <span className={styles.cardTitle}>{intl.formatMessage({ id: 'pages.applicationDetail.basic.config' })}</span>)}
              type="inner"
              extra={(
                <div>
                  <Space>
                    <Button
                      type={editing ? 'primary' : 'default'}
                      disabled={editing && templateInputHasError()}
                      onClick={() => {
                        if (editing) {
                          templateConfigRef.current.submit();
                          if (buildConfigRef.current) {
                            buildConfigRef.current.submit();
                          }
                        }
                        setEditing((prev) => !prev);
                      }}
                    >
                      {editing ? intl.formatMessage({ id: 'pages.common.submit' }) : intl.formatMessage({ id: 'pages.common.edit' })}
                    </Button>
                    {
              editing && (
                <Button
                  onClick={() => {
                    setEditing(false);
                    getApplicationEnvTemplate(id, currentEnv).then(({ data }) => {
                      setBuildConfig(data.pipeline);
                      setTemplateConfig(data.application);
                    });
                  }}
                >
                  {intl.formatMessage({ id: 'pages.common.cancel' })}
                </Button>
              )
            }
                    <Select
                      value={currentEnv}
                      onSelect={(val: string) => {
                        getApplicationEnvTemplate(id, val).then(({ data }) => {
                          setBuildConfig(data.pipeline);
                          setTemplateConfig(data.application);
                        });
                        setCurrentEnv(val);
                      }}
                    >
                      <Option key="default" value="">
                        {intl.formatMessage({ id: 'pages.common.default' })}
                      </Option>
                      {environments?.map((item) => (
                        <Option key={item.name} value={item.name}>
                          {item.displayName}
                        </Option>
                      ))}
                    </Select>
                  </Space>
                </div>
        )}
            >
              <MaxSpace
                direction="vertical"
                size="middle"
              >
                {!!application.git?.url && !!buildConfig && (
                  <BuildConfig
                    readOnly={!editing}
                    ref={buildConfigRef}
                    buildConfig={buildConfig}
                    setBuildConfig={setBuildConfig}
                    setBuildConfigErrors={setBuildConfigErrors}
                    onSubmit={(formData: any) => {
                      setBuildConfig(formData);
                      setBuildSubmitted(true);
                    }}
                  />
                )}
                <TemplateConfig
                  ref={templateConfigRef}
                  envTemplate
                  readOnly={!editing}
                  template={templateBasic}
                  release={releaseName}
                  templateConfig={templateConfig}
                  setTemplateConfig={setTemplateConfig}
                  setTemplateConfigErrors={setTemplateConfigErrors}
                  onSubmit={(formData: any) => {
                    setTemplateConfig(formData);
                    setTemplateConfigSubmitted(true);
                  }}
                />
              </MaxSpace>
            </Card>
          </TabPane>
          <TabPane tab={intl.formatMessage({ id: 'pages.tags.normal' })} key="tags">
            <TagCard
              tags={application.tags}
              title={intl.formatMessage({ id: 'pages.tags.normal' })}
              onUpdate={(tags) => updateApplicationTags(id, tags).then(refreshApplication)}
              extra={
              (
                <Button
                  disabled={!rbac.Permissions.updateApplicationTags.allowed}
                  onClick={
                    () => history.push({
                      pathname: `/applications${applicationFullPath}/-/tags`,
                    })
                  }
                >
                  {intl.formatMessage({ id: 'pages.tags.normal.manage' })}
                </Button>
              )
            }
            />

          </TabPane>
        </Tabs>
      </MaxSpace>
    </PageWithBreadcrumb>
  );
};
