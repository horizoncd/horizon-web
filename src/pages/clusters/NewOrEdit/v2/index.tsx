import {
  Affix, Button, Col, Form, Modal, Row,
} from 'antd';
import { useRequest } from 'umi';
import { useEffect, useRef, useState } from 'react';
import type { FieldData } from 'rc-field-form/lib/interface';
import { useIntl } from '@@/plugin-locale/localeExports';
import { useModel } from '@@/plugin-model/useModel';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import HSteps from '@/components/HSteps';
import Basic from './Basic';
import Build from '@/pages/applications/NewOrEdit/v2/BuildConfig';
import Deploy from '@/pages/applications/NewOrEdit/v2/Config';
import Audit from './Audit';
import { getApplicationEnvTemplate } from '@/services/applications/applications';
import { getApplicationV2 } from '@/services/applications/applications';
import {
  createClusterV2, updateClusterV2, getClusterV2,
} from '@/services/clusters/clusters';
import { parseGitRef } from '@/services/code/code';
import { PublishType } from '@/const';
import {
  Step, StepContent, StepAction, ModalTitle, ModalContent,
} from '../Widget';
import { ResourceType } from '@/const';
import { difference } from '@/utils';
import { RebuilddeployModal } from '@/components/rollout';

export default (props: any) => {
  const intl = useIntl();

  const name = 'name';
  const description = 'description';
  const environment = 'environment';
  const region = 'region';
  const expireTimeStr = 'expireTime';
  const url = 'url';
  const refType = 'refType';
  const refValue = 'refValue';
  const subfolder = 'subfolder';
  const buildConfigKey = 'buildConfig';
  const templateBasicKey = 'templateBasic';
  const templateConfigKey = 'templateConfig';
  const basicFieldsToValidate = [
    name, environment, url, refValue,
  ];

  const { initialState } = useModel('@@initialState');
  const { id } = initialState!.resource;

  const { location } = props;
  const { query, pathname } = location;
  const { environment: envFromQuery, sourceClusterID } = query;
  const editing = pathname.endsWith('editv2');
  const creating = pathname.endsWith('newclusterv2');
  const copying = !!sourceClusterID;

  const { successAlert } = useModel('alert');
  const [form] = Form.useForm();
  const buildFormRef = useRef();
  const templateFormRef = useRef();
  const [applicationName, setApplicationName] = useState('');
  const [current, setCurrent] = useState(0);
  const [cluster, setCluster] = useState<CLUSTER.ClusterV2>();
  const [basicInfo, setBasicInfo] = useState<FieldData[]>([]);
  const [originConfig, setOriginConfig] = useState({});
  const [buildConfig, setBuildConfig] = useState({});
  const [buildConfigErrors, setBuildConfigErrors] = useState({});
  const [templateBasic, setTemplateBasic] = useState({ name: '', release: '' });
  const [releaseName, setReleaseName] = useState('');
  const [templateConfig, setTemplateConfig] = useState({});
  const [templateConfigErrors, setTemplateConfigErrors] = useState({});
  const [buildSubmitted, setBuildSubmitted] = useState(false);
  const [deploySubmitted, setDeploySubmitted] = useState(false);
  const [showBuildDeployModal, setShowBuildDeployModal] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [enableRebuilddeployModal, setEnableRebuilddeployModal] = useState(false);

  const basicHasError = () => {
    if (editing && basicInfo.length === 0) {
      return false;
    }
    let hasError = true;
    let validatedNum = 0;
    for (let i = 0; i < basicInfo!.length; i += 1) {
      const val = basicInfo![i];
      if (val.errors && val.errors.length > 0) {
        break;
      }
      if (val.name.length > 0 && basicFieldsToValidate.includes(val.name[0]) && val.value) {
        validatedNum += 1;
      }
    }
    if (validatedNum === basicFieldsToValidate.length) {
      hasError = false;
    }
    return hasError;
  };

  const configHasError = (configError: any) => {
    if (configError && configError.length > 0) {
      return true;
    }
    return false;
  };

  const currentStepIsValid = (cur: number) => {
    let valid: boolean;
    switch (cur) {
      case 0:
        valid = !basicHasError();
        break;
      case 1:
        valid = !basicHasError() && !configHasError(buildConfigErrors);
        break;
      case 2:
        valid = !basicHasError() && !configHasError(buildConfigErrors) && !configHasError(templateConfigErrors);
        break;
      default:
        valid = true;
    }

    return valid;
  };

  const steps = [
    {
      title: intl.formatMessage({ id: 'pages.newV2.step.basic' }),
      disabled: false,
    },
    {
      title: intl.formatMessage({ id: 'pages.newV2.step.build' }),
      disabled: !currentStepIsValid(0),
    },
    {
      title: intl.formatMessage({ id: 'pages.newV2.step.deploy' }),
      disabled: !currentStepIsValid(1),
    },
    {
      title: intl.formatMessage({ id: 'pages.newV2.step.audit' }),
      disabled: !currentStepIsValid(2),
    },
  ];

  const next = async () => {
    setCurrent(current + 1);
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  const onCurrentChange = async (cur: number) => {
    setCurrent(cur);
  };

  const { run: refreshAppEnvTemplate } = useRequest((env: string) => getApplicationEnvTemplate(id, env), {
    onSuccess: (data: any) => {
      if (data!.pipeline) {
        setBuildConfig(data!.pipeline);
      }
      if (data!.application) {
        setTemplateConfig(data!.application);
      }
    },
    ready: creating,
    manual: true,
  });

  // query application if creating
  if (creating) {
    const { data } = useRequest(() => getApplicationV2(id), {
      onSuccess: () => {
        // eslint-disable-next-line no-console
        const { git, name: appName } = data!;
        setApplicationName(appName);
        if (!copying) {
          // basicInfo
          const { gitRefType, gitRef } = parseGitRef(data!.git);
          form.setFields([
            { name: environment, value: envFromQuery },
            { name: url, value: git.url },
            { name: subfolder, value: git.subfolder },
            { name: refType, value: gitRefType },
            { name: refValue, value: gitRef },
          ]);

          // basicTemplateInfo
          const basicTemplateInfo = {
            name: data!.templateInfo!.name,
            release: data!.templateInfo!.release,
          };
          setBuildConfig(data!.buildConfig);
          // todo(zx): remove
          setTemplateBasic(basicTemplateInfo);
          setReleaseName(data!.templateInfo!.release);
          setTemplateConfig(data!.templateConfig);
          refreshAppEnvTemplate(envFromQuery);
        } else {
          // query source cluster if copying
          getClusterV2(sourceClusterID).then(
            ({ data: clusterData }) => {
              const {
                // basic info
                description: d,
                scope,
                expireTime,
                git: g,

                // build and deploy info
                buildConfig: bc,
                templateInfo: ti,
                templateConfig: tc,
              } = clusterData!;
              const { environment: e, region: r } = scope;
              const { url: u, subfolder: s } = g;
              const { gitRefType, gitRef } = parseGitRef(g);
              form.setFields([
                { name: description, value: d },
                { name: environment, value: e },
                { name: region, value: r },
                { name: expireTimeStr, value: expireTime },
                { name: url, value: u },
                { name: subfolder, value: s },
                { name: refType, value: gitRefType },
                { name: refValue, value: gitRef },
              ]);
              setBuildConfig(bc);
              setTemplateBasic(ti);
              setReleaseName(ti.release);
              setTemplateConfig(tc);
              setCluster(clusterData);
            },
          );
        }
      },
    });
  }

  // query cluster if editing
  if (editing) {
    const { data: clusterData } = useRequest(() => getClusterV2(id), {
      onSuccess: () => {
        const {
          // basic info
          name: n,
          description: d,
          scope,
          expireTime,
          git,

          // build and deploy info
          buildConfig: bc,
          templateInfo: ti,
          templateConfig: tc,
        } = clusterData!;
        const { environment: e, region: r } = scope;
        const { url: u, subfolder: s } = git;
        const { gitRefType, gitRef } = parseGitRef(git);
        form.setFields([
          { name, value: n },
          { name: description, value: d },
          { name: environment, value: e },
          { name: region, value: r },
          { name: expireTimeStr, value: expireTime },
          { name: url, value: u },
          { name: subfolder, value: s },
          { name: refType, value: gitRefType },
          { name: refValue, value: gitRef },
        ]);
        setOriginConfig({
          buildConfig: bc,
          templateBasic: ti,
          templateConfig: tc,
        });
        setBuildConfig(bc);
        setTemplateBasic(ti);
        setReleaseName(ti.release);
        setTemplateConfig(tc);
        setCluster(clusterData);
      },
    });
  }

  const setBasicFormData = (changedFields: FieldData[], allFields: FieldData[]) => {
    // query regions when environment selected
    if (changedFields[0].name[0] === 'environment') {
      refreshAppEnvTemplate(changedFields[0].value);
    }
    setBasicInfo(allFields);
  };

  const onBuildAndDeployButtonOK = () => {
    setShowBuildDeployModal(false);
    setEnableRebuilddeployModal(true);
  };

  const onDeployButtonOK = () => {
    window.location.href = `/clusters${cluster!.fullPath}/-/pipelines/new?type=${PublishType.DEPLOY}`;
  };

  const onButtonCancel = () => {
    // jump to cluster's home page
    window.location.href = cluster!.fullPath;
  };

  const { loading, run: submitCluster } = useRequest(() => {
    const info = {
      name: form.getFieldValue(name),
      description: form.getFieldValue(description),
      expireTime: form.getFieldValue(expireTimeStr),
      git: {
        url: form.getFieldValue(url),
        subfolder: form.getFieldValue(subfolder) || '',
        [form.getFieldValue(refType)]: form.getFieldValue(refValue),
      },
      buildConfig,
      templateInfo: {
        name: templateBasic.name,
        release: releaseName,
      },
      templateConfig,
    };
    if (creating) {
      return createClusterV2(id, `${form.getFieldValue(environment)}/${form.getFieldValue(region)}`, info);
    }
    return updateClusterV2(id, info);
  }, {
    manual: true,
    onSuccess: (res: CLUSTER.ClusterV2) => {
      successAlert(creating ? intl.formatMessage({ id: 'pages.clusterNew.success' }) : intl.formatMessage({ id: 'pages.clusterEdit.success' }));
      if (creating) {
        setCluster(res);
        if (Object.keys(buildConfig).length > 0) {
          setShowBuildDeployModal(true);
        } else {
          setShowDeployModal(true);
        }
      } else if (editing) {
        getClusterV2(id).then(({ data: clusterData }) => {
          const currentConfig = {
            buildConfig: clusterData.buildConfig,
            templateBasic: clusterData.templateInfo,
            templateConfig: clusterData.templateConfig,
          };
          const configDiff = difference(currentConfig, originConfig);
          if (Object.keys(configDiff).includes(buildConfigKey)) {
            setShowBuildDeployModal(true);
          } else if (Object.keys(configDiff).includes(templateBasicKey)
            || Object.keys(configDiff).includes(templateConfigKey)) {
            setShowDeployModal(true);
          } else {
            onButtonCancel();
          }
        });
      }
    },
  });

  const onBuildSubmit = (formData: any) => {
    setBuildConfig(formData);
    setBuildSubmitted(true);
  };

  const onDeploySubmit = (formData: any) => {
    setTemplateConfig(formData);
    setDeploySubmitted(true);
  };

  useEffect(() => {
    if (buildSubmitted && deploySubmitted) {
      submitCluster();
      setBuildSubmitted(false);
      setDeploySubmitted(false);
    }
  }, [submitCluster, buildSubmitted, deploySubmitted]);

  const buildDeployModal = (
    <Modal
      title={(
        <ModalTitle>
          {intl.formatMessage({ id: 'pages.clusterEdit.prompt.buildDeploy.title' })}
        </ModalTitle>
      )}
      open={showBuildDeployModal}
      footer={[
        <Button
          onClick={onBuildAndDeployButtonOK}
          type="primary"
        >
          {intl.formatMessage({ id: 'pages.cluster.action.buildDeploy' })}
        </Button>,
      ]}
      onCancel={onButtonCancel}
    >
      <ModalContent>
        {creating
          ? intl.formatMessage({ id: 'pages.clusterEdit.prompt.buildDeploy.create.content' })
          : intl.formatMessage({ id: 'pages.clusterEdit.prompt.buildDeploy.edit.content' })}
      </ModalContent>
    </Modal>
  );

  const deployModal = (
    <Modal
      title={(
        <ModalTitle>
          {intl.formatMessage({ id: 'pages.clusterEdit.prompt.deploy.title' })}
        </ModalTitle>
      )}
      open={showDeployModal}
      footer={[
        <Button
          onClick={onDeployButtonOK}
          type="primary"
        >
          {intl.formatMessage({ id: 'pages.cluster.action.deploy' })}
        </Button>,
      ]}
      onCancel={onButtonCancel}
    >
      <ModalContent>
        {creating
          ? intl.formatMessage({ id: 'pages.clusterEdit.prompt.deploy.create.content' })
          : intl.formatMessage({ id: 'pages.clusterEdit.prompt.deploy.edit.content' })}
      </ModalContent>
    </Modal>
  );

  return (
    <PageWithBreadcrumb>
      <Row>
        <Col span={4}>
          <Affix offsetTop={50}>
            <Step>
              <HSteps current={current} onChange={onCurrentChange} steps={steps} />
            </Step>
          </Affix>
        </Col>
        <Col span={20}>
          <StepContent>
            {
              current === 0 && (
              <Basic
                form={form}
                applicationName={applicationName}
                formData={basicInfo}
                setFormData={setBasicFormData}
                editing={editing}
                status={cluster?.status}
              />
              )
            }
            {
              current === 1 && (
              <Build
                buildConfig={buildConfig}
                setBuildConfig={setBuildConfig}
                setBuildConfigErrors={setBuildConfigErrors}
              />
              )
            }
            {
              current === 2 && (
              <Deploy
                template={templateBasic}
                release={releaseName}
                setReleaseName={setReleaseName}
                templateConfig={templateConfig}
                setTemplateConfig={setTemplateConfig}
                setTemplateConfigErrors={setTemplateConfigErrors}
                clusterID={cluster?.id}
                resourceType={ResourceType.CLUSTER}
              />
              )
            }
            {
              current === 3 && (
              <Audit
                form={form}
                applicationName={applicationName}
                editing={editing}
                buildConfig={buildConfig}
                templateBasic={templateBasic}
                release={releaseName}
                templateConfig={templateConfig}
                clusterID={cluster?.id}
                buildFormRef={buildFormRef}
                templateFormRef={templateFormRef}
                onBuildSubmit={onBuildSubmit}
                onDeploySubmit={onDeploySubmit}
              />
              )
            }
          </StepContent>
          <StepAction>
            {current > 0 && (
              <Button style={{ margin: '0 8px' }} onClick={() => prev()}>
                {intl.formatMessage({ id: 'pages.common.back' })}
              </Button>
            )}
            {current === steps.length - 1 && (
              <Button
                type="primary"
                onClick={() => {
                  buildFormRef.current.submit();
                  templateFormRef.current.submit();
                }}
                loading={loading}
              >
                {intl.formatMessage({ id: 'pages.common.submit' })}
              </Button>
            )}
            {current < steps.length - 1 && (
              <Button type="primary" disabled={!currentStepIsValid(current)} onClick={() => next()}>
                {intl.formatMessage({ id: 'pages.common.next' })}
              </Button>
            )}
            {buildDeployModal}
            {deployModal}
            <RebuilddeployModal
              open={enableRebuilddeployModal}
              setOpen={setEnableRebuilddeployModal}
              onCancel={() => {
                setEnableRebuilddeployModal(false);
                onButtonCancel();
              }}
              clusterID={id}
              clusterFullPath={cluster?.fullPath ?? ''}
            />
          </StepAction>
        </Col>
      </Row>
    </PageWithBreadcrumb>
  );
};
