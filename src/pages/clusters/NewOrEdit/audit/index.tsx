import Basic from '../basic';
import Config from '../config';

export default (props: any) => {
  const { template, form, release, config } = props;

  return (
    <div>
      <Basic form={form} template={template} readonly />

      <Config template={template} release={release} config={config} readonly />
    </div>
  );
};
