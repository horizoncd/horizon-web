import 'bootstrap/dist/css/bootstrap.css'
import './index.less'
import Form from '@rjsf/bootstrap-4';
import {Button} from 'antd';
import {forwardRef, useImperativeHandle, useRef} from 'react';

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
  // 表单提交回调方法
  onSubmit?: any;
  // 实时校验表单
  liveValidate?: boolean;
  // 是否在表格最上方展示错误列表
  showErrorList?: boolean;
}

export default forwardRef((props: FormProps, ref) => {
  const formRef = useRef()
  // 暴露submit给父级组件
  useImperativeHandle(
    ref,
    () => ({
      submit: () => {
        (formRef.current as any).formElement.dispatchEvent(
          new CustomEvent('submit', {
            cancelable: true,
            bubbles: true, // <-- actual fix
          })
        )
      }
    })
  );
  return (
    // @ts-ignore
    <div>
      <Form
        ref={formRef}
        disabled={props.disabled}
        formData={props.formData}
        schema={props.jsonSchema}
        uiSchema={props.uiSchema}
        onChange={props.onChange}
        onSubmit={props.onSubmit}
        liveValidate={props.liveValidate}
        showErrorList={props.showErrorList}
        omitExtraData={true}
      >
        <div/>
      </Form>
    </div>
  )
});
