import Basic from '../Basic';
import Config from '../Config';

export default (props: any) => {
  const {template, form, release, config, applicationName, editing, clusterID} = props;

  return (
    <div>
      <Basic editing={editing} applicationName={applicationName} form={form} template={template} readonly/>

      <Config template={template} release={release} config={config} clusterID={clusterID} 
        ref={props.formRef} setConfig={props.setConfig} 
        setConfigErrors={props.setConfigErrors} 
        onSubmit={props.onSubmit}
        readonly/>
    </div>
  );
};
