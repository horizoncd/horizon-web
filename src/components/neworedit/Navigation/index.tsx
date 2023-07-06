import {
  Card, Col, Divider, Row, Avatar, Button,
} from 'antd';
import {
  useHistory, useIntl, useModel, useRequest,
} from 'umi';
import styled from 'styled-components';
import {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import { MaxSpace, MicroApp } from '@/components/Widget';
import { PageTitle } from '@/components/Title';
import { getApplicationV2 } from '@/services/applications/applications';
import { queryTemplate } from '@/services/templates/templates';
import { CatalogType } from '@/services/core';
import { ResourceType } from '@/const';
import ItemCard from '../components/ItemCard';

const CardTitle = styled.span`
  font-size: 17px;
  font-weight: 550;
`;

export default (props: any) => {
  const { location } = props;

  const history = useHistory();
  const { initialState } = useModel('@@initialState');
  const intl = useIntl();
  const {
    fullPath, parentID, id, type,
  } = initialState!.resource;
  const { pathname } = location;
  const isInstancePage = useMemo(() => pathname.endsWith('/newinstancev2')
    || pathname.endsWith('/newinstance')
    || /instances\/.*?\/-\/editv2/.test(pathname), [pathname]);
  const isEdit = useMemo(() => pathname.endsWith('/editv2'), [pathname]);
  // only for instance page
  const [app, setApp] = useState<API.GetApplicationResponseV2>();
  // only for instance page
  const [tpl, setTpl] = useState<API.Template & { type: string }>();
  const { newV1, newV2 } = useMemo(() => {
    if (isEdit) {
      return { newV1: 'edit', newV2: 'editv2' };
    }

    return isInstancePage
      ? {
        newV1: 'newinstance/git',
        newV2: 'newinstancev2',
      }
      : {
        newV1: 'newapplicationv1',
        newV2: 'newapplicationv2',
      };
  }, [isInstancePage, isEdit]);

  useRequest(() => getApplicationV2(type === ResourceType.INSTANCE ? parentID : id), {
    ready: isInstancePage,
    onSuccess: (data) => {
      setApp(data);
    },
  });

  useRequest(() => queryTemplate(app?.templateInfo?.name!), {
    ready: !!app?.templateInfo?.name,
    onSuccess: (data) => {
      setTpl(data);
    },
  });

  const onClick = useCallback(() => {
    const tplType = tpl?.type;
    if (tplType === CatalogType.Middleware
      || tplType === CatalogType.Database
      || tplType === CatalogType.Other) {
      history.push(`${newV2}/chart`, { template: tpl });
    } else if (tplType === CatalogType.V1) {
      history.push(newV1);
    } else if (tplType === CatalogType.Workload) {
      if (app?.git?.url) {
        history.push(`${newV2}/git`);
      } else {
        history.push(`${newV2}/image`);
      }
    }
  }, [app?.git?.url, history, newV1, newV2, tpl]);

  useEffect(() => {
    if (isEdit) {
      onClick();
    }
  }, [isEdit, onClick]);

  return (
    <PageWithBreadcrumb>
      <Row>
        <Col span={16} offset={4}>
          <Row>
            <Col span={12}>
              {
                isInstancePage
                  ? <PageTitle>{intl.formatMessage({ id: 'pages.groups.New cluster' })}</PageTitle>
                  : <PageTitle>{intl.formatMessage({ id: 'pages.groups.newapplication' })}</PageTitle>
              }
            </Col>
            <Col span={12} style={{ textAlign: 'right' }}>
              <Button
                type="link"
                onClick={() => history.push(newV1)}
              >
                {intl.formatMessage({ id: 'pages.navigation.switchToV1' })}
              </Button>
            </Col>
          </Row>
          <Divider />
          <MaxSpace
            direction="vertical"
            size="large"
          >
            <Card
              type="inner"
              title={(
                <CardTitle>
                  {
                    isInstancePage
                      ? intl.formatMessage({ id: 'pages.navigation.instanceType' })
                      : intl.formatMessage({ id: 'pages.navigation.appType' })
                  }
                </CardTitle>
              )}
            >
              <Row gutter={[20, 10]}>
                {isInstancePage && (
                  <Col key="inherit" span={12}>
                    <ItemCard
                      avatar={<Avatar src="/application.svg" />}
                      title={<span>{intl.formatMessage({ id: 'pages.navigation.application' })}</span>}
                      description={intl.formatMessage({ id: 'pages.navigation.application.desc' })}
                      onClick={onClick}
                    />
                  </Col>
                )}
                <Col key="gitimport" span={12}>
                  <ItemCard
                    avatar={<Avatar src="/git.svg" />}
                    title={<span>{intl.formatMessage({ id: 'pages.navigation.gitImport' })}</span>}
                    description={intl.formatMessage({ id: 'pages.navigation.gitImport.desc' })}
                    onClick={() => history.push(`${newV2}/git`)}
                  />
                </Col>
                <Col key="imagedeploy" span={12}>
                  <ItemCard
                    avatar={<Avatar src="/docker.svg" />}
                    title={<span>{intl.formatMessage({ id: 'pages.navigation.imageDeploy' })}</span>}
                    description={intl.formatMessage({ id: 'pages.navigation.imageDeploy.desc' })}
                    onClick={() => history.push(`${newV2}/image`)}
                  />
                </Col>
                <Col key="chartdeploy" span={12}>
                  <ItemCard
                    avatar={<Avatar src="/helm.svg" />}
                    title={<span>{intl.formatMessage({ id: 'pages.navigation.catalog' })}</span>}
                    description={intl.formatMessage({ id: 'pages.navigation.catalog.desc' })}
                    onClick={() => history.push(`${newV2}/chartcatalog`)}
                  />
                </Col>
              </Row>
            </Card>
            <MicroApp
              name="quickstart"
              fullpath={fullPath}
              isInstancePage={isInstancePage}
            />
          </MaxSpace>
        </Col>
      </Row>
    </PageWithBreadcrumb>
  );
};
