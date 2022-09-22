import { Form, FormInstance, FormProps } from 'antd';

interface HFromProps extends Omit<FormProps, 'onBlur'> {
  form: FormInstance,
}

export default (props: HFromProps) => {
  const { children, form } = props;

  const onBlur = () => {
    const b = form.getFieldsValue();
    // filter out numbers, since there is no trim() method for number.
    Object.keys(b).filter((key) => {
      const t = typeof b[key];
      return t !== 'number';
    }).forEach((item) => {
      b[item] = b[item] ? b[item].trim() : undefined;
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
