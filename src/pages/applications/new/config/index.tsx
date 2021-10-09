import { useRequest } from 'umi';
import { querySchema } from "@/services/templates/templates";
import Form from "@rjsf/material-ui";
import { Card } from "antd";
// import { withTheme } from '@rjsf/core';
// import { Theme as AntDTheme } from '@rjsf/antd';

// const Form = withTheme(AntDTheme);

export default (props: any) => {

  // query schema by template and release
  const { data } = useRequest(() => querySchema(props.template.name, props.release))
  return (
    <div>
      {
        data && Object.keys(data).map(item => {
          const currentFormData = props.config[item] || {}
          const onChange = ({formData}: any) => {
            props.config[item] = formData
            props.setConfig(props.config)
          }

          return <Card key={item} title={item} style={{marginBottom: '30px'}}>
            <Form schema={data[item]} onChange={onChange} formData={currentFormData}>
            <div/>
          </Form>
          </Card>
        })
      }
    </div>
  )
}
