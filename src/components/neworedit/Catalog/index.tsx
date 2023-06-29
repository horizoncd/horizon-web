import {
  Card, Col, ColProps, Divider, Menu, MenuProps, Row,
} from 'antd';
import { PropsWithChildren, useMemo, useState } from 'react';
import {
  useHistory, useIntl, useRequest,
} from 'umi';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import { PageTitle } from '@/components/Title';
import { listTemplatesV2 } from '@/services/templates/templates';
import ItemCard from '../components/ItemCard';
import { CatalogType } from '@/services/core';

const Hcol = (props: PropsWithChildren<ColProps & React.RefAttributes<HTMLDivElement>>) => {
  const {
    span, offset, children, ...restProps
  } = props;
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <Col span={span ?? 16} offset={offset ?? 4} {...restProps}>{children}</Col>;
};

const Catalog = () => {
  const history = useHistory();
  const intl = useIntl();
  const [current, setCurrent] = useState<CatalogType>(CatalogType.Database);
  const menuItems: MenuProps['items'] = useMemo(() => [
    {
      label: intl.formatMessage({ id: 'pages.catalog.database' }),
      key: 'database',
    },
    {
      label: intl.formatMessage({ id: 'pages.catalog.middleware' }),
      key: 'middleware',
    },
    {
      label: intl.formatMessage({ id: 'pages.catalog.other' }),
      key: 'other',
    },
  ], [intl]);

  const { data: templates } = useRequest(
    () => listTemplatesV2({ type: current.toString(), fullpath: false }),
    {
      refreshDeps: [current],
    },
  );

  const onClick: MenuProps['onClick'] = ({ key }: { key: string }) => {
    setCurrent(key as CatalogType);
  };

  return (
    <PageWithBreadcrumb>
      <Row>
        <Hcol>
          <PageTitle>{intl.formatMessage({ id: 'pages.navigation.catalog' })}</PageTitle>
        </Hcol>
      </Row>
      <Row>
        <Hcol>
          <Divider />
        </Hcol>
      </Row>
      <Row>
        <Col offset={4} span={4}>
          <Menu selectedKeys={[current]} onClick={onClick} items={menuItems} />
        </Col>
        <Col span={12}>
          <Card title={intl.formatMessage({ id: `pages.catalog.${current.toString()}` })}>
            <Row gutter={[16, 8]}>
              {
                templates?.map((template) => (
                  <Col span={12}>
                    <ItemCard
                      title={template.name}
                      description={template.description ?? ''}
                      onClick={() => history.push('chart', { template })}
                    />
                  </Col>
                ))
              }
            </Row>
          </Card>
        </Col>
      </Row>
    </PageWithBreadcrumb>
  );
};

export default Catalog;
