import 'bootstrap/dist/css/bootstrap.css'
import Form from '@rjsf/bootstrap-4';

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
  // 表单变化回调方法
  onChange?: any;
  // 实时校验表单
  liveValidate?: boolean;
  // 是否在表格最上方展示错误列表
  showErrorList?: boolean;
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
        onChange={props.onChange}
        liveValidate={props.liveValidate}
        showErrorList={props.showErrorList}
        omitExtraData={true}
        liveOmit={true}
      >
        <div/>
      </Form>
    </div>
  )
};
