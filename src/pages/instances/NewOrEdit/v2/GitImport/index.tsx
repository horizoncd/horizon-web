import {
  Affix, Button, Col, Form, Modal, Row,
} from 'antd';
import { useRequest } from 'umi';
import {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import { useIntl } from '@@/plugin-locale/localeExports';
import { useModel } from '@@/plugin-model/useModel';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import HSteps from '@/components/HSteps';
import BaseInfoForm from '../components/BaseInfoForm';
import BuildConfigForm from '@/components/neworedit/components/BuildConfigForm';
import DeployConfigForm from '@/components/neworedit/components/DeployConfigForm';
import { getApplicationEnvTemplate } from '@/services/applications/applications';
import { getApplicationV2 } from '@/services/applications/applications';
import {
  createClusterV2, updateClusterV2, getClusterV2,
} from '@/services/clusters/clusters';
import { parseGitRef } from '@/services/code/code';
import { AppOrClusterType, PublishType, ResourceKey } from '@/const';
import {
  Step, StepContent, StepAction, ModalTitle, ModalContent,
} from '@/pages/instances/NewOrEdit/Widget';
import { ResourceType } from '@/const';
import { difference } from '@/utils';
import { RebuilddeployModal } from '@/components/rollout';
import { MaxSpace } from '@/components/Widget';
import { CatalogType } from '@/services/core';
import TemplateForm from '@/components/neworedit/components/TemplateForm';

export default (props: any) => {
  const intl = useIntl();

  const gitKey = 'git';
  const buildConfigKey = 'buildConfig';
  const templateBasicKey = 'templateBasic';
  const templateConfigKey = 'templateConfig';

  const { initialState } = useModel('@@initialState');
  const { id } = initialState!.resource;

  const { location } = props;
  const { query, pathname } = location;
  const { environment: envFromQuery, sourceClusterID } = query;
  const editing = pathname.endsWith('editv2/git');
  const creating = pathname.endsWith('newinstancev2/git');
  const copying = !!sourceClusterID;

  const { successAlert } = useModel('alert');
  const [form] = Form.useForm();
  const buildFormRef = useRef();
  const templateFormRef = useRef();
  const [applicationName, setApplicationName] = useState('');
  const [current, setCurrent] = useState(0);
  const [cluster, setCluster] = useState<CLUSTER.ClusterV2>();
  const [originConfig, setOriginConfig] = useState({});
  const [buildConfig, setBuildConfig] = useState({});
  const [templateBasic, setTemplateBasic] = useState({ name: '' });
  const [releaseName, setReleaseName] = useState('');
  const [templateConfig, setTemplateConfig] = useState({});
  const [buildSubmitted, setBuildSubmitted] = useState(false);
  const [deploySubmitted, setDeploySubmitted] = useState(false);
  const [showBuildDeployModal, setShowBuildDeployModal] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [enableRebuilddeployModal, setEnableRebuilddeployModal] = useState(false);
  const [baseInfoValid, setBaseInfoValid] = useState<boolean>(false);
  const [buildConfigValid, setBuildConfigValid] = useState<boolean>(true);
  const [deployConfigValid, setDeployConfigValid] = useState<boolean>(false);
  const [useHistoryConfig, setUseHistoryConfig] = useState<boolean>(false);

  const pageOrders = useMemo(() => (editing ? [0, 1, 3, 4] : [0, 1, 2, 3, 4]), [editing]);

  const fillDefaultConfig = (data: API.GetApplicationResponseV2) => {
    setBuildConfig(data!.buildConfig);

    const basicTemplateInfo: API.Template = {
      name: data!.templateInfo!.name,
    };
    setTemplateBasic(basicTemplateInfo);
    setReleaseName(data!.templateInfo!.release);

    setTemplateConfig(data!.templateConfig);
  };

  useEffect(() => {
    const data = window.history.state?.defaultAppData;
    if (data) {
      setUseHistoryConfig(true);
      fillDefaultConfig(data);
    }
  }, []);

  const resetTemplate = useCallback((t: API.Template) => {
    setTemplateBasic({ name: t.name });
    setReleaseName('');
  }, []);

  const currentStepIsValid = (cur: number) => {
    let valid: boolean;
    switch (cur) {
      case 0:
        valid = baseInfoValid;
        break;
      case 1:
        valid = baseInfoValid && buildConfigValid;
        break;
      case 2:
        valid = baseInfoValid && buildConfigValid && !!templateBasic.name;
        break;
      case 3:
      case 4:
        valid = baseInfoValid && buildConfigValid && !!templateBasic.name
        && deployConfigValid;
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
      title: intl.formatMessage({ id: 'pages.newV2.deploy.template' }),
      disabled: !currentStepIsValid(1),
    },
    {
      title: intl.formatMessage({ id: 'pages.newV2.step.deploy' }),
      disabled: !currentStepIsValid(1),
    },
    {
      title: intl.formatMessage({ id: 'pages.newV2.step.audit' }),
      disabled: !currentStepIsValid(2),
    },
  ].filter((_, index) => pageOrders.includes(index));

  const onCurrentChange = (cur: number) => {
    setCurrent(cur);
  };
  const prev = () => {
    setCurrent(current - 1);
  };
  const next = () => {
    setCurrent(current + 1);
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
    ready: creating && !useHistoryConfig,
    manual: true,
  });

  // query application if creating
  useRequest(() => getApplicationV2(id), {
    ready: creating,
    onSuccess: (data) => {
      const { git, name: appName, tags: appTags } = data;
      setApplicationName(appName);
      if (!copying) {
        // basicInfo
        const { gitRefType, gitRef } = parseGitRef(data.git);
        form.setFields([
          { name: ResourceKey.ENVIRONMENT, value: envFromQuery },
          { name: ResourceKey.TAGS, value: appTags },
          { name: ResourceKey.GIT_URL, value: git.url },
          { name: ResourceKey.GIT_SUB_FOLDER, value: git.subfolder },
          { name: ResourceKey.GIT_REF_TYPE, value: gitRefType },
          { name: ResourceKey.GIT_REF_VALUE, value: gitRef },
        ]);

        if (!useHistoryConfig) {
          fillDefaultConfig(data);
        }
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
              tags: clusterTags,
            } = clusterData!;
            const { environment: e, region: r } = scope;
            const { url: u, subfolder: s } = g;
            const { gitRefType, gitRef } = parseGitRef(g);
            form.setFields([
              { name: ResourceKey.DESCRIPTION, value: d },
              { name: ResourceKey.ENVIRONMENT, value: e },
              { name: ResourceKey.REGION, value: r },
              { name: ResourceKey.EXPIRE_TIME, value: expireTime },
              { name: ResourceKey.TAGS, value: clusterTags },
              { name: ResourceKey.GIT_URL, value: u },
              { name: ResourceKey.GIT_SUB_FOLDER, value: s },
              { name: ResourceKey.GIT_REF_TYPE, value: gitRefType },
              { name: ResourceKey.GIT_REF_VALUE, value: gitRef },
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

  // query cluster if editing
  useRequest(() => getClusterV2(id), {
    ready: editing,
    onSuccess: (data) => {
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
        tags: clusterTags,
      } = data;
      const { environment: e, region: r } = scope;
      const { url: u, subfolder: s } = git;
      const { gitRefType, gitRef } = parseGitRef(git);
      form.setFields([
        { name: ResourceKey.NAME, value: n },
        { name: ResourceKey.DESCRIPTION, value: d },
        { name: ResourceKey.ENVIRONMENT, value: e },
        { name: ResourceKey.REGION, value: r },
        { name: ResourceKey.EXPIRE_TIME, value: expireTime },
        { name: ResourceKey.TAGS, value: clusterTags },
        { name: ResourceKey.GIT_URL, value: u },
        { name: ResourceKey.GIT_SUB_FOLDER, value: s },
        { name: ResourceKey.GIT_REF_TYPE, value: gitRefType },
        { name: ResourceKey.GIT_REF_VALUE, value: gitRef },
      ]);
      setOriginConfig({
        git,
        buildConfig: bc,
        templateBasic: ti,
        templateConfig: tc,
      });
      setBuildConfig(bc);
      setTemplateBasic(ti);
      setReleaseName(ti.release);
      setTemplateConfig(tc);
      setCluster(data);
    },
  });

  const onBuildAndDeployButtonOK = () => {
    setShowBuildDeployModal(false);
    if (creating) {
      window.location.href = `/instances${cluster!.fullPath}/-/pipelines/new?type=${PublishType.BUILD_DEPLOY}`;
    } else {
      setEnableRebuilddeployModal(true);
    }
  };

  const onDeployButtonOK = () => {
    window.location.href = `/instances${cluster!.fullPath}/-/pipelines/new?type=${PublishType.DEPLOY}`;
  };

  const onButtonCancel = () => {
    // jump to cluster's home page
    window.location.href = cluster!.fullPath;
  };

  const { loading, run: submitCluster } = useRequest(() => {
    const info = {
      name: form.getFieldValue(ResourceKey.NAME),
      description: form.getFieldValue(ResourceKey.DESCRIPTION),
      expireTime: form.getFieldValue(ResourceKey.EXPIRE_TIME),
      tags: form.getFieldValue(ResourceKey.TAGS) ?? [],
      git: {
        url: form.getFieldValue(ResourceKey.GIT_URL),
        subfolder: form.getFieldValue(ResourceKey.GIT_SUB_FOLDER) || '',
        [form.getFieldValue(ResourceKey.GIT_REF_TYPE)]: form.getFieldValue(ResourceKey.GIT_REF_VALUE),
      },
      buildConfig,
      templateInfo: {
        name: templateBasic.name,
        release: releaseName,
      },
      templateConfig,
    };
    if (creating) {
      return createClusterV2(
        id,
        `${form.getFieldValue(ResourceKey.ENVIRONMENT)}/${form.getFieldValue(ResourceKey.REGION)}`,
        info,
      );
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
            git: clusterData.git,
            buildConfig: clusterData.buildConfig,
            templateBasic: clusterData.templateInfo,
            templateConfig: clusterData.templateConfig,
          };
          const configDiff = difference(currentConfig, originConfig);
          if (Object.keys(configDiff).includes(gitKey)
            || Object.keys(configDiff).includes(buildConfigKey)) {
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
              pageOrders[current] === 0 && (
                <BaseInfoForm
                  form={form}
                  appName={applicationName}
                  clusterType={AppOrClusterType.GIT}
                  clusterStatus={cluster?.status}
                  editing={editing}
                  setValid={setBaseInfoValid}
                  onEnvChange={refreshAppEnvTemplate}
                />
              )
            }
            {
              pageOrders[current] === 1 && (
                <BuildConfigForm
                  buildConfig={buildConfig}
                  setBuildConfig={setBuildConfig}
                  setValid={setBuildConfigValid}
                />
              )
            }
            {
              // deploy template
              pageOrders[current] === 2 && (
                <TemplateForm
                  template={templateBasic}
                  resetTemplate={resetTemplate}
                  type={CatalogType.Workload}
                />
              )
            }
            {
              pageOrders[current] === 3 && (
                <DeployConfigForm
                  template={templateBasic}
                  release={releaseName}
                  setReleaseName={setReleaseName}
                  templateConfig={templateConfig}
                  setTemplateConfig={setTemplateConfig}
                  setValid={setDeployConfigValid}
                  clusterID={cluster?.id}
                  resourceType={ResourceType.INSTANCE}
                />
              )
            }
            {
              pageOrders[current] === 4 && (
                <MaxSpace
                  direction="vertical"
                  size="middle"
                >
                  <BaseInfoForm
                    readOnly
                    form={form}
                    editing={editing}
                    appName={applicationName}
                    clusterType={AppOrClusterType.GIT}
                  />
                  <BuildConfigForm
                    readOnly
                    ref={buildFormRef}
                    buildConfig={buildConfig}
                    onSubmit={onBuildSubmit}
                  />
                  <DeployConfigForm
                    readOnly
                    clusterID={cluster?.id}
                    resourceType={ResourceType.INSTANCE}
                    template={templateBasic}
                    release={releaseName}
                    templateConfig={templateConfig}
                    ref={templateFormRef}
                    onSubmit={onDeploySubmit}
                  />
                </MaxSpace>
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
