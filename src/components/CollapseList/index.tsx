import { useState } from 'react';
import { Tag } from 'antd';
import { useIntl } from 'umi';
import styles from './index.less';
import ButtonWithoutPadding from '../Widget/ButtonWithoutPadding';

export default (props: { data: Record<string, string>, defaultCount: number }) => {
  const { data, defaultCount } = props;
  const [showAll, setShowAll] = useState(false);
  const intl = useIntl();
  const items: JSX.Element[] = [];
  const ks = Object.keys(data);
  Object.keys(data).forEach((k) => {
    if (!showAll && items.length >= defaultCount) {
      return;
    }
    let annotationStyle = styles.annotation;

    if (k === ks[ks.length - 1]) {
      annotationStyle = styles.annotationWithoutMargin;
    }
    items.push(
      <Tag key={items.length} id={annotationStyle}>
        {k}
        :
        {data[k]}
      </Tag>,
    );
  });
  return (
    <div>
      {items}
      {
        !showAll && ks.length > defaultCount && (
          <ButtonWithoutPadding
            type="link"
            onClick={() => {
              setShowAll(true);
            }}
          >
            {intl.formatMessage({ id: 'components.collapseList.showAll' })}
          </ButtonWithoutPadding>
        )
      }
      {
        showAll && ks.length > defaultCount && (
          <ButtonWithoutPadding
            type="link"
            onClick={() => {
              setShowAll(false);
            }}
          >
            {intl.formatMessage({ id: 'components.collapseList.collapse' })}
          </ButtonWithoutPadding>
        )
      }
    </div>
  );
};
