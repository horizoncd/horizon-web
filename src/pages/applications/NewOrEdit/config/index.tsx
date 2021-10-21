import {useIntl, useRequest} from 'umi';
import {querySchema} from '@/services/templates/templates';
import Form from '@rjsf/material-ui';
import {Card} from 'antd';
import styles from '../index.less';

export default (props: any) => {
  const intl = useIntl();

  const {readonly = false} = props;

  // query schema by template and release
  const {data} = useRequest(() => querySchema(props.template.name, props.release));

  const titlePrefix = 'pages.applicationNew.config';

  return (
    <div>
      {data &&
      Object.keys(data).map((item) => {
        const currentFormData = props.config[item] || {};

        const onChange = ({formData, errors}: any) => {
          if (readonly) {
            return;
          }

          props.setConfig((config: any) => ({...config, [item]: formData}));
          props.setConfigErrors((configErrors: any) => ({...configErrors, [item]: errors}));
        };

        const {jsonSchema, uiSchema} = data[item];

        return (
          <Card
            className={styles.gapBetweenCards}
            key={item}
            title={intl.formatMessage({id: `${titlePrefix}.${item}`})}
          >
            <Form
              disabled={readonly}
              formData={currentFormData}
              schema={jsonSchema}
              onChange={onChange}
              uiSchema={uiSchema}
              liveValidate
              showErrorList={false}
            >
              <div/>
            </Form>
          </Card>
        );
      })}
    </div>
  );
};
