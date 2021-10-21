import Form from '@rjsf/core';
import 'bootstrap/dist/css/bootstrap.css'
// import 'antd/lib/form/style'
// import 'antd/lib/input-number/style'

// member组件入参
interface FormProps {
  key?: string,
  // 是否允许编辑
  disabled: boolean,
  // jsonSchema模板
  jsonSchema: any,
  // uiSchema模板
  uiSchema: any;
  // 表单预置数据
  formData: any;
}

export default (props: FormProps) => {
  return (
    // @ts-ignore
    <div>
      <Form
        disabled={props.disabled}
        formData={props.formData}
        schema={props.jsonSchema}
        uiSchema={props.uiSchema}
      >
        <div/>
      </Form>
    </div>
  )
};
