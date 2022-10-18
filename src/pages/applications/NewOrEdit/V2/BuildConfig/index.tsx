import { useIntl, useRequest } from 'umi';
import { Card } from 'antd';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import JsonSchemaForm from '@/components/JsonSchemaForm';
import styles from '../../index.less';
import { getBuildSchema } from '@/services/buildschema/buildschema';

export default forwardRef((props: any, ref) => {
  const {
    readonly = false, setConfig, setConfigErrors, config, onSubmit,
  } = props;
  const intl = useIntl();

  const formRef = useRef();
  useImperativeHandle(ref, () => ({
    submit: () => {
      formRef.current!.submit();
    },
  }));

  const { data } = useRequest(() => getBuildSchema());
  const onChange = ({ formData, errors }: any) => {
    if (readonly) {
      return;
    }
    setConfig(formData);
    setConfigErrors(errors);
  };
  return (
    <div>
      { data && (
        <Card
          className={styles.gapBetweenCards}
          title={intl.formatMessage({ id: 'pages.applicationNewV2.step.two' })}
        >
          <JsonSchemaForm
            ref={(dom) => {
              formRef.current = dom;
            }}
            disabled={readonly}
            jsonSchema={data.jsonSchema}
            uiSchema={data.uiSchema}
            formData={config}
            onChange={onChange}
            onSubmit={(schema: any) => {
              onSubmit(schema);
            }}
            liveValidate
            showErrorList={false}
          />
        </Card>
      )}
    </div>
  );
});
