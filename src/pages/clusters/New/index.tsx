import {Button, Col, Divider, Form, notification, Row, Steps} from 'antd';
import Basic from './basic';
import Config from './config';
import Audit from './audit';
import {useState} from 'react';
import {useRequest} from 'umi';
import './index.less';
import {getApplication} from '@/services/applications/applications';
import {useIntl} from "@@/plugin-locale/localeExports";
import {createCluster} from "@/services/clusters/clusters";

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
  const branch = 'branch'
  const description = 'description'
  const basicNeedValidFields = [
    name, branch
  ]

  const {application} = props.location.query;

  const [form] = Form.useForm();
  const [current, setCurrent] = useState(0);
  const [basic, setBasic] = useState<FieldData[]>([]);
  const [config, setConfig] = useState({});
  const [configErrors, setConfigErrors] = useState({});

  const {data: parent} = useRequest(() => getApplication(application), {
  });

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
      title: '配置服务',
      disabled: false,
    },
    {
      title: '自定义配置',
      disabled: basicHasError()
    },
    {
      title: '审计',
      disabled: basicHasError() || configHasError()
    },
  ];

  const currentIsValid = async () => {
    let valid: boolean;
    switch (current) {
      case 0:
        try {
          await form.validateFields(basicNeedValidFields)
          valid = true
        } catch (e: any) {
          const {errorFields} = e
          valid = !errorFields.length
        }
        break;
      case 1:
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

  const header = `正在为【 ${application} 】创建集群，请按步骤填写信息`;

  const nextBtnDisabled = () => {
    switch (current) {
      case 0:
        return basicHasError()
      case 1:
        return configHasError()
      default:
        return false;
    }
  };


  const {loading, run} = useRequest(createCluster, {
    manual: true,
    onSuccess: () => {
      notification.success({
        message: intl.formatMessage({ id: 'pages.applicationNew.success' }) ,
      });
      // jump to application's home page
      window.location.href = `${parent?.fullPath}/${form.getFieldValue(name)}`;
    }
  });

  // final submit, check everything
  const onSubmit = () => {
    run()
  };

  const onCurrentChange = async (cur: number) => {
    if (await currentIsValid()) {
      setCurrent(cur);
    }
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
                current === 0 && <Basic form={form} formData={basic} setFormData={setBasic} />
              }
              {
                current === 1 && <Config config={config} setConfig={setConfig} setConfigErrors={setConfigErrors}
                />
              }
              {
                current === 2 && <Audit form={form} config={config}/>
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
