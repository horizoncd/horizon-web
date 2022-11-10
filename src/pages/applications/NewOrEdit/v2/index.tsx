import { useIntl } from '@@/plugin-locale/localeExports';
import {
  Button, Col, Form, Row,
} from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useRequest } from '@@/plugin-request/request';
import { useModel } from '@@/plugin-model/useModel';
// eslint-disable-next-line import/no-extraneous-dependencies
import { FieldData } from 'rc-field-form/lib/interface';
import { useHistory } from 'umi';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import styles from '@//pages/applications/NewOrEdit/index.less';
import HSteps from '@/components/HSteps';
import Basic from '@/pages/applications/NewOrEdit/v2/Basic';
import BuildConfig from '@/pages/applications/NewOrEdit/v2/BuildConfig';
import {
  createApplicationV2,
  getApplicationV2,
  updateApplicationV2,
} from '@/services/applications/applications';
import { pipelineV2 } from '@/services/version/version';
import Config from '@/pages/applications/NewOrEdit/v2/Config';
import Template from '@/pages/applications/NewOrEdit/v1/Template';
import { API } from '@/services/typings';
import { parseGitRef } from '@/services/code/code';
import { MaxSpace } from '@/components/Widget';

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
  const [releaseName, setReleaseName] = useState<string>('');
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
  const basicFieldsToValidate = [
    nameKey, priorityKey, gitURLKey,
  ];

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
    if (editing && basic.length === 0) {
      return false;
    }
    let hasError = true;
    let validatedNum = 0;
    for (let i = 0; i < basic!.length; i += 1) {
      const val = basic![i];
      if (val.errors && val.errors.length > 0) {
        break;
      }
      if (val.name.length > 0 && basicFieldsToValidate.includes(val.name[0]) && val.value) {
        validatedNum += 1;
      }
    }
    if (validatedNum === basicFieldsToValidate.length) {
      hasError = false;
    }
    return hasError;
  };

  const configHasError = (config: any) => {
    if (config && config.length > 0) {
      return true;
    }
    return false;
  };

  const currentStepIsValid = (cur: number) => {
    let valid: boolean;
    switch (cur) {
      case 0:
        valid = !basicHasError();
        break;
      case 1:
        valid = !basicHasError() && !configHasError(buildConfigErrors);
        break;
      case 2:
        valid = !basicHasError() && !configHasError(buildConfigErrors) && !!templateBasic.name;
        break;
      case 3:
      case 4:
        valid = !basicHasError() && !configHasError(buildConfigErrors) && !!templateBasic.name
          && !!releaseName && !configHasError(templateConfigErrors);
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
                  version={pipelineV2}
                />
              )
            }
            {
              // build config
              current === 1 && (
                <BuildConfig
                  buildConfig={buildConfig}
                  setBuildConfig={setBuildConfig}
                  setBuildConfigErrors={setBuildConfigErrors}
                />
              )
            }
            {
              // deploy template
              current === 2 && (
                <Template
                  apiVersion="v2"
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
                  setReleaseName={setReleaseName}
                  templateConfig={templateConfig}
                  setTemplateConfig={setTemplateConfig}
                  setTemplateConfigErrors={setTemplateConfigErrors}
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
                  <Basic
                    form={form}
                    version={pipelineV2}
                    readOnly
                  />
                  <BuildConfig
                    readOnly
                    buildConfig={buildConfig}
                    ref={buildConfigRef}
                    onSubmit={(formData: any) => {
                      setBuildConfig(formData);
                      setBuildSubmitted(true);
                    }}
                  />
                  <Config
                    ref={templateConfigRef}
                    readOnly
                    template={templateBasic}
                    release={releaseName}
                    templateConfig={templateConfig}
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
