import {
  Affix, Button, Col, Form, Modal, Row,
} from 'antd';
import { useHistory, useRequest } from 'umi';
import {
  useEffect, useMemo, useRef, useState,
} from 'react';
import { useIntl } from '@@/plugin-locale/localeExports';
import { useModel } from '@@/plugin-model/useModel';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import HSteps from '@/components/HSteps';
import BaseInfoForm from '../components/BaseInfoForm';
import DeployConfigForm from '@/components/neworedit/components/DeployConfigForm';
import { getApplicationEnvTemplate } from '@/services/applications/applications';
import { getApplicationV2 } from '@/services/applications/applications';
import {
  createClusterV2, updateClusterV2, getClusterV2,
} from '@/services/clusters/clusters';
import { AppOrClusterType, PublishType, ResourceKey } from '@/const';
import {
  Step, StepContent, StepAction, ModalTitle, ModalContent,
} from '@/pages/instances/NewOrEdit/Widget';
import { ResourceType } from '@/const';
import { difference } from '@/utils';
import { RebuilddeployModal } from '@/components/rollout';
import { MaxSpace } from '@/components/Widget';
import TemplateForm from '@/components/neworedit/components/TemplateForm';
import { CatalogType } from '@/services/core';

export default (props: any) => {
  const intl = useIntl();

  const { initialState } = useModel('@@initialState');
  const { id } = initialState!.resource;

  const { location } = props;
  const { query, pathname } = location;
  const { environment: envFromQuery, sourceClusterID } = query;
  const editing = pathname.endsWith('editv2/chart');
  const creating = pathname.endsWith('newinstancev2/chart');
  const copying = !!sourceClusterID;

  const { successAlert } = useModel('alert');
  const [form] = Form.useForm();
  const templateFormRef = useRef();
  const [applicationName, setApplicationName] = useState('');
  const [current, setCurrent] = useState(0);
  const [cluster, setCluster] = useState<CLUSTER.ClusterV2>();
  const [originConfig, setOriginConfig] = useState({});
  const [releaseName, setReleaseName] = useState('');
  const [templateConfig, setTemplateConfig] = useState({});
  const [deploySubmitted, setDeploySubmitted] = useState(false);
  const [showBuildDeployModal, setShowBuildDeployModal] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [enableRebuilddeployModal, setEnableRebuilddeployModal] = useState(false);
  const [baseInfoValid, setBaseInfoValid] = useState<boolean>(false);
  const [deployConfigValid, setDeployConfigValid] = useState<boolean>(false);

  const history = useHistory<{ template?: Templates.Template }>();
  const [templateBasic, setTemplateBasic] = useState(history.location.state.template);
  const pageOrders = useMemo(() => (templateBasic ? [0, 2, 3] : [0, 1, 2, 3]), [templateBasic]);

  const currentStepIsValid = (cur: number) => {
    let valid: boolean;
    switch (cur) {
      case 0:
        valid = baseInfoValid;
        break;
      case 1:
        valid = baseInfoValid && !!templateBasic && !!templateBasic.name;
        break;
      case 2:
        valid = baseInfoValid && !!templateBasic && !!templateBasic.name && deployConfigValid;
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
      title: intl.formatMessage({ id: 'pages.newV2.deploy.template' }),
      disabled: !currentStepIsValid(0),
    }, {
      title: intl.formatMessage({ id: 'pages.newV2.deploy.config' }),
      disabled: !currentStepIsValid(1),
    }, {
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
      if (data!.application) {
        setTemplateConfig(data!.application);
      }
    },
    ready: creating,
    manual: true,
  });

  // query application if creating
  useRequest(() => getApplicationV2(id), {
    ready: creating && !copying,
    onSuccess: (data) => {
      const {
        name: appName, tags: appTags,
      } = data;
      setApplicationName(appName);
      // basicInfo
      form.setFields([
        { name: ResourceKey.ENVIRONMENT, value: envFromQuery },
        { name: ResourceKey.TAGS, value: appTags },
      ]);

      // basicTemplateInfo
      const basicTemplateInfo = {
        name: data.templateInfo!.name,
        release: data.templateInfo!.release,
      };
      // todo(zx): remove
      if (templateBasic.name === data.templateInfo!.name) {
        setTemplateBasic(basicTemplateInfo);
        setReleaseName(data.templateInfo!.release);
        setTemplateConfig(data.templateConfig);
        refreshAppEnvTemplate(envFromQuery);
      }
    },
  });

  // copy cluster
  useRequest(() => getClusterV2(sourceClusterID), {
    ready: creating && copying,
    onSuccess: (sourceCluster) => {
      const {
        applicationName: appName,
      } = sourceCluster;
      setApplicationName(appName);
      const {
        // basic info
        description: d,
        scope,
        expireTime,
        tags: clusterTags,

        // build and deploy info
        templateInfo: ti,
        templateConfig: tc,
      } = sourceCluster;
      const { environment: e, region: r } = scope;
      form.setFields([
        { name: ResourceKey.DESCRIPTION, value: d },
        { name: ResourceKey.ENVIRONMENT, value: e },
        { name: ResourceKey.REGION, value: r },
        { name: ResourceKey.EXPIRE_TIME, value: expireTime },
        { name: ResourceKey.TAGS, value: clusterTags },
      ]);
      setTemplateBasic(ti);
      setReleaseName(ti.release);
      setTemplateConfig(tc);
      setCluster(sourceCluster);
    },
  });

  // query cluster if editing
  useRequest(() => getClusterV2(id), {
    ready: editing,
    onSuccess: (data) => {
      const clusterData = data;
      const {
        // basic info
        name: n,
        description: d,
        scope,
        expireTime,

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
        setShowDeployModal(true);
      } else if (editing) {
        getClusterV2(id).then(({ data: clusterData }) => {
          const currentConfig = {
            templateBasic: clusterData.templateInfo,
            templateConfig: clusterData.templateConfig,
          };
          const configDiff = difference(currentConfig, originConfig);
          if (Object.keys(configDiff).length > 0) {
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
                  clusterType={AppOrClusterType.CHART}
                  clusterStatus={cluster?.status}
                  editing={editing}
                  setValid={setBaseInfoValid}
                  onEnvChange={refreshAppEnvTemplate}
                />
              )
            }
            {
              current === 1 && pageOrders.includes(current) && (
                <TemplateForm
                  template={templateBasic}
                  type={[CatalogType.Database, CatalogType.Middleware, CatalogType.Other]}
                  resetTemplate={(t) => {
                    setTemplateBasic({ name: t.name, release: '' });
                    setReleaseName('');
                  }}
                />
              )
            }
            {
              pageOrders[current] === 2 && (
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
              pageOrders[current] === 3 && (
                <MaxSpace
                  direction="vertical"
                  size="middle"
                >
                  <BaseInfoForm
                    readOnly
                    form={form}
                    editing={editing}
                    appName={applicationName}
                    clusterType={AppOrClusterType.CHART}
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
