import {Button, Col, Divider, Form, notification, Row, Steps} from 'antd';
import Basic from './basic';
import Config from './config';
import Audit from './audit';
import {useState} from 'react';
import NotFount from '@/pages/404';
import {useRequest} from 'umi';
import styles from './index.less';
import {useIntl} from "@@/plugin-locale/localeExports";
import {createCluster, getCluster, updateCluster} from "@/services/clusters/clusters";

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
  const url = 'url'
  const branch = 'branch'
  const description = 'description'
  const subfolder = 'subfolder'
  const env = 'env'
  const region = 'region'
  const basicNeedValidFields = [
    name, branch, env, region
  ]

  const {location} = props;
  const {query, pathname} = location;
  const {application, cluster, env: envFromQuery} = query;
  const creating = pathname.endsWith('new')
  const editing = pathname.endsWith('edit')

  if (creating && !application) {
    return <NotFount/>;
  }

  if (editing && !cluster) {
    return <NotFount/>;
  }

  const [form] = Form.useForm();
  const [current, setCurrent] = useState(0);
  const [template, setTemplate] = useState<{ name: string, release: string }>({release: "", name: ""});
  const [basic, setBasic] = useState<FieldData[]>([{
    name: env, value: envFromQuery
  }]);
  const [config, setConfig] = useState({});
  const [configErrors, setConfigErrors] = useState({});

  // query application if editing
  if (editing) {
    const {data: clusterData} = useRequest(() => getCluster(cluster), {
      onSuccess: () => {
        const {
          name: n,
          description: d,
          git,
          template: t,
          templateInput,
          scope
        } = clusterData!
        const {url: u, branch: b, subfolder: s} = git
        const {env: e, region: r} = scope
        setBasic([
            {name, value: n},
            {name: description, value: d},
            {name: branch, value: b},
            {name: env, value: e},
            {name: region, value: r},
            {name: url, value: u},
            {name: branch, value: b},
            {name: subfolder, value: s},
          ]
        )
        setConfig(templateInput)
        setTemplate(t)
      }
    });
  }

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
      title: intl.formatMessage({id: 'pages.clusterNew.step.one'}),
      disabled: false,
    },
    {
      title: intl.formatMessage({id: 'pages.clusterNew.step.two'}),
      disabled: basicHasError()
    },
    {
      title: intl.formatMessage({id: 'pages.clusterNew.step.three'}),
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
    if (await currentIsValid()) {
      setCurrent(current + 1);
    }
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  const header = creating ? intl.formatMessage({id: 'pages.clusterNew.header'}, {application: <b>{application}</b>})
    : intl.formatMessage({id: 'pages.clusterEdit.header'}, {cluster: <b>{cluster}</b>});

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

  const {loading, run: onSubmit} = useRequest(() => {
    const info = {
      name: form.getFieldValue(name),
      description: form.getFieldValue(description),
      git: {
        branch: form.getFieldValue(branch),
      },
      templateInput: config,
    }
    if (creating) {
      return createCluster(application, '', info)
    }
    return updateCluster(cluster, info)
  }, {
    manual: true,
    onSuccess: (res: API.Cluster) => {
      notification.success({
        message: creating ? intl.formatMessage({id: 'pages.clusterNew.success'}) : intl.formatMessage({id: 'pages.clusterNew.success'}),
      });
      // jump to cluster's home page
      window.location.href = res.fullPath;
    }
  });

  const onCurrentChange = async (cur: number) => {
    if (cur < current || await currentIsValid()) {
      setCurrent(cur);
    }
  }

  const setBasicFormData = (changingFiled: FieldData[], allFields: FieldData[]) => {
    setBasic(allFields)
  }

  return (
    <Row>
      <Col span={22} offset={1}>
        <h3 className={styles.header}>{header}</h3>
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
                current === 0 && <Basic form={form} formData={basic} setFormData={setBasicFormData}
                                        editing={editing}/>
              }
              {
                current === 1 && <Config release={template.release} config={config}
                                         setConfig={setConfig} setConfigErrors={setConfigErrors}
                />
              }
              {
                current === 2 &&
                <Audit form={form} release={template.release} config={config}/>
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
