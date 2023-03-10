import { Card, Radio } from 'antd';
import { useIntl } from '@@/plugin-locale/localeExports';
import Basic from '../Basic';
import Config from '../Config';
import styles from '../../index.less';

export default (props: any) => {
  const {
    template, form, release, config, formRef, onSubmit,
  } = props;
  const intl = useIntl();

  const templateTitle = intl.formatMessage({ id: 'pages.applicationNew.step.one' });

  return (
    <div>
      <Card title={templateTitle} className={styles.gapBetweenCards}>
        <div className="awsui-cards-card-header">
          <span className="awsui-cards-card-header-inner">{template.name}</span>
          <span className="radio">
            <Radio checked />
          </span>
        </div>
        <h4>{template.description}</h4>
      </Card>

      <Basic form={form} template={template} readOnly />

      <Config
        template={template}
        release={release}
        config={config}
        ref={formRef}
        onSubmit={onSubmit}
        readOnly
      />
    </div>
  );
};
