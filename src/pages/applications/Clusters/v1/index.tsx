import {
  Button, Table, Tabs, Tooltip,
} from 'antd';
import { useCallback, useMemo, useState } from 'react';
import { history } from '@@/core/history';
import { stringify } from 'querystring';
import { useIntl } from '@@/plugin-locale/localeExports';
import { useModel } from '@@/plugin-model/useModel';
import { useRequest } from '@@/plugin-request/request';
import { QuestionCircleOutlined } from '@ant-design/icons';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import styles from '../index.less';
import { queryEnvironments } from '@/services/environments/environments';
import { queryClusters } from '@/services/clusters/clusters';
import RBAC from '@/rbac';
import Utils from '@/utils';
import NoData from '@/components/NoData';
import TagSearch, { SearchInputType } from '@/components/TagSearch';
import type { SearchInput, MultiValueTag } from '@/components/TagSearch';
import { querySubresourceTags } from '@/services/tags/tags';
import CollapseList from '@/components/CollapseList';
import { getClusterV2 } from '@/services/clusters/clusters';
import { isVersion2 } from '@/services/version/version';
import { MicroApp } from '@/components/Widget';

const { TabPane } = Tabs;

export default () => {
  const params = new URLSearchParams(window.location.search);
  const environment = params.get('environment') || '';
  const tagSelector = params.get('tagSelector') || '';
  const filter = params.get('filter') || '';

  const intl = useIntl();
  const { initialState } = useModel('@@initialState');
  const { id, name: application, fullPath } = initialState!.resource;
  const [tagSelectorState, setTagSelectorState] = useState(tagSelector);
  const [filterState, setFilterState] = useState(filter);
  const [selectedCluster, setSelectedCluster] = useState();

  const pageSize = 10;
  const newCluster = `/applications${fullPath}/-/newcluster`;
  const newClusterV2 = `/applications${fullPath}/-/newclusterv2`;
  const [copyCluster, setCopyCluster] = useState(newCluster);

  const TagSelector2SearchInput = (ts: TAG.TagSelector[] | undefined) => {
    if (!ts) {
      return [];
    }
    return ts.map((t) => ({
      type: SearchInputType.Tag,
      key: t.key,
      operator: t.operator,
      value: t.values.length > 0 ? t.values[0] : '',
    }));
  };

  const encodeTagSelector = (ts: TAG.TagSelector[] | undefined) => {
    if (!ts) {
      return '';
    }
    return ts?.map((t) => t.key + t.operator + t.values.join(',')).join(',');
  };

  const decodeTagSelector = (tss: string | undefined) => {
    if (!tss) {
      return [];
    }

    const ts = tss?.split(',', -1);

    return ts.filter((t) => {
      const parts = t.split('=', -1);
      if (parts.length !== 2) {
        return false;
      }
      return true;
    }).map((t) => {
      const parts = t.split('=', -1);
      return {
        key: parts[0],
        operator: '=',
        values: [parts[1]],
      };
    });
  };

  const columns = [
    {
      title: intl.formatMessage({ id: 'pages.clusterNew.basic.name' }),
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <a href={`${fullPath}/${text}`}>
          {text}
        </a>
      ),
    },
    {
      title: intl.formatMessage({ id: 'pages.common.env' }),
      dataIndex: 'environment',
      key: 'environment',
    },
    {
      title: intl.formatMessage({ id: 'pages.common.region' }),
      dataIndex: 'regionDisplayName',
      key: 'region',
    },
    {
      title: intl.formatMessage({ id: 'pages.common.template' }),
      dataIndex: 'template',
      key: 'template',
    },
    {
      title: (
        <div className={styles.tagTitle}>
          <div>{intl.formatMessage({ id: 'pages.common.tags' })}</div>
          <Tooltip
            title={intl.formatMessage({ id: 'pages.message.tags.tooltip' })}
          >
            <QuestionCircleOutlined style={{ display: 'block', marginLeft: '5px' }} />
          </Tooltip>
        </div>
      ),
      dataIndex: 'tag',
      key: 'tag',
      width: '15%',
      render: (_text: any, record: any) => {
        const data = {};
        if (record.tags && Object.keys(record.tags).length > 0) {
          record.tags.forEach((tag: { key: any; value: any; }) => {
            if (!Utils.tagShouldOmit(tag)) {
              data[tag.key] = tag.value;
            }
          });
          return (
            <div>
              <CollapseList defaultCount={3} data={data} />
            </div>
          );
        }
        return <div />;
      },
    },
    {
      title: intl.formatMessage({ id: 'pages.common.createdAt' }),
      dataIndex: 'createdTime',
      key: 'createdTime',
    },
    {
      title: intl.formatMessage({ id: 'pages.common.updatedAt' }),
      dataIndex: 'updatedTime',
      key: 'updatedTime',
    },
  ];

  const [pageNumber, setPageNumber] = useState(1);
  const [env2DisplayName, setEnv2DisplayName] = useState<Map<string, string>>();
  const [tags, setTags] = useState<MultiValueTag[]>([]);

  const { data: envs } = useRequest(queryEnvironments, {
    onSuccess: () => {
      const e = new Map<string, string>();
      envs!.forEach((item) => e.set(item.name, item.displayName));
      setEnv2DisplayName(e);
    },
  });
  const { data: clusters } = useRequest(() => queryClusters(
    id,
    {
      filter, pageNumber, pageSize, environment, tagSelector,
    },
  ), {
    refreshDeps: [filter, environment, pageNumber, tagSelector],
    debounceInterval: 200,
  });

  const { data: tagsResp } = useRequest(() => querySubresourceTags('applications', id), {
    onSuccess: () => {
      const tMap = new Map<string, string[]>();
      const ts: MultiValueTag[] = [];
      tagsResp?.tags.forEach(
        (tag) => {
          if (tag.key === 'jvmExtra' || Utils.tagShouldOmit(tag)) {
            return;
          }
          if (tMap.has(tag.key)) {
            const values = tMap.get(tag.key) as string[];
            values.push(tag.value);
            tMap.set(tag.key, values);
          } else {
            tMap.set(tag.key, [tag.value]);
          }
        },
      );
      tMap.forEach(
        (value, key) => {
          ts.push({
            key,
            values: value,
          });
        },
      );
      setTags(ts);
    },
  });

  const { data: selectedClusterInfo } = useRequest(() => getClusterV2(selectedCluster?.id), {
    onSuccess: () => {
      if (isVersion2(selectedClusterInfo)) {
        setCopyCluster(newClusterV2);
      } else {
        setCopyCluster(newCluster);
      }
    },
    ready: !!selectedCluster,
    refreshDeps: [selectedCluster?.id],
  });

  const onTagClear = useCallback(() => {
    setTagSelectorState('');
    setFilterState('');
    history.replace({
      pathname: `${fullPath}`,
      query: {
        environment,
        filter: '',
        tagSelector: '',
      },
    });
  }, [environment, fullPath]);

  const onTagSearch = useCallback((values: SearchInput[]) => {
    const ts: TAG.TagSelector[] = [];
    let ft = '';
    values.forEach((v) => {
      if (v.type === SearchInputType.Tag) {
        ts.push(
          {
            key: v.key!,
            operator: v.operator!,
            values: [v.value],
          },
        );
      } else {
        ft = v.value;
      }
    });

    const tsEncode = encodeTagSelector(ts);

    setTagSelectorState(tsEncode);
    setFilterState(ft);

    history.replace({
      pathname: `${fullPath}`,
      query: {
        environment,
        filter: ft,
        tagSelector: tsEncode,
      },
    });
  }, [environment, fullPath]);

  const queryInput = (
    // @ts-ignore
    <div style={{ display: 'flex' }}>
      <MicroApp
        name="insight"
        applicationName={application}
      />
      <Button
        type="primary"
        disabled={!RBAC.Permissions.createCluster.allowedEnv(environment)}
        className={styles.createClusterBtn}
        onClick={() => {
          history.push({
            pathname: newCluster,
            search: stringify({
              application,
              environment,
            }),
          });
        }}
      >
        {intl.formatMessage({ id: 'pages.groups.New cluster' })}
      </Button>
      <Button
        disabled={!RBAC.Permissions.createCluster.allowedEnv(environment) || !selectedCluster}
        className={styles.createClusterBtn}
        onClick={() => {
          history.push({
            pathname: copyCluster,
            search: stringify({
              sourceClusterID: selectedCluster?.id,
            }),
          });
        }}
      >
        {intl.formatMessage({ id: 'pages.groups.copy cluster' })}
      </Button>
    </div>
  );

  const data = clusters?.items.map((item) => {
    const {
      id: clusterID, name, scope, template, updatedAt, createdAt, tags: tagList,
    } = item;
    return {
      id: clusterID,
      key: name,
      name,
      environment: env2DisplayName?.get(scope.environment),
      regionDisplayName: scope.regionDisplayName,
      template: `${template.name}-${template.release}`,
      createdTime: Utils.timeToLocal(createdAt),
      updatedTime: Utils.timeToLocal(updatedAt),
      tags: tagList,
    };
  }).sort((a, b) => {
    if (a.updatedTime < b.updatedTime) {
      return 1;
    }
    if (a.updatedTime > b.updatedTime) {
      return -1;
    }

    return 0;
  });

  const locale = {
    emptyText: <NoData
      titleID="pages.noData.cluster.title"
      descID="pages.noData.cluster.desc"
    />,
  };

  const onClusterSelected = (_selectedRowKeys: React.Key[], selectedRows: any[]) => {
    setSelectedCluster(selectedRows[0]);
  };

  const table = (
    <Table
      rowSelection={{
        type: 'radio',
        onChange: onClusterSelected,
      }}
      columns={columns}
      dataSource={data}
      locale={locale}
      pagination={{
        position: ['bottomCenter'],
        current: pageNumber,
        hideOnSinglePage: true,
        pageSize,
        total: clusters?.total,
        onChange: (page) => setPageNumber(page),
      }}
    />
  );

  const tabOnChange = (key: string) => {
    setPageNumber(1);
    setFilterState(filter);
    setTagSelectorState(tagSelector);
    history.replace({
      pathname: `${fullPath}`,
      query: {
        environment: key,
        filter: filterState,
        tagSelector: tagSelectorState,
      },
    });
  };

  const tagSearch = useMemo(() => (
    <div style={{ display: 'flex', alignItems: 'baseline' }}>
      <TagSearch
        defaultValues={[
          ...TagSelector2SearchInput(decodeTagSelector(tagSelectorState)),
          { value: filterState },
        ]}
        tagSelectors={tags}
        onSearch={onTagSearch}
        onClear={onTagClear}
      />
      <div style={{ marginLeft: '10px' }}>
        <Tooltip
          title={intl.formatMessage({ id: 'pages.message.clusterSearch.tooltip' })}
        >
          <QuestionCircleOutlined style={{ display: 'block' }} />
        </Tooltip>
      </div>
    </div>
  ), [filterState, intl, onTagClear, onTagSearch, tagSelectorState, tags]);

  return (
    <PageWithBreadcrumb>
      <Tabs
        activeKey={environment}
        size="large"
        tabBarExtraContent={queryInput}
        onChange={tabOnChange}
        animated={false}
      >
        <TabPane tab={intl.formatMessage({ id: 'pages.common.all' })} key="">
          {tagSearch}
          {table}
        </TabPane>
        {
          envs?.map((item) => {
            const { name, displayName } = item;
            return (
              <TabPane tab={displayName} key={name}>
                {tagSearch}
                {table}
              </TabPane>
            );
          })
        }
      </Tabs>
    </PageWithBreadcrumb>
  );
};
