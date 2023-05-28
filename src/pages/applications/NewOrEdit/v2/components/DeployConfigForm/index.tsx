import { useIntl, useRequest } from 'umi';
import {
  Card, Form, Input, Select,
} from 'antd';
import {
  forwardRef, useEffect, useImperativeHandle, useRef, useState,
} from 'react';
import { Rule } from 'antd/lib/form';
import { querySchema } from '@/services/templates/templates';
import JsonSchemaForm from '@/components/JsonSchemaForm';
import { queryReleases } from '@/services/templates/templates';
import { ResourceType } from '@/const';
import { MaxSpace } from '@/components/Widget';

const { Option } = Select;

interface Props {
  readOnly?: boolean;
  envTemplate?: boolean;
  clusterID?: number;
  resourceType?: string;
  template: API.Template;
  release?: string;
  setReleaseName?: (releaseName: string) => void;
  templateConfig?: Object;
  setTemplateConfig?: (config: Object) => void;
  setValid?: (valid: boolean) => void;
  onSubmit?: (values: any) => void;
}

export default forwardRef((props: Props, ref) => {
  const appKey = 'application';
  const intl = useIntl();
  const {
    readOnly = false,
    envTemplate = false,
    clusterID,
    resourceType,
    template,
    release, setReleaseName = () => {},
    templateConfig, setTemplateConfig = () => {},
    setValid = () => {},
    onSubmit = () => {},
  } = props;

  const { name: templateName } = template;
  const [initValidation, setInitValidation] = useState(true);

  useEffect(() => {
    if (initValidation && !!release) {
      setValid(true);
      setInitValidation(false);
    }
  }, [initValidation, setValid, release]);

  const formRef = useRef();
  useImperativeHandle(ref, () => ({
    submit: () => {
      formRef.current!.submit();
    },
  }));

  const { data } = useRequest(
    () => {
      if (resourceType === ResourceType.CLUSTER) {
        return querySchema(templateName, release!, {
          clusterID,
          resourceType: ResourceType.CLUSTER,
        });
      }
      return querySchema(templateName, release!);
    },
    {
      refreshDeps: [release],
      ready: !!release,
    },
  );

  const { data: releases } = useRequest(() => queryReleases(templateName), {
    ready: !!templateName && !readOnly,
  });

  const formatMessage = (suffix: string, defaultMsg?: string) => intl.formatMessage({ id: `pages.newV2.deploy.${suffix}`, defaultMessage: defaultMsg });

  const formatReleaseOption = (item: API.Release) => {
    if (item.recommended) {
      return (
        <div>
          {item.name}
          {' '}
          <span style={{ color: 'red' }}>{intl.formatMessage({ id: 'pages.common.recommend' })}</span>
        </div>
      );
    }
    return item.name;
  };

  const requiredRule: Rule[] = [
    {
      required: true,
    },
  ];

  const onReleaseChange = (releaseName: string) => {
    setReleaseName(releaseName);
  };

  const onRJSFChange = ({ formData, errors }: any) => {
    if (readOnly) {
      return;
    }
    setTemplateConfig(formData);
    if (!release || (errors && errors.length > 0)) {
      setValid(false);
    } else {
      setValid(true);
    }
  };

  return (
    <MaxSpace
      direction="vertical"
      size="middle"
    >
      {
        !envTemplate && (
          <Form layout="vertical">
            <Card title={formatMessage('template', '部署模板')}>
              <Form.Item label={formatMessage('template.name', '模版')}>
                <Input disabled value={templateName} />
              </Form.Item>
              <Form.Item
                label={formatMessage('template.release', '模版版本')}
                name="release"
                rules={requiredRule}
                initialValue={release}
              >
                <Select
                  disabled={readOnly}
                  onChange={onReleaseChange}
                >
                  {releases?.map((item: any) => (
                    <Option key={item.name} value={item.name}>
                      {formatReleaseOption(item)}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Card>
          </Form>
        )
      }
      {
        data && data[appKey] && (
          <Card
            title={formatMessage('config', '模板配置')}
          >
            <JsonSchemaForm
              ref={formRef}
              disabled={readOnly}
              formData={templateConfig}
              jsonSchema={data[appKey].jsonSchema}
              uiSchema={data[appKey].uiSchema}
              onChange={onRJSFChange}
              onSubmit={(schema: any) => {
                onSubmit(schema.formData);
              }}
              liveValidate
              showErrorList={false}
            />
          </Card>
        )
      }
    </MaxSpace>
  );
});
