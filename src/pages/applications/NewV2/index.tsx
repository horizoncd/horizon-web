import {useIntl} from "@@/plugin-locale/localeExports";
import PageWithBreadcrumb from "@/components/PageWithBreadcrumb";
import {Col, Form, Row} from "antd";
import styles from '../NewOrEdit/index.less';
import HSteps from "@/components/HSteps";
import {useState} from "react";
import Basic from "@/pages/applications/NewOrEdit/Basic";
import {applicationVersion2, createApplicationV2, getApplicationV2} from "@/services/applications/applications";
import Config from "@/pages/applications/NewOrEdit/Config";
import {useRequest} from "@@/plugin-request/request";
import {API} from "@/services/typings";
import {useModel} from "@@/plugin-model/useModel";

export default (props: any) => {
  const intl = useIntl();
  const [current, setCurrent] = useState(0);
  const {location} = props;
  const {pathname} = location;
  const {initialState} = useModel('@@initialState');
  const {id} = initialState!.resource; // groupid
  const creating = pathname.endsWith('newapplication');
  const editing = pathname.endsWith('edit');
  const {successAlert} = useModel('alert');

  const [form] = Form.useForm();


  const [buildConfig, setBuildConfig] = useState({});
  const [templateConfig, setTemplateConfig] = useState({});
  const [templateInfo, setTemplateInfo] = useState<API.TemplateInfoV2 | undefined>({name: "", release: ""});

  // query application if editing
  if (editing) {
    const getAppResp: API.GetApplicationResponse2 = useRequest(() => getApplicationV2(id), {
      onSuccess: () => {
        setBuildConfig(getAppResp.buildConfig)
        setTemplateConfig(getAppResp.templateConfig)
        setTemplateInfo(getAppResp.templateInfo)
      }
    })
  }


  const {loading, run: submitApp} = useRequest((cfg: any) => {
    const createReq: API.CreateOrUpdateRequestV2 = {
      name: "test",
      description: "123",
      buildConfig: undefined,
      git: undefined,
      priority: "",
      templateConfig: undefined,
      templateInfo: {name: "javaapp", release: "v1.0.0"}
    }
    return createApplicationV2(id, createReq)
  }, {
    manual: true,
    onSuccess: (res: API.CreateApplicationResponseV2) => {
      successAlert(creating ? intl.formatMessage({id: 'pages.applicationNew.success'}) : intl.formatMessage({id: 'pages.applicationEdit.success'}));
      // jump to application's home page
      window.location.href = res.fullPath;
    },
  });


  const onSubmit = (formData: any) => {
    if (creating) {
      submitApp(formData);
    } else if (editing) {
      submitApp(formData)
    }
  }

  const steps = [
    {
      title: intl.formatMessage({id: 'pages.applicationNewV2.step.one'}),
      disabled: false,
    }, {
      title: intl.formatMessage({id: 'pages.applicationNewV2.step.two'}),
      disabled: false,
    }, {
      title: intl.formatMessage({id: 'pages.applicationNewV2.step.three'}),
      disabled: false,
    }, {
      title: intl.formatMessage({id: 'pages.applicationNewV2.step.four'}),
      disabled: false,
    }
  ];

  const onCurrentChange = (cur: number) => {
    // current is valid?
    if (cur < current) {
      setCurrent(cur);
    }
  };


  return (
    <PageWithBreadcrumb>
      <Row>
        <Col span={4}>
          <div className={styles.step}></div>
          <HSteps current={current} onChange={onCurrentChange} steps={steps}/>
        </Col>
        <Col>
          <div>
            {
              // basic
              current === 0 && (
                <Basic
                  version={applicationVersion2}
                />
              )
            }{
            // build config
            current === 1 && (
              <div></div>
            )
          }{
            // deploy config
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
              // audit
              current === 3 && (
                <div></div>
              )
            }
          </div>
        </Col>
      </Row>
    </PageWithBreadcrumb>
  )
}
