import {Card, Radio} from 'antd';
import Basic from '../Basic';
import Config from '../Config';
import styles from '../index.less';
import {useIntl} from "@@/plugin-locale/localeExports";

export default (props: any) => {
  const {template, form, release, config} = props;
  const intl = useIntl();

  const templateTitle = intl.formatMessage({id: 'pages.applicationNew.step.one'})

  return (
    <div>
      <Card title={templateTitle} className={styles.gapBetweenCards}>
        <div className="awsui-cards-card-header">
          <span className="awsui-cards-card-header-inner">{template.name}</span>
          <span className="radio">
            <Radio checked={true}/>
          </span>
        </div>
        <h4>{template.description}</h4>
      </Card>

      <Basic form={form} template={template} readonly/>

      <Config template={template} release={release} config={config} ref={props.formRef} 
        onSubmit={props.onSubmit} readonly/>
    </div>
  );
};
