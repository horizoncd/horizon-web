import { useRequest, useIntl } from 'umi';
import { Card } from 'antd';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import JsonSchemaForm from '@/components/JsonSchemaForm';
import { getBuildSchema } from '@/services/buildschema/buildschema';

interface Props {
  readOnly?: boolean;
  buildConfig: Object;
  setBuildConfig?: (buildConfig: Object) => void;
  setValid?: (valid: boolean) => void;
  onSubmit?: (formData: any) => void;
}

export default forwardRef((props: Props, ref) => {
  const {
    readOnly = false,
    buildConfig,
    setBuildConfig = () => {},
    setValid = () => {},
    onSubmit = () => {},
  } = props;

  const intl = useIntl();
  const { data } = useRequest(() => getBuildSchema());

  const formRef = useRef();
  useImperativeHandle(ref, () => ({
    submit: () => {
      formRef.current!.submit();
    },
  }));

  const onChange = ({ formData, errors }: any) => {
    if (readOnly) {
      return;
    }
    setBuildConfig(formData);
    if (errors && errors.length > 0) {
      setValid(false);
    } else {
      setValid(true);
    }
  };

  return (
    <div>
      { data && (
        <Card title={intl.formatMessage({ id: 'pages.newV2.step.build' })}>
          <JsonSchemaForm
            ref={formRef}
            disabled={readOnly}
            jsonSchema={data.jsonSchema}
            uiSchema={data.uiSchema}
            formData={buildConfig}
            onChange={onChange}
            onSubmit={(schema: any) => {
              onSubmit(schema.formData);
            }}
            liveValidate
            showErrorList={false}
          />
        </Card>
      )}
    </div>
  );
});
