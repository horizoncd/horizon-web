import {Button, Col, Divider, Form, notification, Row, Steps} from 'antd';
import Template from './template';
import Basic from './basic';
import Config from './config';
import Audit from './audit';
import {useState} from 'react';
import NotFount from '@/pages/404';
import {getGroupByID} from '@/services/groups/groups';
import {useRequest} from 'umi';
import './index.less';
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

  const {parentID, application} = props.location.query;
  const creating = props.location.pathname.endsWith('new')
  const editing = props.location.pathname.endsWith('edit')

  const intParentID = parseInt(parentID, 10);
  if (creating && (!parentID || Number.isNaN(intParentID))) {
    return <NotFount/>;
  }

  if (!editing && !application) {
    return <NotFount/>;
  }

  const [form] = Form.useForm();
  const [current, setCurrent] = useState(0);
  const [template, setTemplate] = useState<API.Template>({description: "", name: ""});
  const [basic, setBasic] = useState<FieldData[]>([]);
  const [config, setConfig] = useState({});
  const [configErrors, setConfigErrors] = useState({});
  const [parent, setParent] = useState<API.Group>();
  const [groupID, setGroupID] = useState(intParentID);

  const {data} = useRequest(() => {
    if (groupID) {
      getGroupByID({id: groupID});
    }
  }, {
    onSuccess: () => {
      setParent(data)
      console.log(parent)
    },
    refreshDeps: [groupID]
  });

  // query application if editing
  if (editing) {
    const {data: app} = useRequest(() => getApplication(application), {
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
        setTemplate({name: tn})
        setConfig(templateInput)
        setGroupID(gID)
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
      title: '选择服务模版',
      disabled: false,
    },
    {
      title: '配置服务',
      disabled: !template.name,
    },
    {
      title: '自定义配置',
      disabled: !template.name || basicHasError()
    },
    {
      title: '审计',
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
    // 要校验字段是否均合法，才能进入下一步
    if (await currentIsValid()) {
      setCurrent(current + 1);
    }
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  const header = creating ? `正在为【 ${parent?.name} 】创建应用，请按步骤填写信息` : `正在编辑【${application}】，请按步骤填写信息`;

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


  const submitFunc = creating ? createApplication : updateApplication
  const {loading, run} = useRequest(submitFunc, {
    manual: true,
    onSuccess: () => {
      notification.success({
        message: creating ? intl.formatMessage({ id: 'pages.applicationNew.success' }) : intl.formatMessage({ id: 'pages.applicationEdit.success' }),
      });
      // jump to application's home page
      window.location.href = `${parent?.fullPath}/${form.getFieldValue(name)}`;
    }
  });

  // final submit, check everything
  const onSubmit = () => {
    const p = creating ? intParentID : application
    run(p, {
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
    })
  };

  const onCurrentChange = async (cur: number) => {
    if (await currentIsValid()) {
      setCurrent(cur);
    }
  }

  const setBasicFormData = (changingFiled: FieldData[], data: FieldData[]) => {
    // clear config if release has been changed
    if (changingFiled[0].name[0] === release) {
      setConfig({})
    }
    setBasic(data)
  }

  return (
    <Row>
      <Col span={22} offset={1}>
        <h3 className={'header'}>{header}</h3>
        <Divider className={'divider'}/>
        <Row>
          <Col span={4}>
            <div className={'step'}>
              <Steps current={current} onChange={onCurrentChange} direction="vertical">
                {steps.map((item, index) => {
                  return (
                    <Step
                      key={`Step ${index + 1}`}
                      title={`第 ${index + 1} 步`}
                      description={item.title}
                      disabled={item.disabled}
                    />
                  );
                })}
              </Steps>
            </div>
          </Col>
          <Col span={20}>
            <div className="steps-content">
              {
                current === 0 && <Template template={template} resetTemplate={resetTemplate}/>
              }
              {
                current === 1 && <Basic form={form} template={template} formData={basic} setFormData={setBasicFormData} editing/>
              }
              {
                current === 2 && <Config template={template} release={form.getFieldValue(release)} config={config}
                                         setConfig={setConfig} setConfigErrors={setConfigErrors}
                />
              }
              {
                current === 3 && <Audit form={form} template={template} release={form.getFieldValue(release)} config={config}/>
              }
            </div>
            <div className="steps-action">
              {current > 0 && (
                <Button style={{margin: '0 8px'}} onClick={() => prev()}>
                  上一步
                </Button>
              )}
              {current === steps.length - 1 && (
                <Button type="primary" onClick={onSubmit} loading={loading}>
                  提交
                </Button>
              )}
              {current < steps.length - 1 && (
                <Button type="primary" disabled={nextBtnDisabled()} onClick={() => next()}>
                  下一步
                </Button>
              )}
            </div>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};
