import { useIntl } from '@@/plugin-locale/localeExports';
import {
  Affix, Button, Col, Form, Row,
} from 'antd';
import {
  useEffect, useMemo, useRef, useState,
} from 'react';
import { useRequest } from '@@/plugin-request/request';
import { useModel } from '@@/plugin-model/useModel';
import { useHistory } from 'umi';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import styles from '@//pages/applications/NewOrEdit/index.less';
import HSteps from '@/components/HSteps';
import BaseInfoForm from '../../../../components/neworedit/components/BaseInfoForm';
import {
  createApplicationV2,
  getApplicationV2,
  updateApplicationV2,
} from '@/services/applications/applications';
import TemplateForm from '../../../../components/neworedit/components/TemplateForm';
import { MaxSpace } from '@/components/Widget';
import { AppOrClusterType, ResourceKey } from '@/const';
import DeployConfigForm from '../../../../components/neworedit/components/DeployConfigForm';
import { CatalogType } from '@/services/core';

export default (props: any) => {
  const history = useHistory<{ template?: Templates.Template }>();
  const intl = useIntl();
  const [current, setCurrent] = useState(0);
  const { location } = props;
  const { pathname } = location;
  const { initialState, refresh } = useModel('@@initialState');
  const { id } = initialState!.resource;
  const { fullPath } = initialState!.resource;
  const creating = pathname.endsWith('newapplicationv2/chart');
  const editing = pathname.endsWith('editv2/chart');
  const { successAlert } = useModel('alert');

  const { template } = history.location.state;
  const pageOrders = useMemo(() => (template ? [0, 2, 3] : [0, 1, 2, 3]), [template]);

  const [form] = Form.useForm();
  const [baseInfoValid, setBaseInfoValid] = useState<boolean>(false);
  const [deployConfigValid, setDeployConfigValid] = useState<boolean>(false);
  const [templateBasic, setTemplateBasic] = useState<API.Template>(template ?? { description: '', name: '' });
  const [releaseName, setReleaseName] = useState<string>('');
  const [templateConfig, setTemplateConfig] = useState<Object>({});
  const [templateConfigSubmitted, setTemplateConfigSubmitted] = useState(false);

  // query application if editing
  if (editing) {
    const { data: getAppResp } = useRequest(() => getApplicationV2(id), {
      onSuccess: () => {
        // set form data
        const basicInfo = [
          { name: ResourceKey.NAME, value: getAppResp!.name },
          { name: ResourceKey.DESCRIPTION, value: getAppResp!.description },
          { name: ResourceKey.PRIORITY, value: getAppResp!.priority },
          { name: ResourceKey.TAGS, value: getAppResp!.tags },
          { name: ResourceKey.IMAGE_URL, value: getAppResp!.image },
        ];
        // used for basic
        form.setFields(basicInfo);
        // used for config
        setTemplateConfig(getAppResp!.templateConfig);
        setReleaseName(getAppResp!.templateInfo!.release);

        const basicTemplateInfo: API.Template = {
          name: getAppResp!.templateInfo!.name,
        };
        setTemplateBasic(basicTemplateInfo);
      },
    });
  }

  const { loading, run: submitApp } = useRequest(() => {
    const createReq: API.CreateOrUpdateRequestV2 = {
      name: form.getFieldValue(ResourceKey.NAME),
      description: form.getFieldValue(ResourceKey.DESCRIPTION),
      priority: form.getFieldValue(ResourceKey.PRIORITY),
      templateInfo: { name: templateBasic.name, release: releaseName! },
      templateConfig,
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
        valid = baseInfoValid && !!templateBasic.name;
        break;
      case 2:
      case 3:
        valid = baseInfoValid && !!templateBasic.name && deployConfigValid;
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
      title: intl.formatMessage({ id: 'pages.newV2.deploy.template' }),
      disabled: !currentStepIsValid(0),
    }, {
      title: intl.formatMessage({ id: 'pages.newV2.deploy.config' }),
      disabled: !currentStepIsValid(1),
    }, {
      title: intl.formatMessage({ id: 'pages.newV2.step.audit' }),
      disabled: !currentStepIsValid(2),
    },
  ].filter((_, index) => pageOrders.includes(index));

  const onCurrentChange = (cur: number) => {
    setCurrent(cur);
  };
  const prev = () => {
    setCurrent(current - 1);
  };
  const next = () => {
    setCurrent(current + 1);
  };

  const templateConfigRef = useRef();
  const resetTemplate = (newTemplate: API.Template) => {
    setTemplateBasic(newTemplate);
    if (newTemplate.name !== templateBasic?.name) {
      setReleaseName('');
    }
  };

  useEffect(
    () => {
      if (templateConfigSubmitted) {
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
        setTemplateConfigSubmitted(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [templateConfigSubmitted],
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
                  appType={AppOrClusterType.CHART}
                  editing={editing}
                  setValid={setBaseInfoValid}
                />
              )
            }
            {
            current === 1 && pageOrders.includes(current) && (
              <TemplateForm
                template={templateBasic}
                resetTemplate={resetTemplate}
                type={[CatalogType.Database, CatalogType.Middleware, CatalogType.Other]}
              />
            )
            }
            {
              // deploy config
              pageOrders[current] === 2 && (
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
              pageOrders[current] === 3 && (
                <MaxSpace
                  direction="vertical"
                  size="middle"
                >
                  <BaseInfoForm
                    form={form}
                    appType={AppOrClusterType.IMAGE}
                    readOnly
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
