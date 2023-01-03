import type { StepsProps } from 'antd/lib/steps';
import { Divider, Steps } from 'antd';
import { useIntl } from '@@/plugin-locale/localeExports';
import './index.less';
import type { ReactNode } from 'react';

const { Step } = Steps;

export default (props: StepsProps & { steps: { title: ReactNode, disabled?: boolean, icon?: JSX.Element }[] }) => {
  const intl = useIntl();

  const { current, onChange, steps } = props;

  return (
    <Steps current={current} onChange={onChange} direction="vertical">
      {steps.map((item, index) => {
        const { icon } = item;
        const selected = current === index;
        return (
          <Step
            key={`Step ${index + 1}`}
            title={(
              <div style={{ width: '80%' }}>
                {intl.formatMessage({ id: 'pages.applicationNew.step.message' }, { index: index + 1 })}
              </div>
            )}
            status={selected ? 'process' : 'wait'}
            description={(
              <div style={{ width: '80%' }}>
                <div style={{ fontWeight: selected ? 'bold' : 'normal' }}>
                  {item.title}
                </div>
                <Divider />
              </div>
            )}
            disabled={item.disabled}
            icon={icon || <div />}
          />
        );
      })}
    </Steps>
  );
};
