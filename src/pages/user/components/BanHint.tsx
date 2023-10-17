import { QuestionCircleOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { useIntl } from 'umi';
import { DangerText } from '@/components/Widget';

function BanHint(props: { isBanned: boolean }) {
  const { isBanned } = props;
  const intl = useIntl();
  return isBanned
    ? (
      <DangerText>
        {intl.formatMessage({ id: 'pages.common.true' })}
        {' '}
        <Tooltip title={intl.formatMessage({ id: 'pages.message.user.banned.desc' })}>
          <QuestionCircleOutlined />
        </Tooltip>
      </DangerText>
    )
    : <span>{intl.formatMessage({ id: 'pages.common.false' })}</span>;
}

export default BanHint;
