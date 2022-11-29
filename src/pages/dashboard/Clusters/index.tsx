/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import {
  Cascader, Divider, Input, Pagination, Select, Tabs, Tooltip,
} from 'antd';
import '../index.less';
import { useMemo, useState } from 'react';
import { useRequest } from '@@/plugin-request/request';
import {
  FundOutlined, GitlabOutlined, RocketTwoTone,
} from '@ant-design/icons/lib';
import { Location } from 'umi';
import { listClusters } from '@/services/clusters/clusters';
import Utils, { handleHref } from '@/utils';
import '@/components/GroupTree/index.less';
import withTrim from '@/components/WithTrim';
import { queryEnvironments } from '@/services/environments/environments';
import { queryReleases, listTemplates } from '@/services/templates/templates';
import type { CLUSTER } from '@/services/clusters';
import { GitInfo } from '@/services/code/code';
import TitleWithCount from '../components/TitleWithCount';
import { PageWithInitialState, PageWithInitialStateProps } from '@/components/Enhancement';
import { setQuery } from '../utils';
import WithContainer from '../components/WithContainer';

const { Option } = Select;
const Search = withTrim(Input.Search);

const { TabPane } = Tabs;

function Title(props: {
  updatedAt: string,
  filter: string,
  scope: CLUSTER.Scope,
  env?: string,
  template: { name: string, release: string },
  name: string,
  fullPath?: string,
  git: GitInfo,
  description?: string,
}) {
  const {
    updatedAt, scope, template, name, fullPath, git, description, filter, env = '',
  } = props;
  const index = name.indexOf(filter);
  const beforeStr = name.substring(0, index);
  const afterStr = name.substring(index + filter.length);
  const tmp = filter && index > -1 ? (
    <a className="group-title" onClick={(e) => handleHref(e, `/clusters${fullPath}`)}>
      {beforeStr}
      <span className="site-tree-search-value">{filter}</span>
      {afterStr}
    </a>
  ) : (
    <a onClick={(e) => handleHref(e, `${fullPath}`)} className="group-title">{name}</a>
  );
  const firstLetter = name.substring(0, 1).toUpperCase();

  const cssForDesc = !description ? {
    height: '48px',
    lineHeight: '48px',
  } : {};
  return (
    <div style={{ padding: '10px 0', display: 'flex', fontSize: 16 }}>
      <div style={{ flex: '1 1 100%', alignItems: 'center', ...cssForDesc }}>
        <span className={`avatar-48 identicon bg${Utils.getAvatarColorIndex(name)}`}>
          {firstLetter}
        </span>
        <span style={{ marginLeft: 60 }}>{tmp}</span>
        <span className="user-access-role">{env}</span>
        <span className="user-access-role">{scope.regionDisplayName}</span>
        <span className="user-access-role">
          {template.name}
          -
          {template.release}
        </span>
        <br />
        <span style={{ marginLeft: 60, color: '#666666' }}>{description}</span>
      </div>
      <div style={{
        display: 'flex', flex: '1 1 40%', justifyContent: 'space-between', flexDirection: 'row',
      }}
      >
        <div style={{ display: 'flex', alignItems: 'center', fontSize: 'larger' }}>
          <Tooltip title="构建发布">
            <a aria-label="构建发布" href={`/clusters${fullPath}/-/pipelines/new?type=builddeploy`}><RocketTwoTone /></a>
          </Tooltip>
          <Tooltip title="集群监控">
            <a aria-label="集群监控" href={`/clusters${fullPath}/-/monitoring`}><FundOutlined style={{ marginLeft: '1rem' }} /></a>
          </Tooltip>
          <Tooltip title="代码仓库">
            <a
              onClick={() => {
                window.open(git.httpURL);
              }}
              style={{ marginLeft: '1rem', color: '#e24329' }}
            >
              <GitlabOutlined />
            </a>
          </Tooltip>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', fontSize: 14, color: '#666666',
        }}
        >
          <Tooltip title={Utils.timeToLocal(updatedAt)}>
            Updated
            {' '}
            {Utils.timeFromNowEnUS(updatedAt)}
          </Tooltip>
        </div>
      </div>
    </div>
  );
}

Title.defaultProps = { env: '', fullPath: '', description: '' };

enum Mode {
  Own = 'own', All = 'all',
}

interface ClustersProps
  extends PageWithInitialStateProps {
  location: Location
}

const QueryName = 'name';
const QueryTemplate = 'template';
const QueryRelease = 'release';
const QueryEnv = 'env';
const QueryMode = 'mode';

