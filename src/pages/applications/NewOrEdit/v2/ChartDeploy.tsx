import { useIntl } from '@@/plugin-locale/localeExports';
import {
  Affix,
  Button, Col, Form, Row,
} from 'antd';
import {
  useEffect, useMemo, useRef, useState,
} from 'react';
import { useRequest } from '@@/plugin-request/request';
import { useModel } from '@@/plugin-model/useModel';
import { useHistory } from 'umi';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import styles from '@/pages/applications/NewOrEdit/index.less';
import BaseInfoForm from '@/components/neworedit/components/BaseInfoForm';
import {
  createApplicationV2,
  getApplicationV2,
  updateApplicationV2,
} from '@/services/applications/applications';
import TemplateForm from '@/components/neworedit/components/TemplateForm';
import { AppOrClusterType, ResourceKey } from '@/const';
import DeployConfigForm from '@/components/neworedit/components/DeployConfigForm';
import { CatalogType } from '@/services/core';
import { ModalInfo } from '../components/DeployModal';
import { queryTemplate } from '@/services/templates/templates';

export default (props: any) => {
  const history = useHistory<{ template?: API.Template }>();
  const intl = useIntl();
  const { location } = props;
  const { pathname } = location;
  const { initialState, refresh } = useModel('@@initialState');
  useEffect(() => {
    refresh();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const { id } = initialState!.resource;
  const { fullPath } = initialState!.resource;
  const creating = pathname.endsWith('newapplicationv2/chart');
  const editing = pathname.endsWith('editv2/chart');
  const { successAlert } = useModel('alert');

  const [form] = Form.useForm();
  const [baseInfoValid, setBaseInfoValid] = useState<boolean>(false);
  const [deployConfigValid, setDeployConfigValid] = useState<boolean>(false);
  const [templateBasic, setTemplateBasic] = useState<API.Template>(history.location.state?.template ?? { description: '', name: '' });
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

  const { data: template } = useRequest(() => queryTemplate(templateBasic.name));

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

  const isValid = useMemo(
    () => baseInfoValid && !!templateBasic.name && deployConfigValid,
    [baseInfoValid, deployConfigValid, templateBasic.name],
  );

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
          if (result) {
            ModalInfo({
              onOk: () => {
                const url = `/applications${result.fullPath}/-/newinstancev2/chart`;
                window.history.pushState({ template: { name: templateBasic.name } }, '', url);
                // window.history.state = { template: { name: templateBasic.name } };
                window.location.href = url;
              },
              onCancel: () => { window.location.href = result.fullPath; },
              intl,
            });
          } else {
            history.push({
              pathname: fullPath,
            });
          }
        });
        setTemplateConfigSubmitted(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [templateConfigSubmitted],
  );

  return (
    <PageWithBreadcrumb>
      <Row gutter={20}>
        {
          template && (template?.description ?? '') !== '' && (
          <Col span={3} offset={1} style={{ marginTop: '15px' }}>
            <Affix offsetTop={60}>
              <span>
                <b>{`${template.name}: `}</b>
                <div dangerouslySetInnerHTML={{ __html: template.description ?? '' }} />
              </span>
            </Affix>
          </Col>
          )
        }
        <Col span={20} offset={(template?.description ?? '') === '' ? 2 : 0}>
          <div className={styles.stepsContent}>
            {
              // basic
              (
                <BaseInfoForm
                  form={form}
                  appType={AppOrClusterType.CHART}
                  editing={editing}
                  setValid={setBaseInfoValid}
                />
              )
            }
            {
            !(history.location.state?.template) && (
              <TemplateForm
                template={templateBasic}
                resetTemplate={resetTemplate}
                type={[CatalogType.Database, CatalogType.Middleware, CatalogType.Other]}
              />
            )
            }
            {
              // deploy config
              (
               (!editing || releaseName) && (
               <DeployConfigForm
                 template={templateBasic}
                 release={releaseName}
                 setReleaseName={setReleaseName}
                 templateConfig={templateConfig}
                 ref={templateConfigRef}
                 onSubmit={(formData: any) => {
                   setTemplateConfig(formData);
                   setTemplateConfigSubmitted(true);
                 }}
                 setTemplateConfig={setTemplateConfig}
                 setValid={setDeployConfigValid}
               />
               )
              )
            }
          </div>
          <div className={styles.stepsAction}>
            <Button
              type="primary"
              onClick={() => {
                templateConfigRef.current.submit();
              }}
              loading={loading}
              disabled={!isValid}
            >
              {intl.formatMessage({ id: 'pages.common.submit' })}
            </Button>
          </div>
        </Col>
      </Row>
    </PageWithBreadcrumb>
  );
};
