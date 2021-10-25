import {Button, Col, Divider, Form, notification, Row, Steps} from 'antd';
import Template from './Template';
import Basic from './Basic';
import Config from './Config';
import Audit from './Audit';
import {useState} from 'react';
import NotFount from '@/pages/404';
import {getGroupByID} from '@/services/groups/groups';
import {useRequest} from 'umi';
import styles from './index.less';
import {createApplication, getApplication, updateApplication} from '@/services/applications/applications';
import {useIntl} from "@@/plugin-locale/localeExports";

const {Step} = Steps;

interface FieldData {
  name: string | number | (string | number)[];
  value?: any;
  touched?: boolean;
  validating?: boolean;
  errors?: string[];
}

export default (props: any) => {
  const intl = useIntl();

  const name = 'name'
  const release = 'release'
  const priority = 'priority'
  const url = 'url'
  const branch = 'branch'
  const description = 'description'
  const subfolder = 'subfolder'
  const basicNeedValidFields = [
    name, release, priority, url, branch
  ]

  const {location} = props;
  const {query, pathname} = location;
  const {parentID, applicationID} = query;
  const creating = pathname.endsWith('new')
  const editing = pathname.endsWith('edit')

  const intParentID = parseInt(parentID, 10);
  if (creating && (!parentID || Number.isNaN(intParentID))) {
    return <NotFount/>;
  }

  const intApplicationID = parseInt(applicationID, 10);
  if (editing && (!applicationID || Number.isNaN(intApplicationID))) {
    return <NotFount/>;
  }

  const [form] = Form.useForm();
  const [current, setCurrent] = useState(0);
  const [template, setTemplate] = useState<API.Template>({description: "", name: ""});
  const [basic, setBasic] = useState<FieldData[]>([]);
  const [config, setConfig] = useState({});
  const [configErrors, setConfigErrors] = useState({});
  const [parent, setParent] = useState<API.Group>();
  const [application, setApplication] = useState<API.Application>();

  const {data, run: refreshParent} = useRequest((groupID) => getGroupByID({id: groupID}), {
    onSuccess: () => {
      setParent(data)
    },
    manual: true,
  });

  // query parent if creating
  if (creating) {
    const {data: parentData} = useRequest(() => getGroupByID({id: intParentID}), {
      onSuccess: () => {
        setParent(parentData)
      }
    });
  }

  // query application if editing
  if (editing) {
    const {data: app} = useRequest(() => getApplication(intApplicationID), {
      onSuccess: () => {
        const {
          groupID: gID,
          name: n,
          priority: p,
          description: d,
          git,
          templateInput,
          template: t,
        } = app!
        const {url: u, branch: b, subfolder: s} = git
        const {release: r, name: tn} = t
        setBasic([
            {name, value: n},
            {name: description, value: d},
            {name: release, value: r},
            {name: priority, value: p},
            {name: url, value: u},
            {name: branch, value: b},
            {name: subfolder, value: s},
          ]
        )
        setApplication(app)
        setTemplate({name: tn})
        setConfig(templateInput)
        refreshParent(gID)
      }
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
        hasError = true
      }
    }

    return hasError
  }

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
      title: intl.formatMessage({id: 'pages.applicationNew.step.one'}),
      disabled: false,
    },
    {
      title: intl.formatMessage({id: 'pages.applicationNew.step.two'}),
      disabled: !template.name,
    },
    {
      title: intl.formatMessage({id: 'pages.applicationNew.step.three'}),
      disabled: !template.name || basicHasError()
    },
    {
      title: intl.formatMessage({id: 'pages.applicationNew.step.four'}),
      disabled: !template.name || basicHasError() || configHasError()
    },
  ];

  const currentIsValid = async () => {
    let valid: boolean;
    switch (current) {
      case 0:
        valid = !!template.name
        break;
      case 1:
        try {
          await form.validateFields(basicNeedValidFields)
          valid = true
        } catch (e: any) {
          const {errorFields} = e
          valid = !errorFields.length
        }
        break;
      case 2:
        valid = !configHasError()
        break;
      default:
        valid = true
    }

    return valid
  }

  const next = async () => {
    if (await currentIsValid()) {
      setCurrent(current + 1);
    }
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  const header = creating ? intl.formatMessage({id: 'pages.applicationNew.header'}, {group: <b>{parent?.name}</b>})
    : intl.formatMessage({id: 'pages.applicationEdit.header'}, {application: <b>{application?.name}</b>});

  const nextBtnDisabled = () => {
    switch (current) {
      case 0:
        return !template.name;
      case 1:
        return basicHasError()
      case 2:
        return configHasError()
      default:
        return false;
    }
  };

  const {loading, run: onSubmit} = useRequest(() => {
    const info = {
      name: form.getFieldValue(name),
      description: form.getFieldValue(description),
      priority: form.getFieldValue(priority),
      template: {
        name: template.name,
        release: form.getFieldValue(release),
      },
      git: {
        url: form.getFieldValue(url),
        subfolder: form.getFieldValue(subfolder),
        branch: form.getFieldValue(branch),
      },
      templateInput: config,
    }
    if (creating) {
      return createApplication(intParentID, info)
    }
    return updateApplication(intApplicationID, info)
  }, {
    manual: true,
    onSuccess: (res: API.Application) => {
      notification.success({
        message: creating ? intl.formatMessage({id: 'pages.applicationNew.success'}) : intl.formatMessage({id: 'pages.applicationEdit.success'}),
      });
      // jump to application's home page
      window.location.href = res.fullPath;
    }
  });

  const onCurrentChange = async (cur: number) => {
    if (cur < current || await currentIsValid()) {
      setCurrent(cur);
    }
  }

  const setBasicFormData = (changingFiled: FieldData[], allFields: FieldData[]) => {
    // clear config if release has been changed
    if (changingFiled[0].name[0] === release) {
      setConfig({})
    }
    setBasic(allFields)
  }

  return (
    <Row>
      <Col span={22} offset={1}>
        <div className={styles.header}>{header}</div>
        <Divider className={styles.divider}/>
        <Row>
          <Col span={4}>
            <div className={styles.step}>
              <Steps current={current} onChange={onCurrentChange} direction="vertical">
                {steps.map((item, index) => {
                  return (
                    <Step
                      key={`Step ${index + 1}`}
                      title={intl.formatMessage({id: 'pages.applicationNew.step.message'}, {index: index + 1})}
                      description={item.title}
                      disabled={item.disabled}
                    />
                  );
                })}
              </Steps>
            </div>
          </Col>
          <Col span={20}>
            <div className={styles.stepsContent}>
              {
                current === 0 && <Template template={template} resetTemplate={resetTemplate}/>
              }
              {
                current === 1 && <Basic form={form} template={template} formData={basic} setFormData={setBasicFormData}
                                        editing={editing}/>
              }
              {
                current === 2 && <Config template={template} release={form.getFieldValue(release)} config={config}
                                         setConfig={setConfig} setConfigErrors={setConfigErrors}
                />
              }
              {
                current === 3 &&
                <Audit form={form} template={template} release={form.getFieldValue(release)} config={config}/>
              }
            </div>
            <div className={styles.stepsAction}>
              {current > 0 && (
                <Button style={{margin: '0 8px'}} onClick={() => prev()}>
                  {intl.formatMessage({id: 'pages.common.back'})}
                </Button>
              )}
              {current === steps.length - 1 && (
                <Button type="primary" onClick={onSubmit} loading={loading}>
                  {intl.formatMessage({id: 'pages.common.submit'})}
                </Button>
              )}
              {current < steps.length - 1 && (
                <Button type="primary" disabled={nextBtnDisabled()} onClick={() => next()}>
                  {intl.formatMessage({id: 'pages.common.next'})}
                </Button>
              )}
            </div>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};
