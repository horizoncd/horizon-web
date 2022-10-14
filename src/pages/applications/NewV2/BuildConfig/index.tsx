import { useIntl, useRequest } from 'umi';
import { Card } from 'antd';
import JsonSchemaForm from '@/components/JsonSchemaForm';
import styles from '../../NewOrEdit/index.less';
import { getBuildSchema } from '@/services/buildschema/buildschema';

export default (props: any) => {
  const {
    readonly = false, setConfig, setConfigErrors, config,
  } = props;
  const intl = useIntl();

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
            disabled={readonly}
            jsonSchema={data.jsonSchema}
            uiSchema={data.uiSchema}
            formData={config}
            onChange={onChange}
            liveValidate
            showErrorList={false}
          />
        </Card>
      )}
    </div>
  );
};
