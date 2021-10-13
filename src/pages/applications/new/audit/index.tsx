import { Card, Radio } from 'antd';
import Basic from '../basic';
import Config from '../config';
import styles from '../index.less';

export default (props: any) => {
  const { template, form, release, config } = props;

  const templateTitle = '服务模版';

  return (
    <div>
      <Card title={templateTitle} className={styles.gapBetweenCards}>
        <div className="awsui-cards-card-header">
          <span className="awsui-cards-card-header-inner">{template.name}</span>
          <span className="radio">
            <Radio checked={true} />
          </span>
        </div>
        <h4>{template.description}</h4>
      </Card>

      <Basic form={form} template={template} release={release} readonly />

      <Config template={template} release={release} config={config} readonly />
    </div>
  );
};
