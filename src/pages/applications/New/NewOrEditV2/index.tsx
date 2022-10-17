import { useIntl } from '@@/plugin-locale/localeExports';
import {
  Button, Card, Col, Form, Input, Row,
} from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useRequest } from '@@/plugin-request/request';
import { useModel } from '@@/plugin-model/useModel';
// eslint-disable-next-line import/no-extraneous-dependencies
import { FieldData } from 'rc-field-form/lib/interface';
import { useHistory } from 'umi';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import styles from '@//pages/applications/New/index.less';
import HSteps from '@/components/HSteps';
import Basic from '@/pages/applications/New/NewOrEditV1/Basic';
import BuildConfig from '@/pages/applications/New/NewOrEditV2/BuildConfig';
import {
  applicationVersion2,
  createApplicationV2,
  getApplicationV2,
  updateApplicationV2,
} from '@/services/applications/applications';
import Config from './Config';
import { API } from '@/services/typings';
import { parseGitRef } from '@/services/code/code';
import Template from '@/pages/applications/New/NewOrEditV1/Template';

export default (props: any) => {
  const history = useHistory();
  const intl = useIntl();
  const [current, setCurrent] = useState(0);
  const { location } = props;
  const { pathname } = location;
  const { initialState, refresh } = useModel('@@initialState');
  const { id } = initialState!.resource;
  const { fullPath } = initialState!.resource;
  const creating = pathname.endsWith('newapplicationv2');
  const editing = pathname.endsWith('editv2');
  const { successAlert } = useModel('alert');

  const [form] = Form.useForm();
  const [basic, setBasic] = useState<FieldData[]>([]);
  const [buildConfig, setBuildConfig] = useState({});
  const [buildConfigErrors, setBuildConfigErrors] = useState<[]>([]);
  const [templateBasic, setTemplateBasic] = useState<API.Template>({ description: '', name: '' });
  const [releaseName, setReleaseName] = useState<string>();
  const [templateConfig, setTemplateConfig] = useState({});
  const [templateConfigErrors, setTemplateConfigErrors] = useState({});

  // query application if editing
  const nameKey = 'name';
  const priorityKey = 'priority';
  const gitURLKey = 'url';
  const descriptionKey = 'description';
  const subFolderKey = 'subfolder';
  const refTypeKey = 'refType';
  const refValueKey = 'refValue';
  if (editing) {
    const { data: getAppResp } = useRequest(() => getApplicationV2(id), {
      onSuccess: () => {
        // set form data
        const { gitRefType, gitRef } = parseGitRef(getAppResp!.git);
        const basicInfo = [
          { name: nameKey, value: getAppResp!.name },
          { name: descriptionKey, value: getAppResp!.description },
          { name: priorityKey, value: getAppResp!.priority },
          { name: gitURLKey, value: getAppResp!.git.url },
          { name: refTypeKey, value: gitRefType },
          { name: refValueKey, value: gitRef },
          { name: subFolderKey, value: getAppResp!.git.subfolder },
        ];
        // used for basic
        setBasic(basicInfo);
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
      name: form.getFieldValue(nameKey),
      description: form.getFieldValue(descriptionKey),
      buildConfig,
      priority: form.getFieldValue(priorityKey),
      templateConfig,
      templateInfo: { name: templateBasic.name, release: releaseName! },
      git: {
        url: form.getFieldValue(gitURLKey),
        subfolder: form.getFieldValue(subFolderKey) || '',
        [form.getFieldValue(refTypeKey)]: form.getFieldValue(refValueKey),
      },
    };
    if (creating) {
      return createApplicationV2(id, createReq);
    }
    return updateApplicationV2(id, createReq);
  }, {
    manual: true,
  });

  const basicHasError = () => {
    let hasError = false;
    for (let i = 0; i < basic!.length; i += 1) {
      const val = basic![i];
      if (val.errors && val.errors.length > 0) {
        hasError = true;
      }
    }
    return hasError;
  };

  const buildConfigHasErr = (config: any) => {
    if (config && config.length > 0) {
      return true;
    }
    return false;
  };

  const templateConfigHasError = (config: any) => {
    if (config && config.length > 0) {
      return true;
    }
    return false;
  };

  const currentStepIsValid = (currentValue: number) => {
    let valid: boolean;
    switch (currentValue) {
      case 0:
        valid = !basicHasError();
        break;
      case 1:
        valid = !buildConfigHasErr(buildConfigErrors);
        break;
      case 2:
        valid = !!templateBasic.name && !buildConfigHasErr(buildConfigErrors);
        break;
      case 3:
      case 4:
        valid = !!releaseName && !buildConfigHasErr(buildConfigErrors) && !templateConfigHasError(templateConfigErrors);
        break;
      default:
        valid = true;
    }
    return valid;
  };

  const steps = [
    {
      title: intl.formatMessage({ id: 'pages.applicationNewV2.step.one' }),
      disabled: !currentStepIsValid(0),
    }, {
      title: intl.formatMessage({ id: 'pages.applicationNewV2.step.two' }),
      disabled: !currentStepIsValid(1),
    }, {
      title: intl.formatMessage({ id: 'pages.applicationNewV2.step.three' }),
      disabled: !currentStepIsValid(2),
    }, {
      title: intl.formatMessage({ id: 'pages.applicationNewV2.step.four' }),
      disabled: !currentStepIsValid(3),
    }, {
      title: intl.formatMessage({ id: 'pages.applicationNewV2.step.five' }),
      disabled: !currentStepIsValid(4),
    },
  ];

  const selectedTemplateInfo = () => {
    const templateTitle = intl.formatMessage({ id: 'pages.applicationNewV2.step.three' });
    const formatMessage = (suffix: string, defaultMsg?: string) => intl.formatMessage({
      id: `pages.applicationNew.basic.${suffix}`,
      defaultMessage: defaultMsg,
    });
    return (
      <Card title={templateTitle} className={styles.gapBetweenCards}>
        <Form.Item label={formatMessage('template', 'template')}>
          <Input disabled value={templateBasic.name} />
        </Form.Item>
        <Form.Item label={formatMessage('release')}>
          <Input disabled value={releaseName} />
        </Form.Item>
      </Card>
    );
  };

  const onCurrentChange = (cur: number) => {
    setCurrent(cur);
  };
  const prev = () => {
    setCurrent(current - 1);
  };
  const next = () => {
    if (currentStepIsValid(current)) {
      setCurrent(current + 1);
    }
  };

  const buildConfigRef = useRef();
  const templateConfigRef = useRef();
  const setBasicFormData = (changingFiled: FieldData[], allFields: FieldData[]) => {
    setBasic(allFields);
  };
  const resetTemplate = (newTemplate: API.Template) => {
    setTemplateBasic(newTemplate);
    if (newTemplate.name !== templateBasic?.name) {
      setReleaseName('');
    }
  };

  const [buildSubmitted, setBuildSubmitted] = useState(false);
  const [templateConfigSubmitted, setTemplateConfigSubmitted] = useState(false);

  useEffect(() => {
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
    }
  }, [templateConfigSubmitted, buildConfigErrors, submitApp, successAlert, creating,
    intl, history, refresh, fullPath, buildSubmitted]);

  return (
    <PageWithBreadcrumb>
      <Row>
        <Col span={4}>
          <div className={styles.step} />
          <HSteps current={current} onChange={onCurrentChange} steps={steps} />
        </Col>
        <Col span={20}>
          <div className={styles.stepsContent}>
            {
              // basic
              current === 0 && (
                <Basic
                  form={form}
                  formData={basic}
                  setFormData={setBasicFormData}
                  editing={editing}
                  version={applicationVersion2}
                />
              )
            }
            {
              // build config
              current === 1 && (
                <BuildConfig
                  config={buildConfig}
                  setConfig={setBuildConfig}
                  setConfigErrors={setBuildConfigErrors}
                />
              )
            }
            {
              // deploy template
              current === 2 && (
                <Template
                  template={templateBasic}
                  resetTemplate={resetTemplate}
                />
              )
            }
            {
              // deploy config
              current === 3 && (
                <Config
                  template={templateBasic}
                  release={releaseName}
                  config={templateConfig}
                  setConfig={setTemplateConfig}
                  setReleaseName={setReleaseName}
                  setConfigErrors={setTemplateConfigErrors}
                />
              )
            }
            {
              // audit, list all the content
              current === 4 && (
                <div>
                  <Basic
                    form={form}
                    version={applicationVersion2}
                    readonly
                  />
                  <BuildConfig
                    readonly
                    config={buildConfig}
                    ref={buildConfigRef}
                    onSubmit={(schema: any) => {
                      setBuildConfig(schema.formData);
                      setBuildSubmitted(true);
                    }}
                  />
                  <div>{selectedTemplateInfo()}</div>
                  <Config
                    template={templateBasic}
                    release={releaseName}
                    config={templateConfig}
                    ref={templateConfigRef}
                    onSubmit={(schema: any) => {
                      setTemplateConfigSubmitted(true);
                      setTemplateConfig(schema.formData);
                    }}
                    readonly
                  />
                </div>
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
