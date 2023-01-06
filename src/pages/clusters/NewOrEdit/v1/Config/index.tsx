import { useIntl, useRequest } from 'umi';
import { Card } from 'antd';
import {
  forwardRef, useEffect, useImperativeHandle, useRef, useState,
} from 'react';
import { querySchema } from '@/services/templates/templates';
import JsonSchemaForm from '@/components/JsonSchemaForm';
import styles from '@/pages/clusters/NewOrEdit/index.less';
import { ResourceType } from '@/const';

export default forwardRef((props: any, ref) => {
  const intl = useIntl();

  const { readOnly = false } = props;
  const formRefs = useRef([]);

  useImperativeHandle(
    ref,
    () => ({
      submit: () => {
        formRefs.current.forEach((formRef) => {
          formRef.submit();
        });
      },
    }),
  );

  // query schema by template and release
  const { data, loading } = useRequest(
    () => querySchema(props.template.name, props.release, {
      clusterID: props.clusterID,
      resourceType: ResourceType.CLUSTER,
    }),
    {
      onSuccess: () => {
        formRefs.current = formRefs.current.slice(0, Object.keys(data).length);
      },
    },
  );

  const titlePrefix = 'pages.applicationNew.config';
  const [totalFormData, setTotalFormData] = useState({});

  useEffect(() => {
    if (!loading && (Object.keys(totalFormData).length
      >= Object.keys(data).length)) {
      props.onSubmit(totalFormData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalFormData]);

  return (
    <div>
      {data
        && Object.keys(data).map((item, i) => {
          const currentFormData = props.config[item] || {};

          const onChange = ({ formData, errors }: any) => {
            if (readOnly) {
              return;
            }
            props.setConfig((config: any) => ({ ...config, [item]: formData }));
            props.setConfigErrors((configErrors: any) => ({ ...configErrors, [item]: errors }));
          };

          const { jsonSchema, uiSchema } = data[item];

          return (
            <Card
              className={styles.gapBetweenCards}
              key={item}
              title={intl.formatMessage({ id: `${titlePrefix}.${item}` })}
            >
              <JsonSchemaForm
                ref={(dom) => {
                  formRefs.current[i] = dom;
                }}
                disabled={readOnly}
                formData={currentFormData}
                jsonSchema={jsonSchema}
                onChange={onChange}
                onSubmit={(schema: any) => {
                  setTotalFormData((fdts) => ({ ...fdts, [item]: schema.formData }));
                }}
                uiSchema={uiSchema}
                liveValidate
                showErrorList={false}
              />
            </Card>
          );
        })}
    </div>
  );
});
