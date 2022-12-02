import { Form, Select } from 'antd';
import { useRequest, useIntl } from 'umi';
import { listGitRef } from '@/services/code/code';

const { Option } = Select;

const TagSelector = (props: { repository: string, prefix: string[] }) => {
  const { repository, prefix } = props;
  const intl = useIntl();
  const { data: tags } = useRequest((filter?: string) => listGitRef({
    refType: 'tag',
    giturl: repository,
    filter,
    pageNumber: 1,
    pageSize: 50,
  }), {
    debounceInterval: 100,
    ready: true,
  });

  return (
    <Form.Item
      label={intl.formatMessage({ id: 'pages.template.release' })}
      name={prefix.length === 0 ? 'name' : [...prefix, 'name']}
      required
      rules={[{ required: true }]}
      extra={intl.formatMessage({ id: 'pages.message.release.extra' })}
    >
      <Select>
        {tags && tags.map((s) => <Option key={s} value={s}>{s}</Option>)}
      </Select>
    </Form.Item>
  );
};

export default TagSelector;