function Clusters(props: ClustersProps) {
  const { initialState, location } = props;

  const {
    [QueryName]: qName = '',
    [QueryEnv]: qEnv = '',
    [QueryRelease]: qRelease = '',
    [QueryTemplate]: qTemplate = '',
    [QueryMode]: qMode = Mode.Own,
  } = location.query ?? {};

  const [filter, setFilter] = useState(qName as string);
  const [total, setTotal] = useState(0);
  const [totalClusters, setTotalClusters] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [clusters, setClusters] = useState<CLUSTER.Cluster[]>([]);
  const [env2DisplayName, setEnv2DisplayName] = useState<Map<string, string>>();
  const [environment, setEnvironment] = useState(qEnv as string);
  const [tpl, setTpl] = useState(qTemplate as string);
  const [tplRelease, setTplRelease] = useState(qRelease as string);
  const [templateOptions, setTemplateOptions] = useState<CLUSTER.TemplateOptions[]>([]);
  const [mode, setMode] = useState(qMode as string);

  const { data: envs } = useRequest(queryEnvironments, {
    onSuccess: () => {
      const e = new Map<string, string>();
      envs!.forEach((item) => e.set(item.name, item.displayName));
      setEnv2DisplayName(e);
    },
  });

  useRequest(() => listTemplates({ fullpath: false }), {
    onSuccess: (items) => {
      const t: CLUSTER.TemplateOptions[] = [];
      items.forEach((item) => {
        t.push({ label: item.name, value: item.name, isLeaf: false });
      });
      setTemplateOptions(t);
    },
  });

  useRequest(() => listClusters({
    userID: mode === Mode.Own
      ? initialState?.currentUser?.id
      : undefined,
    filter,
    pageSize,
    pageNumber,
    environment,
    template: tpl,
    templateRelease: tplRelease,
  }), {
    refreshDeps: [filter, pageNumber, pageSize, environment, tpl, tplRelease, mode],
    debounceInterval: 200,
    onSuccess: (data) => {
      const { items, total: t } = data!;
      setClusters(items);
      setTotal(t);
      if (mode === Mode.Own) setTotalClusters(t);
      setQuery({
        [QueryName]: filter,
        [QueryEnv]: environment,
        [QueryRelease]: tplRelease,
        [QueryTemplate]: tpl,
        [QueryMode]: mode,
      });
    },
  });

  const onChange = (e: any) => {
    const { value } = e.target;
    setFilter(value);
  };

  const clusterQueryInput = useMemo(() => {
    const onCascadeChange = (e: any) => {
      if (e === undefined || e === null) {
        return;
      }
      if (tpl !== e[0]) {
        setTpl(e[0] ? e[0] : '');
      }
      if (tpl !== e[1]) {
        setTplRelease(e[1] ? e[1] : '');
      }
    };

    const CascaderLoadData = (selectedOptions: CLUSTER.TemplateOptions[]) => {
      const targetOption = selectedOptions[selectedOptions.length - 1];
      if (targetOption.loaded) {
        return;
      }

      // load options lazily
      queryReleases(targetOption.value).then((resp) => {
        const { data } = resp;
        targetOption.children = [];
        data.forEach((item) => {
          targetOption.children!.push({
            label: item.name,
            value: item.name,
            isLeaf: true,
          });
        });
        targetOption.loaded = true;
        setTemplateOptions([...templateOptions]);
      });
    };

    return (
      <div>
        {
        (
          <Cascader
            allowClear
            style={{ maxWidth: '150px' }}
            placeholder="Filter by template"
            options={templateOptions}
            // @ts-ignore
            onClear={() => { setTpl(''); setTplRelease(''); }}
            //@ts-ignore
            loadData={CascaderLoadData}
            onChange={onCascadeChange}
            changeOnSelect
          />
        )
      }
        {
        // @ts-ignore
        (
          <Select
            allowClear
            style={{ maxWidth: '150px', marginLeft: '5px' }}
            placeholder="Filter by env"
            onSelect={setEnvironment}
            onClear={() => setEnvironment('')}
          >
            {envs?.map((item) => (
              <Option key={item.name} value={item.name}>
                {item.displayName}
              </Option>
            ))}
          </Select>
        )
      }
        {
        // @ts-ignore
          <Search
            style={{ width: '40%', marginLeft: '5px' }}
            placeholder="Search"
            onChange={onChange}
            value={filter}
          />
      }
      </div>
    );
  }, [envs, filter, templateOptions, tpl]);

  const clusterList = useMemo(() => (
    clusters && clusters.map((item: CLUSTER.Cluster) => {
      const treeData = {
        title: item.fullName?.split('/').join('  /  '),
        ...item,
      };
      return (
        <div key={item.id}>
          <Title
            updatedAt={treeData.updatedAt}
            filter={filter}
            scope={treeData.scope}
            env={env2DisplayName?.get(treeData.scope.environment)}
            template={treeData.template}
            name={treeData.name}
            fullPath={treeData.fullPath}
            git={treeData.git}
            description={treeData.description}
          />
          <Divider style={{ margin: '5px 0 5px 0' }} />
        </div>
      );
    })
  ), [clusters, env2DisplayName, filter]);

  return (
    <>
      <Tabs
          //activeKey={pathname}
        size="large"
        tabBarExtraContent={clusterQueryInput}
        onChange={(key) => { setMode(key as Mode); }}
        defaultActiveKey={mode}
        animated={false}
        style={{ marginTop: '15px' }}
      >
        <TabPane
          tab={<TitleWithCount name="Your clusters" count={totalClusters} />}
          key={Mode.Own}
        >
          {clusterList}
        </TabPane>
        <TabPane
          tab="All clusters"
          key={Mode.All}
        >
          {clusterList}
        </TabPane>

      </Tabs>
      <br />
      <div style={{ textAlign: 'center' }}>
        <Pagination
          current={pageNumber}
          hideOnSinglePage
          pageSize={pageSize}
          total={total}
          onChange={(page, pSize) => {
            setPageSize(pSize!);
            setPageNumber(page);
          }}
        />
      </div>
    </>
  );
}

export default WithContainer(PageWithInitialState(Clusters));
