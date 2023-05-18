import {
  Affix, Button, Col, Form, Row,
} from 'antd';
import { useRef, useState } from 'react';
import { useRequest } from 'umi';
import { useIntl } from '@@/plugin-locale/localeExports';
import { useModel } from '@@/plugin-model/useModel';
import type { FieldData } from 'rc-field-form/lib/interface';
import HSteps from '@/components/HSteps';
import Template from './Template';
import Basic from './Basic';
import Config from './Config';
import Audit from './Audit';
import styles from '../index.less';
import { createApplication, getApplication, updateApplication } from '@/services/applications/applications';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import { parseGitRef } from '@/services/code/code';

export default (props: any) => {
  const intl = useIntl();

  const name = 'name';
  const release = 'release';
  const priority = 'priority';
  const url = 'url';
  const branch = 'branch';
  const description = 'description';
  const subfolder = 'subfolder';
  const basicNeedValidFields = [
    name, release, priority, url, branch,
  ];

  const { initialState } = useModel('@@initialState');
  const { successAlert } = useModel('alert');
  const { id } = initialState!.resource;

  const { location } = props;
  const { pathname } = location;
  const creating = pathname.endsWith('newapplicationv1');
  const editing = pathname.endsWith('edit');

  const [form] = Form.useForm();
  const [current, setCurrent] = useState(0);
  const [template, setTemplate] = useState<API.Template>({ description: '', name: '' });
  const [basic, setBasic] = useState<FieldData[]>([]);
  const [config, setConfig] = useState({});
  const [configErrors, setConfigErrors] = useState({});

  // query application if editing
  if (editing) {
    const { data: app } = useRequest(() => getApplication(id), {
      onSuccess: () => {
        const {
          name: n,
          priority: p,
          description: d,
          git,
          templateInput,
          template: t,
          tags,
        } = app!;
        const { release: r, name: tn } = t;
        const { gitRefType, gitRef } = parseGitRef(git);
        const bas = [
          { name, value: n },
          { name: description, value: d },
          { name: release, value: r },
          { name: priority, value: p },
          { name: url, value: git.url },
          { name: 'tags', value: tags },
          { name: 'refType', value: gitRefType },
          { name: 'refValue', value: gitRef },
          { name: subfolder, value: git.subfolder },
        ];
        setBasic(bas);
        form.setFields(bas);
        setTemplate({ name: tn });
        setConfig(templateInput);
      },
    });
  }

  const resetTemplate = (newTemplate: API.Template) => {
    setTemplate(newTemplate);
    // reset selected release version
    if (newTemplate.name !== template?.name) {
      form.resetFields(['release']);
    }
  };

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

  const configHasError = () => {
    let hasError = false;
    Object.keys(configErrors).forEach((item) => {
      if (configErrors[item].length > 0) {
        hasError = true;
      }
    });

    return hasError;
  };

  const steps = [
    {
      title: intl.formatMessage({ id: 'pages.applicationNew.step.one' }),
      disabled: false,
    },
    {
      title: intl.formatMessage({ id: 'pages.applicationNew.step.two' }),
      disabled: !template.name,
    },
    {
      title: intl.formatMessage({ id: 'pages.applicationNew.step.three' }),
      disabled: !template.name || basicHasError(),
    },
    {
      title: intl.formatMessage({ id: 'pages.applicationNew.step.four' }),
      disabled: !template.name || basicHasError() || configHasError(),
    },
  ];

  const currentIsValid = async () => {
    let valid: boolean;
    switch (current) {
      case 0:
        valid = !!template.name;
        break;
      case 1:
        try {
          await form.validateFields(basicNeedValidFields);
          valid = true;
        } catch (e: any) {
          const { errorFields } = e;
          valid = !errorFields.length;
        }
        break;
      case 2:
        valid = !configHasError();
        break;
      default:
        valid = true;
    }

    return valid;
  };

  const configRef = useRef();

  const next = async () => {
    if (await currentIsValid()) {
      setCurrent(current + 1);
    }
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  const nextBtnDisabled = () => {
    switch (current) {
      case 0:
        return !template.name;
      case 1:
        return basicHasError();
      case 2:
        return configHasError();
      default:
        return false;
    }
  };

  const { loading, run: submitApp } = useRequest((cfg: any) => {
    const info = {
      name: form.getFieldValue(name),
      description: form.getFieldValue(description) || '',
      priority: form.getFieldValue(priority),
      template: {
        name: template.name,
        release: form.getFieldValue(release),
      },
      tags: form.getFieldValue('tags') || [],
      git: {
        url: form.getFieldValue(url),
        subfolder: form.getFieldValue(subfolder) || '',
        [form.getFieldValue('refType')]: form.getFieldValue('refValue'),
      },
      templateInput: cfg || config,
    };
    if (creating) {
      return createApplication(id, info);
    }
    return updateApplication(id, info);
  }, {
    manual: true,
    onSuccess: (res: API.Application) => {
      successAlert(creating ? intl.formatMessage({ id: 'pages.applicationNew.success' }) : intl.formatMessage({ id: 'pages.applicationEdit.success' }));
      // jump to application's home page
      window.location.href = res.fullPath;
    },
  });

  const onSubmit = (formData: any) => {
    submitApp(formData);
  };

  const onCurrentChange = async (cur: number) => {
    if (cur < current || await currentIsValid()) {
      setCurrent(cur);
    }
  };

  const setBasicFormData = (changingFiled: FieldData[], allFields: FieldData[]) => {
    setBasic(allFields);
  };

  return (
    <PageWithBreadcrumb>
      <Row>
        <Col span={4}>
          <Affix offsetTop={50}>
            <div className={styles.step}>
              <HSteps current={current} onChange={onCurrentChange} steps={steps} />
            </div>
          </Affix>
        </Col>
        <Col span={20}>
          <div className={styles.stepsContent}>
            {
              current === 0 && <Template template={template} resetTemplate={resetTemplate} />
            }
            {
              current === 1 && (
                <Basic
                  form={form}
                  template={template}
                  formData={basic}
                  setFormData={setBasicFormData}
                  editing={editing}
                />
              )
            }
            {
              current === 2 && (
                <Config
                  template={template}
                  release={form.getFieldValue(release)}
                  config={config}
                  setConfig={setConfig}
                  setConfigErrors={setConfigErrors}
                />
              )
            }
            {
              current === 3
              && (
                <Audit
                  form={form}
                  template={template}
                  release={form.getFieldValue(release)}
                  formRef={configRef}
                  config={config}
                  onSubmit={onSubmit}
                />
              )
            }
          </div>
          <div className={styles.stepsAction}>
            {current > 0 && (
              <Button style={{ margin: '0 8px' }} onClick={() => prev()}>
                {intl.formatMessage({ id: 'pages.common.back' })}
              </Button>
            )}
            {current === steps.length - 1 && (
              <Button type="primary" onClick={() => { configRef.current.submit(); }} loading={loading}>
                {intl.formatMessage({ id: 'pages.common.submit' })}
              </Button>
            )}
            {current < steps.length - 1 && (
              <Button type="primary" disabled={nextBtnDisabled()} onClick={() => next()}>
                {intl.formatMessage({ id: 'pages.common.next' })}
              </Button>
            )}
          </div>
        </Col>
      </Row>
    </PageWithBreadcrumb>
  );
};
