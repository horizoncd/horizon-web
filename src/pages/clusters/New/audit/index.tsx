import Basic from '../basic';
import Config from '../config';

export default (props: any) => {
  const { form, config } = props;

  return (
    <div>
      <Basic form={form} readonly />

      <Config config={config} readonly />
    </div>
  );
};
