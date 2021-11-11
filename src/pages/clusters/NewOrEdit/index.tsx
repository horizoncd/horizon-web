import {Button, Col, Form, Row} from 'antd';
import Basic from './Basic';
import Config from '../../applications/NewOrEdit/Config';
import Audit from './Audit';
import {useState} from 'react';
import {useRequest} from 'umi';
import styles from './index.less';
import {useIntl} from "@@/plugin-locale/localeExports";
import {createCluster, getCluster, updateCluster} from "@/services/clusters/clusters";
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import {useModel} from "@@/plugin-model/useModel";
import {getApplication} from "@/services/applications/applications";
import HSteps from "@/components/HSteps";

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
  const environment = 'environment'
  const region = 'region'
  const basicNeedValidFields = [
    name, branch, environment, region
  ]

  const {initialState} = useModel('@@initialState');
  const {id} = initialState!.resource;

  const {location} = props;
  const {query, pathname} = location;
  const {environment: envFromQuery} = query;
  const creating = pathname.endsWith('new')
  const editing = pathname.endsWith('edit')

  const {successAlert} = useModel('alert')
  const [form] = Form.useForm();
  const [current, setCurrent] = useState(0);
  const [template, setTemplate] = useState<{ name: string, release: string }>({release: "", name: ""});
  const [basic, setBasic] = useState<FieldData[]>([{
    name: environment, value: envFromQuery
  }]);
  const [config, setConfig] = useState({});
  const [configErrors, setConfigErrors] = useState({});
  const [applicationName, setApplicationName] = useState('');

  // query application if creating
  if (creating) {
    const {data} = useRequest(() => getApplication(id), {
      onSuccess: () => {
        const {template: t, git, templateInput, name: n} = data!
        setTemplate(t)
        const {url: u, subfolder: s} = git
        setBasic([
            {name: url, value: u},
            {name: subfolder, value: s},
          ]
        )
        setConfig(templateInput)
        setApplicationName(n)
      }
    });
  }

  // query cluster if editing
  if (editing) {
    const {data: clusterData} = useRequest(() => getCluster(id), {
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
        const {environment: e, region: r} = scope
        setBasic([
            {name, value: n},
            {name: description, value: d},
            {name: branch, value: b},
            {name: environment, value: e},
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
      name: `${applicationName}-${form.getFieldValue(name)}`,
      description: form.getFieldValue(description),
      git: {
        branch: form.getFieldValue(branch),
      },
      templateInput: config,
    }
    if (creating) {
      return createCluster(id, `${form.getFieldValue(environment)}/${form.getFieldValue(region)}`, info)
    }
    return updateCluster(id, info)
  }, {
    manual: true,
    onSuccess: (res: CLUSTER.Cluster) => {
      successAlert(creating ? intl.formatMessage({id: 'pages.clusterNew.success'}) : intl.formatMessage({id: 'pages.clusterNew.success'}))
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
    <PageWithBreadcrumb>
      <Row>
        <Col span={4}>
          <div className={styles.step}>
            <HSteps current={current} onChange={onCurrentChange} steps={steps}/>
          </div>
        </Col>
        <Col span={20}>
          <div className={styles.stepsContent}>
            {
              current === 0 && <Basic form={form} applicationName={applicationName} formData={basic} setFormData={setBasicFormData}
                                      editing={editing} template={template}/>
            }
            {
              current === 1 && <Config template={template} release={template.release} config={config}
                                       setConfig={setConfig} setConfigErrors={setConfigErrors}
              />
            }
            {
              current === 2 &&
              <Audit template={template} editing={editing} form={form} applicationName={applicationName} release={template.release} config={config}/>
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
    </PageWithBreadcrumb>
  );
};
