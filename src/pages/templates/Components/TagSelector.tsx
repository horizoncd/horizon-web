import { Form, Select } from 'antd';
import { useRequest } from 'umi';
import { listGitRef } from '@/services/code/code';

const { Option } = Select;

const TagSelector = (props: { repository: string, prefix: string[] }) => {
  const { repository, prefix } = props;
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
      label="版本"
      name={prefix.length === 0 ? 'name' : [...prefix, 'name']}
      required
      rules={[{ required: true }]}
      extra="release对应template的版本"
    >
      <Select>
        {tags && tags.map((s) => <Option key={s} value={s}>{s}</Option>)}
      </Select>
    </Form.Item>
  );
};

export default TagSelector;
