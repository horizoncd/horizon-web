import Basic from '../Basic';
import Build from '@/pages/applications/NewOrEdit/V2/BuildConfig';
import Deploy from '@/pages/applications/NewOrEdit/V2/Config';
import { MaxSpace } from '@/components/Widget';

export default (props: any) => {
  const {
    form, applicationName, editing,
    buildConfig, buildFormRef, onBuildSubmit,
    templateBasic, release, templateConfig, clusterID, templateFormRef, onDeploySubmit,
  } = props;

  return (
    <MaxSpace
      direction="vertical"
      size="middle"
    >
      <Basic
        form={form}
        applicationName={applicationName}
        editing={editing}
        readOnly
      />
      <Build
        ref={buildFormRef}
        buildConfig={buildConfig}
        onSubmit={onBuildSubmit}
        readOnly
      />
      <Deploy
        ref={templateFormRef}
        clusterID={clusterID}
        template={templateBasic}
        release={release}
        templateConfig={templateConfig}
        onSubmit={onDeploySubmit}
        readOnly
      />
    </MaxSpace>
  );
};
