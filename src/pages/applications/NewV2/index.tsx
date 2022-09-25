import {useIntl} from "@@/plugin-locale/localeExports";
import PageWithBreadcrumb from "@/components/PageWithBreadcrumb";
import {Button, Card, Col, Form, Input, Row} from "antd";
import styles from '../NewOrEdit/index.less';
import HSteps from "@/components/HSteps";
import {useRef, useState} from "react";
import Basic from "@/pages/applications/NewOrEdit/Basic";
import BasicConfig from "@/pages/applications/NewOrEdit/BuildConfig"
import BuildConfig from "@/pages/applications/NewOrEdit/BuildConfig"
import {
  applicationVersion2,
  createApplicationV2,
  getApplicationV2,
  updateApplicationV2
} from "@/services/applications/applications";
import Config from "@/pages/applications/NewOrEdit/Config";
import {useRequest} from "@@/plugin-request/request";
import {API} from "@/services/typings";
import {useModel} from "@@/plugin-model/useModel";
import {parseGitRef} from "@/services/code/code";
import {FieldData} from "rc-field-form/lib/interface";
import Template from "@/pages/applications/NewOrEdit/Template";

export default (props: any) => {
  const intl = useIntl();
  const [current, setCurrent] = useState(0);
  const {location} = props;
  const {pathname} = location;
  const {initialState} = useModel('@@initialState');
  const {id} = initialState!.resource; // groupid
  const creating = pathname.endsWith('newapplicationv2');
  const editing = pathname.endsWith('edit');
  const {successAlert} = useModel('alert');

  const [form] = Form.useForm();
  const [basic, setBasic] = useState<FieldData[]>([]);
  const [buildConfig, setBuildConfig] = useState({});
  const [buildConfigErrors, setBuildConfigErrors] = useState({});
  const [templateBasic, setTemplateBasic] = useState<API.Template>({description: '', name: ''});
  const [releaseName, setReleaseName] = useState<string>();
  const [templateConfig, setTemplateConfig] = useState({});
  const [templateconfigErrors, setTemplateConfigErrors] = useState({});

  // query application if editing
  const nameKey = 'name';
  const priorityKey = 'priority';
  const gitURLKey = 'url';
  const descriptionKey = 'description';
  const subFolderKey = 'subfolder';
  const refTypeKey = 'refType';
  const refValueKey = 'refValue';
  if (editing) {
    const {data: getAppResp} = useRequest(() => getApplicationV2(id), {
      onSuccess: () => {
        // set form data
        const {gitRefType, gitRef} = parseGitRef(getAppResp!.git);
        const basicInfo = [
          {name: nameKey, value: getAppResp!.name},
          {name: descriptionKey, value: getAppResp!.description},
          {name: priorityKey, value: getAppResp!.priority},
          {name: gitURLKey, value: getAppResp!.git.url},
          {name: refTypeKey, value: gitRefType},
          {name: refValueKey, value: gitRef},
          {name: subFolderKey, value: getAppResp!.git.subfolder},
        ];
        // used for basic
        setBasic(basicInfo);
        form.setFields(basicInfo)
        // used for build
        setBuildConfig(getAppResp!.buildConfig)
        // used for config
        setTemplateConfig(getAppResp!.templateConfig)
        setReleaseName(getAppResp!.templateInfo!.release)

        const basicTemplateInfo: API.Template = {
          name: getAppResp!.templateInfo!.name
        }
        setTemplateBasic(basicTemplateInfo)
        setBuildConfig(getAppResp!.buildConfig)
      }
    })
  }

  const {loading, run: submitApp} = useRequest((cfg: any) => {
    const createReq: API.CreateOrUpdateRequestV2 = {
      name: form.getFieldValue(nameKey),
      description: form.getFieldValue(descriptionKey),
      buildConfig: buildConfig["pipeline"], //TODO
      priority: form.getFieldValue(priorityKey),
      templateConfig: templateConfig["application"],  //TODO
      templateInfo: {name: templateBasic.name, release: releaseName!},
      git: {
        url: form.getFieldValue(gitURLKey),
        subfolder: form.getFieldValue(subFolderKey) || '',
        [form.getFieldValue(refTypeKey)]: form.getFieldValue(refValueKey),
      },
    }
    if (creating) {
      return createApplicationV2(id, createReq)
    }
    return updateApplicationV2(id, createReq)
  }, {
    manual: true,
    onSuccess: (res: API.CreateApplicationResponseV2) => {
      successAlert(creating ? intl.formatMessage({id: 'pages.applicationNew.success'}) : intl.formatMessage({id: 'pages.applicationEdit.success'}));
      // jump to application's home page
      window.location.href = res.fullPath;
    },
  });

  const onSubmit = (formData: any) => {
    submitApp(formData)
  }

  const basicHasError = () => {
    let hasError = false;
    console.log(basic)
    for (let i = 0; i < basic!.length; i += 1) {
      const val = basic![i];
      if (val.errors && val.errors.length > 0) {
        hasError = true;
      }
    }
    return hasError;
  };

  const configHasError = (config: {}) => {
    let hasError = false;
    Object.keys(config).forEach((item) => {
      if (config[item].length > 0) {
        hasError = true;
      }
    });

    return hasError;
  };

  const steps = [
    {
      title: intl.formatMessage({id: 'pages.applicationNewV2.step.one'}),
      disabled: basicHasError(),
    }, {
      title: intl.formatMessage({id: 'pages.applicationNewV2.step.two'}),
      disabled: configHasError(buildConfigErrors),
    }, {
      title: intl.formatMessage({id: 'pages.applicationNewV2.step.three'}),
      disabled: !templateBasic.name,
    }, {
      title: intl.formatMessage({id: 'pages.applicationNewV2.step.three'}),
      disabled: !templateBasic.name || basicHasError(),
    }, {
      title: intl.formatMessage({id: 'pages.applicationNewV2.step.four'}),
      disabled: !templateBasic.name || basicHasError() || configHasError(templateconfigErrors),
    }
  ];

  const onCurrentChange = (cur: number) => {
    // current is valid?
    if (cur < current) {
      setCurrent(cur);
    }
  };

  const setBasicFormData = (changingFiled: FieldData[], allFields: FieldData[]) => {
    setBasic(allFields);
  };
  const resetTemplate = (newTemplate: API.Template) => {
    setTemplateBasic(newTemplate);
    // reset selected release version
    if (newTemplate.name !== templateBasic?.name) {
      setReleaseName("")
    }
  };

  const selectedTemplateInfo = () => {
    const templateTitle = intl.formatMessage({id: 'pages.applicationNew.step.one'});
    const formatMessage = (suffix: string, defaultMsg?: string) => {
      return intl.formatMessage({id: `pages.applicationNew.basic.${suffix}`, defaultMessage: defaultMsg});
    }
    console.log("selectedTemplateInfo releaseName: %s", releaseName)
    return (
      <Card title={templateTitle} className={styles.gapBetweenCards}>
        <Form.Item label={formatMessage('template', 'template')}>
          <Input disabled value={templateBasic.name}/>
        </Form.Item>
        <Form.Item label={formatMessage('release')}>
          <Input disabled value={releaseName}/>
        </Form.Item>
      </Card>
    )
  }

  const currentStepIsValid = async () => {
    let valid: boolean;

    const basicNeedValidFields = [
      nameKey, gitURLKey, priorityKey, gitURLKey
    ];
    console.log("currentIsValid current =%d", current)
    switch (current) {
      case 0:
        try {
          await form.validateFields(basicNeedValidFields);
          valid = true;
        } catch (e: any) {
          const {errorFields} = e;
          valid = !errorFields.length;
        }
        break;
      case 1:
        valid = !configHasError(buildConfigErrors);
        break
      case 2:
        valid = !!templateBasic.name && !configHasError(buildConfigErrors);
        break;
      case 3:
        valid = !!releaseName && !configHasError(buildConfigErrors) && !configHasError(templateconfigErrors);
        break;
      default:
        valid = true;
    }
    return valid;
  };

  const prev = () => {
    setCurrent(current - 1);
  };
  const next = async () => {
    if (await currentStepIsValid()) {
      setCurrent(current + 1);
      return
    }
  };
  const nextBtnDisabled = () => {
    switch (current) {
      case 0:
        return basicHasError();
      case 1:
        return configHasError(buildConfigErrors);
      case 2:
        return !templateBasic.name && basicHasError();
      case 3:
        return !templateBasic.name && basicHasError() && configHasError(templateconfigErrors);
      default:
        return false;
    }
  };
  const configRef = useRef();

  return (
    <PageWithBreadcrumb>
      <Row>
        <Col span={4}>
          <div className={styles.step}></div>
          <HSteps current={current} onChange={onCurrentChange} steps={steps}/>
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
            }{
            // build config
            current === 1 && (
              <BasicConfig
                config={buildConfig}
                setConfig={setBuildConfig}
                setConfigErrors={setBuildConfigErrors}
              ></BasicConfig>
            )
          }{
            // deploy template
            current === 2 && (
              <Template
                template={templateBasic}
                resetTemplate={resetTemplate}
              />
            )
          }{
            // deploy config
            current === 3 && (
              <Config
                template={templateBasic}
                release={releaseName}
                config={templateConfig}
                setConfig={setTemplateConfig}
                setReleaseName={setReleaseName}
                setConfigErrors={setTemplateConfigErrors}
                version={applicationVersion2}
              />
            )
          }{
            // audit
            // list all the content
            current === 4 && (
              <div>
                <Basic
                  form={form}
                  version={applicationVersion2}
                  readonly
                />
                <BuildConfig
                  config={buildConfig}
                  readonly
                ></BuildConfig>
                <div>{selectedTemplateInfo()}</div>
                <Config
                  template={templateBasic}
                  release={releaseName}
                  config={templateConfig}
                  ref={configRef}
                  version={applicationVersion2}
                  onSubmit={onSubmit}
                  readonly
                ></Config>
              </div>
            )
          }
          </div>
          <div className={styles.stepsAction}>
            {current > 0 && (
              <Button style={{margin: '0 8px'}} onClick={() => prev()}>
                {intl.formatMessage({id: 'pages.common.back'})}
              </Button>
            )}
            {current < steps.length - 1 && (
              <Button type="primary" disabled={nextBtnDisabled()} onClick={() => next()}>
                {intl.formatMessage({id: 'pages.common.next'})}
              </Button>
            )}
            {current === steps.length - 1 && (
              <Button type="primary" onClick={() => {
                configRef.current.submit();
              }} loading={loading}>
                {intl.formatMessage({id: 'pages.common.submit'})}
              </Button>
            )}
          </div>
        </Col>
      </Row>
    </PageWithBreadcrumb>
  )
}
