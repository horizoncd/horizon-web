import {Card, Steps} from 'antd';
import {useState} from "react";

export default () => {

  const {Step} = Steps;

  const [current, setCurrent] = useState(0)

  const onChange = (cur: number) => {
    setCurrent(cur)
  }

  const icon = <span>kk</span>

  return (
    <Steps current={current} onChange={onChange} direction="vertical">
      <Step title="Step 12" description="This is a description." icon={icon}>
        <Card>
          kkk
        </Card>
      </Step>
      <Step title="Step 2" description="This is a description."/>
      <Step title="Step 3" description="This is a description."/>
    </Steps>
  )
}
