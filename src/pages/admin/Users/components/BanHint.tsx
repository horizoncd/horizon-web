import { QuestionCircleOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import DangerMessage from '@/components/Widget/DangerMessage';

function BanHint(props: { isBanned: boolean }) {
  const { isBanned } = props;
  return isBanned
    ? (
      <DangerMessage>
        禁止
        {' '}
        <Tooltip title="该用户已被禁止登录">
          <QuestionCircleOutlined />
        </Tooltip>
      </DangerMessage>
    )
    : <span>未禁止</span>;
}

export default BanHint;
