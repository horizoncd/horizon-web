import {Button, notification, Steps, Col, Divider} from 'antd';
import Template from './template'
import Basic from './basic'
import Config from './config'
import {useState} from "react";
import {PageContainer} from "@ant-design/pro-layout";

const {Step} = Steps;

export default () => {
  const [current, setCurrent] = useState(1)

  const steps = [
    {title: "选择服务模版", content: <Template/>},
    {title: "配置服务", content: <Basic/>},
    {title: "自定义配置", content: <Config/>}
  ];

  const next = () => {
    setCurrent(current + 1);
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  return (
    <PageContainer title={false}>
      <Col span={16} offset={4}>
        <Steps
          current={current}
          onChange={setCurrent}
        >
          {steps.map((item, index) => {
            return <Step title={`Step ${index + 1}`} subTitle={item.title}/>
          })}
        </Steps>
        <Divider/>
        <div className="steps-content">{steps[current].content}</div>
        <div className="steps-action">
          {current < steps.length - 1 && (
            <Button type="primary" onClick={() => next()}>
              Next
            </Button>
          )}
          {current === steps.length - 1 && (
            <Button type="primary" onClick={() => notification.success({
              message: "done"
            })}>
              Done
            </Button>
          )}
          {current > 0 && (
            <Button style={{margin: '0 8px'}} onClick={() => prev()}>
              Previous
            </Button>
          )}
        </div>
      </Col>

    </PageContainer>
  )
}

