import { useRequest } from '@@/plugin-request/request';
import { useEffect, useRef, useState } from 'react';
import { useModel } from '@@/plugin-model/useModel';
import { useIntl } from '@@/plugin-locale/localeExports';
import { useHistory } from 'umi';
import { Button, Card, Select } from 'antd';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import Basic from '../Basic';
import {
  deleteApplication,
  getApplicationEnvTemplate,
  getApplicationV2,
  updateApplicationEnvTemplateV2,
} from '@/services/applications/applications';
import { API } from '@/services/typings';
import { Param } from '@/components/DetailCard';
import utils from '@/utils';
import { parseGitRef } from '@/services/code/code';
import styles from '@/pages/applications/Detail/index.less';
import { queryEnvironments } from '@/services/environments/environments';
import BuildConfig from '@/pages/applications/New/NewOrEditV2/BuildConfig';
import TemplateConfig from '@/pages/applications/New/NewOrEditV2/Config';

const { Option } = Select;

export default () => {
  const intl = useIntl();
  const { initialState } = useModel('@@initialState');
  const { id, name: applicationName, fullPath: applicationFullPath } = initialState!.resource;
  const { successAlert } = useModel('alert');

  const history = useHistory();
  const defaultApplication: API.GetApplicationResponse2 = {
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
  };
  const [templateBasic, setTemplateBasic] = useState<API.Template>({ description: '', name: '' });
  const [application, setApplication] = useState<API.GetApplicationResponse2>(defaultApplication);
  const [buildConfig, setBuildConfig] = useState({});
  const [buildConfigErrors, setBuildConfigErrors] = useState<[]>([]);
  const [templateConfig, setTemplateConfig] = useState({});
  const [templateConfigErrors, setTemplateConfigErrors] = useState<[]>([]);
  const [releaseName, setReleaseName] = useState<string>();

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
    history.push({
      pathname: `/applications${applicationFullPath}/-/editv2`,
    });
  };

  const { gitRefType, gitRef } = parseGitRef(application!.git);
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
      { key: intl.formatMessage({ id: 'pages.applicationNew.basic.url' }), value: application.git.url },
      {
        key: intl.formatMessage({ id: `pages.clusterDetail.basic.${gitRefType}` }),
        value: gitRef,
      },
      { key: intl.formatMessage({ id: 'pages.applicationNew.basic.subfolder' }), value: application.git.subfolder },
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
    if (templateConfigSubmitted && buildSubmitted) {
      const updateData: API.AppSchemeConfigs = {
        application: templateConfig,
        pipeline: buildConfig,
      };
      updateApplicationEnvTemplateV2(id, currentEnv, updateData).then(() => {
        successAlert('模板更新成功');
      });
      setTemplateConfigSubmitted(false);
      setBuildSubmitted(false);
    }
  }, [buildConfig, buildSubmitted, currentEnv, id,
    successAlert, templateConfig, templateConfigSubmitted]);

  return (
    <PageWithBreadcrumb>
      <Basic
        id={id}
        name={applicationName}
        refreshApplication={refreshApplication}
        delApplication={delApplication}
        onEditClick={onEditClick}
        serviceDetail={serviceDetail}
      />
      <Card
        title={(
          <span className={styles.cardTitle}>{intl.formatMessage({ id: 'pages.applicationDetail.basic.config' })}</span>)}
        type="inner"
        extra={(
          <div>
            <Button
              type={editing ? 'primary' : 'default'}
              disabled={editing && templateInputHasError()}
              onClick={() => {
                if (editing) {
                  templateConfigRef.current.submit();
                  buildConfigRef.current.submit();
                }
                setEditing((prev) => !prev);
              }}
            >
              {editing ? '提交' : '编辑'}
            </Button>
            {
              editing && (
                <Button
                  style={{ marginLeft: '10px' }}
                  onClick={() => {
                    setEditing(false);
                    getApplicationEnvTemplate(id, currentEnv).then(({ data }) => {
                      setBuildConfig(data.pipeline);
                      setTemplateConfig(data.application);
                    });
                  }}
                >
                  取消
                </Button>
              )
            }
            <Select
              style={{ minWidth: '100px', marginLeft: '10px' }}
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
                默认
              </Option>
              {environments?.map((item) => (
                <Option key={item.name} value={item.name}>
                  {item.displayName}
                </Option>
              ))}
            </Select>
          </div>
        )}
      >
        <BuildConfig
          readonly={!editing}
          ref={buildConfigRef}
          config={buildConfig}
          setConfig={setBuildConfig}
          setConfigErrors={setBuildConfigErrors}
          onSubmit={(schema: any) => {
            setBuildConfig(schema.formData);
            setBuildSubmitted(true);
          }}
        />
        <TemplateConfig
          ref={templateConfigRef}
          template={templateBasic}
          release={releaseName}
          config={templateConfig}
          readonly={!editing}
          setConfig={setTemplateConfig}
          setConfigErrors={setTemplateConfigErrors}
          envTemplate
          onSubmit={(schema: any) => {
            setTemplateConfig(schema.formData);
            setTemplateConfigSubmitted(true);
          }}
        />
      </Card>
    </PageWithBreadcrumb>
  );
};
