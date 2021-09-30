import {Steps} from 'antd';
import {useState} from "react";

export default () => {

  const {Step} = Steps;

  const [current, setCurrent] = useState(0)

  const onChange = (cur: number) => {
    setCurrent(cur)
  }

  return (
    <Steps current={current} onChange={onChange} direction="vertical">
      <Step title="Step 1" description="This is a description."/>
      <Step title="Step 2" description="This is a description."/>
      <Step title="Step 3" description="This is a description."/>
    </Steps>
  )
}
