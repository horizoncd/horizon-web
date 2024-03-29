import { Form, FormInstance, FormProps } from 'antd';

interface HFromProps extends Omit<FormProps, 'onBlur'> {
  form: FormInstance,
}

export default (props: HFromProps) => {
  const { children, form } = props;

  const onBlur = () => {
    const b = form.getFieldsValue();
    Object.keys(b).forEach((item) => {
      if (b[item] && b[item].trim) {
        b[item] = b[item].trim();
      }
    });
    form.setFieldsValue(b);
  };

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Form {...props} onBlur={onBlur}>
      {children}
    </Form>
  );
};
