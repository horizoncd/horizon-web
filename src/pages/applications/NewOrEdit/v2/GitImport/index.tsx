import { useIntl } from '@@/plugin-locale/localeExports';
import {
  Affix, Button, Col, Form, Row,
} from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useRequest } from '@@/plugin-request/request';
import { useModel } from '@@/plugin-model/useModel';
import { useHistory } from 'umi';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import styles from '@//pages/applications/NewOrEdit/index.less';
import HSteps from '@/components/HSteps';
import BaseInfoForm from '../components/BaseInfoForm';
import {
  createApplicationV2,
  getApplicationV2,
  updateApplicationV2,
} from '@/services/applications/applications';
import TemplateForm from '@/pages/applications/NewOrEdit/v2/components/TemplateForm';
import { parseGitRef } from '@/services/code/code';
import { MaxSpace } from '@/components/Widget';
import { AppOrClusterType, ResourceKey } from '@/const';
import BuildConfigForm from '../components/BuildConfigForm';
import DeployConfigForm from '../components/DeployConfigForm';

export default (props: any) => {
  const history = useHistory();
  const intl = useIntl();
  const [current, setCurrent] = useState(0);
  const { location } = props;
  const { pathname } = location;
  const { initialState, refresh } = useModel('@@initialState');
  const { id } = initialState!.resource;
  const { fullPath } = initialState!.resource;
  const creating = pathname.endsWith('newapplicationv2/gitimport');
  const editing = pathname.endsWith('editv2/gitimport');
  const { successAlert } = useModel('alert');

  const [form] = Form.useForm();
  const [buildConfig, setBuildConfig] = useState<Object>({});
  const [baseInfoValid, setBaseInfoValid] = useState<boolean>(false);
  const [buildConfigValid, setBuildConfigValid] = useState<boolean>(true);
  const [deployConfigValid, setDeployConfigValid] = useState<boolean>(false);
  const [templateBasic, setTemplateBasic] = useState<API.Template>({ description: '', name: '' });
  const [releaseName, setReleaseName] = useState<string>('');
  const [templateConfig, setTemplateConfig] = useState<Object>({});

  // query application if editing
  if (editing) {
    const { data: getAppResp } = useRequest(() => getApplicationV2(id), {
      onSuccess: () => {
        // set form data
        const { gitRefType, gitRef } = parseGitRef(getAppResp!.git);
        const basicInfo = [
          { name: ResourceKey.NAME, value: getAppResp!.name },
          { name: ResourceKey.DESCRIPTION, value: getAppResp!.description },
          { name: ResourceKey.PRIORITY, value: getAppResp!.priority },
          { name: ResourceKey.TAGS, value: getAppResp!.tags },
          { name: ResourceKey.GIT_URL, value: getAppResp!.git.url },
          { name: ResourceKey.GIT_REF_TYPE, value: gitRefType },
          { name: ResourceKey.GIT_REF_VALUE, value: gitRef },
          { name: ResourceKey.GIT_SUB_FOLDER, value: getAppResp!.git.subfolder },
        ];
        // used for basic
        form.setFields(basicInfo);
        // used for build
        setBuildConfig(getAppResp!.buildConfig);
        // used for config
        setTemplateConfig(getAppResp!.templateConfig);
        setReleaseName(getAppResp!.templateInfo!.release);

        const basicTemplateInfo: API.Template = {
          name: getAppResp!.templateInfo!.name,
        };
        setTemplateBasic(basicTemplateInfo);
        setBuildConfig(getAppResp!.buildConfig);
      },
    });
  }

  const { loading, run: submitApp } = useRequest(() => {
    const createReq: API.CreateOrUpdateRequestV2 = {
      name: form.getFieldValue(ResourceKey.NAME),
      description: form.getFieldValue(ResourceKey.DESCRIPTION),
      buildConfig,
      priority: form.getFieldValue(ResourceKey.PRIORITY),
      templateConfig,
      templateInfo: { name: templateBasic.name, release: releaseName! },
      tags: form.getFieldValue(ResourceKey.TAGS) || [],
      git: {
        url: form.getFieldValue(ResourceKey.GIT_URL),
        subfolder: form.getFieldValue(ResourceKey.GIT_SUB_FOLDER) || '',
        [form.getFieldValue(ResourceKey.GIT_REF_TYPE)]: form.getFieldValue(ResourceKey.GIT_REF_VALUE),
      },
    };
    if (creating) {
      return createApplicationV2(id, createReq);
    }
    return updateApplicationV2(id, createReq);
  }, {
    manual: true,
  });

  const currentStepIsValid = (cur: number) => {
    let valid: boolean;
    switch (cur) {
      case 0:
        valid = baseInfoValid;
        break;
      case 1:
        valid = baseInfoValid && buildConfigValid;
        break;
      case 2:
        valid = baseInfoValid && buildConfigValid && !!templateBasic.name;
        break;
      case 3:
      case 4:
        valid = baseInfoValid && buildConfigValid && !!templateBasic.name
          && deployConfigValid;
        break;
      default:
        valid = true;
    }
    return valid;
  };

  const steps = [
    {
      title: intl.formatMessage({ id: 'pages.newV2.step.basic' }),
      disabled: false,
    }, {
      title: intl.formatMessage({ id: 'pages.newV2.step.build' }),
      disabled: !currentStepIsValid(0),
    }, {
      title: intl.formatMessage({ id: 'pages.newV2.deploy.template' }),
      disabled: !currentStepIsValid(1),
    }, {
      title: intl.formatMessage({ id: 'pages.newV2.deploy.config' }),
      disabled: !currentStepIsValid(2),
    }, {
      title: intl.formatMessage({ id: 'pages.newV2.step.audit' }),
      disabled: !currentStepIsValid(3),
    },
  ];

  const onCurrentChange = (cur: number) => {
    setCurrent(cur);
  };
  const prev = () => {
    setCurrent(current - 1);
  };
  const next = () => {
    setCurrent(current + 1);
  };

  const buildConfigRef = useRef();
  const templateConfigRef = useRef();
  const resetTemplate = (newTemplate: API.Template) => {
    setTemplateBasic(newTemplate);
    if (newTemplate.name !== templateBasic?.name) {
      setReleaseName('');
    }
  };

  const [buildSubmitted, setBuildSubmitted] = useState(false);
  const [templateConfigSubmitted, setTemplateConfigSubmitted] = useState(false);

  useEffect(
    () => {
      if (templateConfigSubmitted && buildSubmitted) {
        submitApp().then((result) => {
          successAlert(creating ? intl.formatMessage({ id: 'pages.applicationNew.success' })
            : intl.formatMessage({ id: 'pages.applicationEdit.success' }));
          let destPath;
          if (result) {
            destPath = result.fullPath;
          } else {
            destPath = fullPath;
          }
          history.push({
            pathname: destPath,
          });
          refresh().then();
        });
        setBuildSubmitted(false);
        setTemplateConfigSubmitted(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [templateConfigSubmitted, buildSubmitted],
  );

  return (
    <PageWithBreadcrumb>
      <Row>
        <Col span={4}>
          <Affix offsetTop={50}>
            <div className={styles.step} />
            <HSteps current={current} onChange={onCurrentChange} steps={steps} />
          </Affix>
        </Col>
        <Col span={20}>
          <div className={styles.stepsContent}>
            {
              // basic
              current === 0 && (
                <BaseInfoForm
                  form={form}
                  appType={AppOrClusterType.GIT_IMPORT}
                  editing={editing}
                  setValid={setBaseInfoValid}
                />
              )
            }
            {
              // build config
              current === 1 && (
                <BuildConfigForm
                  buildConfig={buildConfig}
                  setBuildConfig={setBuildConfig}
                  setValid={setBuildConfigValid}
                />
              )
            }
            {
              // deploy template
              current === 2 && (
                <TemplateForm
                  template={templateBasic}
                  resetTemplate={resetTemplate}
                />
              )
            }
            {
              // deploy config
              current === 3 && (
                <DeployConfigForm
                  template={templateBasic}
                  release={releaseName}
                  setReleaseName={setReleaseName}
                  templateConfig={templateConfig}
                  setTemplateConfig={setTemplateConfig}
                  setValid={setDeployConfigValid}
                />
              )
            }
            {
              // audit, list all the content
              current === 4 && (
                <MaxSpace
                  direction="vertical"
                  size="middle"
                >
                  <BaseInfoForm
                    form={form}
                    appType={AppOrClusterType.GIT_IMPORT}
                    readOnly
                  />
                  <BuildConfigForm
                    readOnly
                    buildConfig={buildConfig}
                    ref={buildConfigRef}
                    onSubmit={(formData: any) => {
                      setBuildConfig(formData);
                      setBuildSubmitted(true);
                    }}
                  />
                  <DeployConfigForm
                    readOnly
                    template={templateBasic}
                    release={releaseName}
                    templateConfig={templateConfig}
                    ref={templateConfigRef}
                    onSubmit={(formData: any) => {
                      setTemplateConfig(formData);
                      setTemplateConfigSubmitted(true);
                    }}
                  />
                </MaxSpace>
              )
            }
          </div>
          <div className={styles.stepsAction}>
            {current > 0 && (
              <Button style={{ margin: '0 8px' }} onClick={() => prev()}>
                {intl.formatMessage({ id: 'pages.common.back' })}
              </Button>
            )}
            {current < steps.length - 1 && (
              <Button type="primary" disabled={!currentStepIsValid(current)} onClick={() => next()}>
                {intl.formatMessage({ id: 'pages.common.next' })}
              </Button>
            )}
            {current === steps.length - 1 && (
              <Button
                type="primary"
                onClick={() => {
                  templateConfigRef.current.submit();
                  buildConfigRef.current.submit();
                }}
                loading={loading}
              >
                {intl.formatMessage({ id: 'pages.common.submit' })}
              </Button>
            )}
          </div>
        </Col>
      </Row>
    </PageWithBreadcrumb>
  );
};
