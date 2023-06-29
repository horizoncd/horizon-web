import { Form, Input, Select } from 'antd';
import { useIntl } from 'umi';

const { Option } = Select;
const { TextArea } = Input;

export const TemplateForm = (props: { editRepository?: boolean, onRepositoryBlur: (s: string) => void }) => {
  const { onRepositoryBlur, editRepository } = props;
  const intl = useIntl();

  const formatMessage = (suffix: string) => intl.formatMessage({ id: `pages.template.${suffix}` });

  return (
    <div>
      <Form.Item
        label={formatMessage('type')}
        name="type"
        extra={intl.formatMessage({ id: 'pages.template.type.extra' })}
      >
        <Select>
          <Option key="database" value="database">{intl.formatMessage({ id: 'pages.catalog.database' })}</Option>
          <Option key="middleware" value="middleware">{intl.formatMessage({ id: 'pages.catalog.middleware' })}</Option>
          <Option key="workload" value="workload">{intl.formatMessage({ id: 'pages.catalog.workload' })}</Option>
          <Option key="other" value="other">{intl.formatMessage({ id: 'pages.catalog.other' })}</Option>
          <Option key="v1" value="v1">{intl.formatMessage({ id: 'pages.catalog.v1' })}</Option>
        </Select>
      </Form.Item>
      <Form.Item
        label={formatMessage('description')}
        name="description"
        extra={intl.formatMessage({ id: 'pages.message.template.desc.extra' })}
      >
        <TextArea autoSize={{ minRows: 2, maxRows: 6 }} />
      </Form.Item>
      <Form.Item
        label={formatMessage('onlyOwner')}
        name="onlyOwner"
        initialValue={false}
        required
        rules={[{ required: true }]}
        extra={intl.formatMessage({ id: 'pages.message.template.onlyOwner.extra' })}
      >
        <Select>
          <Option key="true" value>{intl.formatMessage({ id: 'pages.common.yes' })}</Option>
          <Option key="false" value={false}>{intl.formatMessage({ id: 'pages.common.no' })}</Option>
        </Select>
      </Form.Item>
      <Form.Item
        label={formatMessage('gitRepo')}
        name="repository"
        required
        rules={[
          {
            required: true,
          },
          {
            type: 'regexp',
            warningOnly: true,
          },
          {
            pattern: /^(?:http(?:s?)|ssh):\/\/.+?\/(.+?)(?:.git)?$/,
            message: intl.formatMessage({ id: 'pages.message.template.gitRepo.ruleMessage' }),
          },
        ]}
        extra={!editRepository
          ? intl.formatMessage({ id: 'pages.message.template.gitRepo.noEdit' })
          : intl.formatMessage({ id: 'pages.message.template.gitRepo.extra' })}
      >
        <Input
          disabled={!editRepository}
          onBlur={(i) => onRepositoryBlur(i.target.value)}
        />
      </Form.Item>
    </div>
  );
};

TemplateForm.defaultProps = {
  editRepository: true,
};

export const ReleaseForm = (props: { prefix: string[] }) => {
  const { prefix } = props;
  const intl = useIntl();

  const calculateName = (name: string) => {
    if (prefix.length === 0) {
      return name;
    }
    return [...prefix, name];
  };

  const formatMessage = (suffix: string) => intl.formatMessage({ id: `pages.template.${suffix}` });

  return (
    <div>
      <Form.Item
        label={formatMessage('description')}
        name={calculateName('description')}
        extra={intl.formatMessage({ id: 'pages.message.release.desc.extra' })}
      >
        <TextArea autoSize={{ minRows: 2, maxRows: 6 }} />
      </Form.Item>
      <Form.Item
        label={formatMessage('onlyOwner')}
        name={calculateName('onlyOwner')}
        required
        initialValue={false}
        rules={[{ required: true }]}
        extra={intl.formatMessage({ id: 'pages.message.release.onlyOwner.extra' })}
      >
        <Select>
          <Option key="true" value>{intl.formatMessage({ id: 'pages.common.yes' })}</Option>
          <Option key="false" value={false}>{intl.formatMessage({ id: 'pages.common.no' })}</Option>
        </Select>
      </Form.Item>
      <Form.Item
        label={formatMessage('recommended')}
        name={calculateName('recommended')}
        required
        rules={[{ required: true }]}
        initialValue={false}
        extra={intl.formatMessage({ id: 'pages.message.release.recommended.extra' })}
      >
        <Select>
          <Option key="true" value>{intl.formatMessage({ id: 'pages.common.yes' })}</Option>
          <Option key="false" value={false}>{intl.formatMessage({ id: 'pages.common.no' })}</Option>
        </Select>
      </Form.Item>
    </div>
  );
};
