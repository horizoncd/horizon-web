import { Card } from 'antd';
import { useIntl } from 'umi';
import { CardTitle } from './Widget';
import JsonSchemaForm from '@/components/JsonSchemaForm';

interface ConfigProps {
  cluster: CLUSTER.Cluster | CLUSTER.ClusterV2
  buildSchema?: API.BuildSchema,
  templateSchema?: Templates.TemplateSchema,
}

const ConfigCard = (props: ConfigProps) => {
  const {
    cluster, buildSchema, templateSchema,
  } = props;
  const intl = useIntl();
  if (cluster.version === 1) {
    return (
      <Card
        style={{ marginBottom: 10 }}
        title={(
          <CardTitle>{intl.formatMessage({ id: 'pages.clusterDetail.basic.config' })}</CardTitle>)}
        type="inner"
      >
        {
          templateSchema && Object.keys(templateSchema).map((item) => (
            <JsonSchemaForm
              key={item}
              disabled
              uiSchema={templateSchema[item].uiSchema}
              formData={cluster.templateInput[item]}
              jsonSchema={templateSchema[item].jsonSchema}
            />
          ))
        }
      </Card>
    );
  }
  return (
    <Card
      style={{ marginBottom: 10 }}
      title={(
        <CardTitle>{intl.formatMessage({ id: 'pages.clusterDetail.basic.config' })}</CardTitle>)}
      type="inner"
    >
      {
        buildSchema && cluster.buildConfig
        && (
          <JsonSchemaForm
            disabled
            uiSchema={buildSchema.uiSchema}
            jsonSchema={buildSchema.jsonSchema}
            formData={cluster.buildConfig}
          />
        )
      }
      {
        (templateSchema && cluster.templateConfig)
        && (
          <JsonSchemaForm
            disabled
            uiSchema={templateSchema.application.uiSchema}
            jsonSchema={templateSchema.application.jsonSchema}
            formData={cluster.templateConfig}
          />
        )
      }
    </Card>
  );
};

export default ConfigCard;
