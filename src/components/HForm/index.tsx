import { Form } from 'antd';

export default (props: any) => {
  const { children, form } = props;

  const onBlur = () => {
    const b = form.getFieldsValue();
    Object.keys(b).forEach((item) => {
      b[item] = b[item] ? b[item].trim() : undefined;
    });
    form.setFieldsValue(b);
  };

  return (
    <Form {...props} onBlur={onBlur}>
      {children}
    </Form>
  );
};
