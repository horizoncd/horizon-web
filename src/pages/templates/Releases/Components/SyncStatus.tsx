import { QuestionCircleOutlined } from '@ant-design/icons';
import { Popover, Space } from 'antd';
import { StatusCode } from '@/services/templates/templates';

const StatusCodeSettings: Record<StatusCode, { color: string, hint?: string, title: string }> = {
  [StatusCode.StatusSucceed]: {
    title: 'Success',
    color: '#52c41a',
  },
  [StatusCode.StatusFailed]: {
    title: 'Failed',
    color: '#cf1322',
  },
  [StatusCode.StatusOutOfSync]: {
    title: 'OutOfSync',
    color: '#fa8c16',
    hint: 'git仓库对应tag发生了改变，需要用户手动Sync',
  },
  [StatusCode.StatusUnknown]: {
    title: 'Unknown',
    color: '#8c8c8c',
  },
};

interface SyncStatusProps {
  statusCode: StatusCode
}
function SyncStatus(props: SyncStatusProps): React.ReactElement | null {
  const { statusCode } = props;
  if (!statusCode) {
    return null;
  }
  const setting = StatusCodeSettings[statusCode];
  return (
    <span style={{ color: setting.color }}>
      <Space size={3}>
        {setting.title}
        {
        setting.hint
          && (
            <Popover content={setting.hint}>
              <QuestionCircleOutlined />
            </Popover>
          )
          }
      </Space>
    </span>
  );
}

export default SyncStatus;
