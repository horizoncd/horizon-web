import { useIntl } from 'umi';

const Intl = (props: {
  id: string;
  defaultMessage?: string;
}) => {
  const { id, defaultMessage } = props;
  const intl = useIntl();
  return (
    <div>
      {intl.formatMessage({
        id,
        defaultMessage,
      })}
    </div>
  );
};

Intl.defaultProps = {
  defaultMessage: 'default message',
};

export default Intl;
