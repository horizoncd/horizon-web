import Basic from '../Basic';
import Config from '../../../applications/NewOrEdit/Config';

export default (props: any) => {
  const { template, form, release, config, applicationName, editing } = props;

  return (
    <div>
      <Basic editing={editing} applicationName={applicationName}  form={form} template={template} readonly />

      <Config template={template} release={release} config={config} readonly />
    </div>
  );
};
