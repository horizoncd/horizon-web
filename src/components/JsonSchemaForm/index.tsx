import 'bootstrap/dist/css/bootstrap.css';
import './index.less';
import Form from '@rjsf/bootstrap-4';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import validator from '@rjsf/validator-ajv8';

interface FormProps {
  disabled: boolean,
  jsonSchema: any,
  uiSchema: any;

  formData?: any;

  onChange?: any;

  onSubmit?: any;

  liveValidate?: boolean;

  showErrorList?: boolean;
}

export default forwardRef((props: FormProps, ref) => {
  const formRef = useRef();

  useImperativeHandle(
    ref,
    () => ({
      submit: () => {
        (formRef.current as any).formElement.current.dispatchEvent(
          new CustomEvent('submit', {
            cancelable: true,
            bubbles: true, // <-- actual fix
          }),
        );
      },
    }),
  );
  return (
    // @ts-ignore
    <div>
      <Form
        validator={validator}
        ref={formRef}
        disabled={props.disabled}
        formData={props.formData}
        schema={props.jsonSchema}
        uiSchema={props.uiSchema}
        onChange={props.onChange}
        onSubmit={props.onSubmit}
        liveValidate={props.liveValidate}
        showErrorList={props.showErrorList && 'bottom'}
        omitExtraData
      >
        <div />
      </Form>
    </div>
  );
});
