import { QuestionCircleOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { useIntl } from 'umi';
import DangerMessage from '@/components/Widget/DangerMessage';

function BanHint(props: { isBanned: boolean }) {
  const { isBanned } = props;
  const intl = useIntl();
  return isBanned
    ? (
      <DangerMessage>
        {intl.formatMessage({ id: 'pages.common.true' })}
        {' '}
        <Tooltip title={intl.formatMessage({ id: 'pages.message.user.banned.desc' })}>
          <QuestionCircleOutlined />
        </Tooltip>
      </DangerMessage>
    )
    : <span>{intl.formatMessage({ id: 'pages.common.false' })}</span>;
}

export default BanHint;
