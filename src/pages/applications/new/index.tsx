import { Button, Col, Divider, Form, notification, Row, Steps } from 'antd';
import Template from './template'
import Basic from './basic'
import Config from './config'
import { useState } from "react";
import NotFount from "@/pages/404";
import { getGroupByID } from "@/services/groups/groups";
import { useRequest } from 'umi';
import './index.less'

const { Step } = Steps;

export default (props: any) => {
  const { parentID } = props.location.query

  if (!parentID) {
    return <NotFount/>;
  }

  const [form] = Form.useForm();

  const [current, setCurrent] = useState(2);
  const defaultTemplate: API.Template = {
    name: "javaapp",
    description: ""
  }
  const [template, setTemplate] = useState<API.Template>(defaultTemplate);
  const [release, setRelease] = useState("v1.0.1");
  const [config, setConfig] = useState({});

  const intParentID = parseInt(parentID, 10)

  const { data } = useRequest(() => getGroupByID({ id: intParentID }), {
    refreshDeps: [intParentID]
  })

  const resetTemplate = (newTemplate: API.Template) => {
    setTemplate(newTemplate)
    // reset selected release version
    if (newTemplate.name !== template?.name) {
      form.resetFields(["release"])
    }
  }

  const steps = [
    {
      title: "选择服务模版",
      content: <Template template={ template } resetTemplate={ resetTemplate }/>,
      disabled: false,
    },
    {
      title: "配置服务",
      content: <Basic form={ form } template={ template } release={ release } setRelease={ setRelease }/>,
      disabled: !template.name
    },
    {
      title: "自定义配置",
      content: <Config template={ template } release={ release } config={config} setConfig={ setConfig }/>,
      disabled: !template.name || !release
    }
  ];

  const next = () => {
    setCurrent(current + 1);
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  const header = `正在为【 ${ data?.name } 】创建应用，请按步骤填写信息`

  const btnDisabled = () => {
    switch (current) {
      case 0:
        return !template.name
      case 1:
        return !release
      default:
        return false;
    }
  }

  return (
    <Row>
      <Col span={ 22 } offset={ 1 }>
        <h3 className={ "header" }>
          { header }
        </h3>
        <Divider className={ "divider" }/>
        <Row>
          <Col span={ 4 }>
            <div className={ 'step' }>
              <Steps
                current={ current }
                onChange={ setCurrent }
                direction="vertical"
              >
                { steps.map((item, index) => {
                  return <Step key={ `Step ${ index + 1 }` } title={ `第 ${ index + 1 } 步` } description={ item.title }
                               disabled={ item.disabled }/>
                }) }
              </Steps>
            </div>
          </Col>
          <Col span={ 20 }>
            <div className="steps-content">{ steps[current].content }</div>
            <div className="steps-action">
              { current > 0 && (
                <Button style={ { margin: '0 8px' } } onClick={ () => prev() }>
                  上一步
                </Button>
              ) }
              { current === steps.length - 1 && (
                <Button type="primary" onClick={ () => notification.success({
                  message: "done"
                }) }>
                  提交
                </Button>
              ) }
              { current < steps.length - 1 && (
                <Button type="primary" disabled={btnDisabled()} onClick={ () => next() }>
                  下一步
                </Button>
              ) }
            </div>
          </Col>
        </Row>
      </Col>
    </Row>
  )
}

