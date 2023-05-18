import {
  Button,
  Card, Table,
} from 'antd';
import { useIntl } from 'umi';
import {
  ReactNode, useMemo, useState,
} from 'react';
import styles from './index.less';
import { BoldText } from '@/components/Widget';
import { CardTitle } from '@/pages/clusters/Detail/Widget';
import DynamicTagForm, { ValueType } from './DynamicTagForm';

interface TagCardProps {
  title: string,
  extra?: ReactNode
  tags?: TAG.Tag[]
  updateDisabled?: boolean,
  onUpdate?: (tags: API.Tags) => void,
}

function TagCard(props: TagCardProps) {
  const {
    tags, title, onUpdate = () => {}, updateDisabled = false,
  } = props;
  let { extra } = props;

  const [editing, setEditing] = useState(false);
  const intl = useIntl();
  const editButton = useMemo(() => {
    if (!editing) {
      return (
        <Button onClick={() => setEditing(true)}>
          {intl.formatMessage({ id: 'pages.common.edit' })}
        </Button>
      );
    }
    return (
      <Button onClick={() => setEditing(false)}>
        {intl.formatMessage({ id: 'pages.common.cancel' })}
      </Button>
    );
  }, [editing, intl]);

  if (!extra && !updateDisabled) {
    extra = editButton;
  }

  const tagColumns = useMemo(() => [
    {
      title: <BoldText>{intl.formatMessage({ id: 'pages.tags.key' })}</BoldText>,
      dataIndex: 'key',
      key: 'key',
      width: '30%',
      className: styles.tableHeader,
    },
    {
      title: <BoldText>{intl.formatMessage({ id: 'pages.tags.value' })}</BoldText>,
      dataIndex: 'value',
      key: 'value',
      width: '70%',
      className: styles.tableHeader,
    },
  ], [intl]);

  const content = useMemo(() => (editing
    ? (

      <DynamicTagForm
        queryTags={async () => ({ data: { tags: tags ?? [] } })}
        updateTags={async (t) => onUpdate(t)}
        valueType={ValueType.Single}
        callback={() => setEditing(false)}
      />
    )
    : (
      <Table
        tableLayout="fixed"
        dataSource={tags}
        columns={tagColumns}
      />
    )), [editing, onUpdate, tagColumns, tags]);

  return (
    <Card
      title={(
        <div style={{ display: 'flex' }}>
          <CardTitle>{title}</CardTitle>
          <div style={{ flex: 1 }} />
          {extra}
        </div>
)}
      type="inner"
    >
      {content }
    </Card>
  );
}

export default TagCard;
