import {
  CheckCircleFilled, CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined, PauseCircleOutlined, QuestionCircleOutlined, StopOutlined,
} from '@ant-design/icons';
import {
  Row, Col, Card, Divider, Button, Space, ButtonProps,
} from 'antd';
import { ReactNode, useCallback, useMemo } from 'react';
import {
  useHistory, useIntl, useModel, useRequest,
} from 'umi';
import styled from 'styled-components';
import {
  cancelPipelineRun, runPipelineRun, forceRunPipelineRun,
} from '@/services/pipelineruns/pipelineruns';
import rbac from '@/rbac';
import { RandomAvatar } from '@/components/Widget';

const ThinDivider = styled(Divider)`
  margin-top: 10px;
  margin-bottom: 10px;
`;

const LightText = styled.span`
  color: #787878;
  font-size: 0.8em;
`;

interface StatusProps {
  kind: 'ready' | 'cancelled' | 'pending' | 'running' | 'created' | 'ok' | 'failed' | string;
}

const Status = (props: StatusProps) => {
  const { kind } = props;
  const intl = useIntl();
  const params = useMemo(() => {
    switch (kind) {
      case 'ready':
        return {
          color: 'green',
          kind: 'ready',
        };
      case 'cancelled':
        return {
          color: 'grey',
          kind: 'cancelled',
        };
      case 'pending':
        return {
          color: 'orange',
          kind: 'pending',
        };
      case 'running':
      case 'created':
      case 'ok':
      case 'failed':
        return {
          color: 'green',
          kind: 'merged',
        };
      default:
        return {
          color: 'grey',
          kind: 'unknown',
        };
    }
  }, [kind]);

  return (
    <div style={{ display: 'flex', gap: '16px' }}>
      <CheckCircleFilled style={{ color: params.color, fontSize: '40px' }} />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ color: params.color, fontWeight: 'bold', fontSize: '18px' }}>
          {intl.formatMessage({ id: `pages.pipeline.mergeStatus.${params.kind}` }) }
        </span>
        <LightText>{intl.formatMessage({ id: `pages.pipeline.mergeStatus.${params.kind}.description` })}</LightText>
      </div>
    </div>
  );
};

interface ConfirmButtonProps extends Omit<ButtonProps, 'type'> {
  pipelinerunID: number;
  forceRun: boolean;
}

const ConfirmButton = (props: ConfirmButtonProps) => {
  const { pipelinerunID, forceRun: forceRunFlag } = props;
  const intl = useIntl();
  const history = useHistory();
  const { initialState } = useModel('@@initialState');
  const { fullPath } = initialState?.resource || {};

  const params = useMemo(() => {
    if (forceRunFlag) {
      return {
        color: 'orange',
        buttonContent: intl.formatMessage({ id: 'pages.pipeline.merge.confirm.force' }),
      };
    }
    return {
      color: 'green',
      buttonContent: intl.formatMessage({ id: 'pages.pipeline.merge.confirm' }),
    };
  }, [forceRunFlag, intl]);

  const { run } = useRequest(() => runPipelineRun(pipelinerunID), {
    onSuccess: () => {
      history.push(`${fullPath}`);
    },
    manual: true,
  });

  const { run: forceRun } = useRequest(() => forceRunPipelineRun(pipelinerunID), {
    onSuccess: () => {
      history.push(`${fullPath}`);
    },
    manual: true,
  });

  const onClick = useCallback(() => {
    if (forceRunFlag) {
      forceRun();
    } else {
      run();
    }
  }, [forceRunFlag, forceRun, run]);

  return (
    <Button
      type="primary"
      onClick={onClick}
      style={{ backgroundColor: params.color, borderColor: params.color }}
      {...props}
    >
      {params.buttonContent}
    </Button>
  );
};

const CancelButton = (props: { pipelinerunID: number }) => {
  const { pipelinerunID } = props;
  const intl = useIntl();
  const history = useHistory();
  const { initialState } = useModel('@@initialState');
  const { fullPath } = initialState?.resource || {};

  const { run: cancel } = useRequest(() => cancelPipelineRun(pipelinerunID), {
    onSuccess: () => {
      history.push(`${fullPath}`);
    },
    manual: true,
  });

  return (
    <Button onClick={cancel}>
      {intl.formatMessage({ id: 'pages.pipeline.merge.cancel' })}
    </Button>
  );
};

const CheckRunItem = (props: { checkrun: PIPELINES.CheckRun }) => {
  const {
    checkrun: {
      status, name, message, detailUrl,
    },
  } = props;
  const intl = useIntl();
  const params : {
    icon: ReactNode,
    color?: string,
  } = useMemo(() => {
    switch (status) {
      case 'Queue':
        return {
          icon: <PauseCircleOutlined />,
        };
      case 'InProgress':
        return {
          icon: <LoadingOutlined />,
        };
      case 'Success':
        return {
          icon: <CheckCircleOutlined />,
        };
      case 'Failure':
        return {
          icon: <CloseCircleOutlined />,
        };
      case 'Cancelled':
        return {
          icon: <StopOutlined />,
        };
      default:
        return {
          icon: <QuestionCircleOutlined />,
        };
    }
  }, [status]);

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ marginLeft: '20px' }}>
          {params.icon}
        </div>
        <RandomAvatar name={name} size={40} />
        <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{name}</span>
        <LightText style={{ marginTop: '4px', fontSize: '0.9em' }}>{message}</LightText>
        {
          detailUrl && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', flexGrow: '1' }}>
              <a
                style={{ marginRight: '20px' }}
                target="_blank"
                rel="noreferrer"
                href={detailUrl}
              >
                {intl.formatMessage({ id: 'pages.pipeline.check.detail' })}
              </a>
            </div>
          )
        }
      </div>
      <ThinDivider />
    </>
  );
};

const MergeBox = (props: { pipelinerun: PIPELINES.Pipeline, checkruns?: PIPELINES.CheckRun[] }) => {
  const { pipelinerun: { status, id }, checkruns = [] } = props;
  const needButton = useMemo(() => status === 'ready' || status === 'pending', [status]);
  return (
    <Row>
      <Col span={24}>
        <Card>
          <Status kind={status} />
          { (needButton || checkruns.length !== 0) && <ThinDivider />}
          { checkruns.map((checkrun) => <CheckRunItem checkrun={checkrun} />)}
          <Space>
            {
              needButton && (
                <>
                  <ConfirmButton
                    forceRun={status === 'pending' && rbac.Permissions.forceRunPipelineRun.allowed}
                    pipelinerunID={id}
                    disabled={status === 'pending' && !rbac.Permissions.forceRunPipelineRun.allowed}
                  />
                  <CancelButton pipelinerunID={id} />
                </>
              )
            }
          </Space>
        </Card>
      </Col>
    </Row>
  );
};

export default MergeBox;
