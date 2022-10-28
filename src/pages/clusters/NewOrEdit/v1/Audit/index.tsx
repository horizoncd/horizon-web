import Basic from '../Basic';
import Config from '../Config';

export default (props: any) => {
  const {
    template, form, release, config, applicationName, editing, clusterID, formRef, onSubmit,
  } = props;

  return (
    <div>
      <Basic editing={editing} applicationName={applicationName} form={form} template={template} readOnly />

      <Config
        template={template}
        release={release}
        config={config}
        clusterID={clusterID}
        ref={formRef}
        onSubmit={onSubmit}
        readOnly
      />
    </div>
  );
};
