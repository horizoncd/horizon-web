import {
  Affix, Button, Col, Form, Modal, Row,
} from 'antd';
import { useRequest } from 'umi';
import { useEffect, useRef, useState } from 'react';
import { useIntl } from '@@/plugin-locale/localeExports';
import { useModel } from '@@/plugin-model/useModel';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import HSteps from '@/components/HSteps';
import BaseInfoForm from '../components/BaseInfoForm';
import DeployConfigForm from '@/pages/applications/NewOrEdit/v2/components/DeployConfigForm';
import { getApplicationEnvTemplate } from '@/services/applications/applications';
import { getApplicationV2 } from '@/services/applications/applications';
import {
  createClusterV2, updateClusterV2, getClusterV2,
} from '@/services/clusters/clusters';
import { AppOrClusterType, PublishType, ResourceKey } from '@/const';
import {
  Step, StepContent, StepAction, ModalTitle, ModalContent,
} from '@/pages/clusters/NewOrEdit/Widget';
import { ResourceType } from '@/const';
import { difference } from '@/utils';
import { RebuilddeployModal } from '@/components/rollout';
import { MaxSpace } from '@/components/Widget';

export default (props: any) => {
  const intl = useIntl();

  const buildConfigKey = 'buildConfig';
  const templateBasicKey = 'templateBasic';
  const templateConfigKey = 'templateConfig';

  const { initialState } = useModel('@@initialState');
  const { id } = initialState!.resource;

  const { location } = props;
  const { query, pathname } = location;
  const { environment: envFromQuery, sourceClusterID } = query;
  const editing = pathname.endsWith('editv2/imagedeploy');
  const creating = pathname.endsWith('newclusterv2/imagedeploy');
  const copying = !!sourceClusterID;

  const { successAlert } = useModel('alert');
  const [form] = Form.useForm();
  const templateFormRef = useRef();
  const [applicationName, setApplicationName] = useState('');
  const [current, setCurrent] = useState(0);
  const [cluster, setCluster] = useState<CLUSTER.ClusterV2>();
  const [originConfig, setOriginConfig] = useState({});
  const [buildConfig, setBuildConfig] = useState({});
  const [templateBasic, setTemplateBasic] = useState({ name: '', release: '' });
  const [releaseName, setReleaseName] = useState('');
  const [templateConfig, setTemplateConfig] = useState({});
  const [deploySubmitted, setDeploySubmitted] = useState(false);
  const [showBuildDeployModal, setShowBuildDeployModal] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [enableRebuilddeployModal, setEnableRebuilddeployModal] = useState(false);
  const [baseInfoValid, setBaseInfoValid] = useState<boolean>(false);
  const [deployConfigValid, setDeployConfigValid] = useState<boolean>(false);

  const currentStepIsValid = (cur: number) => {
    let valid: boolean;
    switch (cur) {
      case 0:
        valid = baseInfoValid;
        break;
      case 1:
      case 2:
        valid = baseInfoValid && !!templateBasic.name && deployConfigValid;
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
    }, {
      title: intl.formatMessage({ id: 'pages.newV2.deploy.config' }),
      disabled: !currentStepIsValid(0),
    }, {
      title: intl.formatMessage({ id: 'pages.newV2.step.audit' }),
      disabled: !currentStepIsValid(1),
    },
  ];

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
    ready: creating,
    manual: true,
  });

  // query application if creating
  if (creating) {
    const { data } = useRequest(() => getApplicationV2(id), {
      onSuccess: () => {
        const {
          image, name: appName, tags: appTags,
        } = data!;
        setApplicationName(appName);
        if (!copying) {
          // basicInfo
          form.setFields([
            { name: ResourceKey.ENVIRONMENT, value: envFromQuery },
            { name: ResourceKey.TAGS, value: appTags },
            { name: ResourceKey.IMAGE_URL, value: image },
          ]);

          // basicTemplateInfo
          const basicTemplateInfo = {
            name: data!.templateInfo!.name,
            release: data!.templateInfo!.release,
          };
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
                tags: clusterTags,
                image: i,

                // build and deploy info
                templateInfo: ti,
                templateConfig: tc,
              } = clusterData!;
              const { environment: e, region: r } = scope;
              form.setFields([
                { name: ResourceKey.DESCRIPTION, value: d },
                { name: ResourceKey.ENVIRONMENT, value: e },
                { name: ResourceKey.REGION, value: r },
                { name: ResourceKey.EXPIRE_TIME, value: expireTime },
                { name: ResourceKey.TAGS, value: clusterTags },
                { name: ResourceKey.IMAGE_URL, value: i },
              ]);
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
          image,

          // deploy info
          templateInfo: ti,
          templateConfig: tc,
          tags: clusterTags,
        } = clusterData!;
        const { environment: e, region: r } = scope;
        form.setFields([
          { name: ResourceKey.NAME, value: n },
          { name: ResourceKey.DESCRIPTION, value: d },
          { name: ResourceKey.ENVIRONMENT, value: e },
          { name: ResourceKey.REGION, value: r },
          { name: ResourceKey.EXPIRE_TIME, value: expireTime },
          { name: ResourceKey.TAGS, value: clusterTags },
          { name: ResourceKey.IMAGE_URL, value: image },
        ]);
        setOriginConfig({
          templateBasic: ti,
          templateConfig: tc,
        });
        setTemplateBasic(ti);
        setReleaseName(ti.release);
        setTemplateConfig(tc);
        setCluster(clusterData);
      },
    });
  }

  const onBuildAndDeployButtonOK = () => {
    setShowBuildDeployModal(false);
    if (creating) {
      window.location.href = `/clusters${cluster!.fullPath}/-/pipelines/new?type=${PublishType.BUILD_DEPLOY}`;
    } else {
      setEnableRebuilddeployModal(true);
    }
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
      name: form.getFieldValue(ResourceKey.NAME),
      description: form.getFieldValue(ResourceKey.DESCRIPTION),
      expireTime: form.getFieldValue(ResourceKey.EXPIRE_TIME),
      tags: form.getFieldValue(ResourceKey.TAGS) ?? [],
      image: form.getFieldValue(ResourceKey.IMAGE_URL),
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

  const onDeploySubmit = (formData: any) => {
    setTemplateConfig(formData);
    setDeploySubmitted(true);
  };

  useEffect(() => {
    if (deploySubmitted) {
      submitCluster();
      setDeploySubmitted(false);
    }
  }, [submitCluster, deploySubmitted]);

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
              <BaseInfoForm
                form={form}
                appName={applicationName}
                clusterType={AppOrClusterType.IMAGE_DEPLOY}
                clusterStatus={cluster?.status}
                editing={editing}
                setValid={setBaseInfoValid}
                onEnvChange={refreshAppEnvTemplate}
              />
              )
            }
            {
              current === 1 && (
              <DeployConfigForm
                template={templateBasic}
                release={releaseName}
                setReleaseName={setReleaseName}
                templateConfig={templateConfig}
                setTemplateConfig={setTemplateConfig}
                setValid={setDeployConfigValid}
                clusterID={cluster?.id}
                resourceType={ResourceType.CLUSTER}
              />
              )
            }
            {
              current === 2 && (
                <MaxSpace
                  direction="vertical"
                  size="middle"
                >
                  <BaseInfoForm
                    readOnly
                    form={form}
                    editing={editing}
                    appName={applicationName}
                    clusterType={AppOrClusterType.IMAGE_DEPLOY}
                  />
                  <DeployConfigForm
                    readOnly
                    clusterID={cluster?.id}
                    resourceType={ResourceType.CLUSTER}
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
