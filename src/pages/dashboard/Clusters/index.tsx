/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import {
  Card,
  Divider, Pagination, Tooltip,
} from 'antd';
import '../index.less';
import {
  useCallback,
  useEffect,
  useMemo, useState,
} from 'react';
import { useRequest } from '@@/plugin-request/request';
import {
  FundOutlined, GitlabOutlined, RocketTwoTone, StarFilled, StarTwoTone,
} from '@ant-design/icons/lib';
import { Location, useIntl } from 'umi';
import { listClusters, addFavorite, deleteFavorite } from '@/services/clusters/clusters';
import Utils, { handleHref } from '@/utils';
import '@/components/GroupTree/index.less';
import { queryEnvironments } from '@/services/environments/environments';
import { listTemplatesV2 } from '@/services/templates/templates';
import { GitInfo } from '@/services/code/code';
import { PageWithInitialState, PageWithInitialStateProps } from '@/components/Enhancement';
import { setQuery } from '../utils';
import WithContainer from '../components/WithContainer';
import { PopupTime } from '@/components/Widget';
import './index.less';
import Expression from '@/components/FilterBox/Expression';
import SearchBox from '../components/SearchBox';
import HorizonAutoCompleteHandler, { AutoCompleteOption } from '../../../components/FilterBox/HorizonAutoCompleteHandler';
import { queryRegions } from '@/services/regions/regions';
import { getLastReview, setLastReview } from './history';

function Title(props: {
  id: number,
  updatedAt: string,
  filter: string,
  scope: CLUSTER.Scope,
  env?: string,
  template: { name: string, release: string },
  name: string,
  fullPath?: string,
  git: GitInfo,
  description?: string,
  isFavorite?: boolean,
  onStarClick?: () => void,
}) {
  const {
    id, updatedAt, scope, template, name, fullPath, git,
    description, filter, env = '', isFavorite = false, onStarClick: onStarClickInner,
  } = props;
  const intl = useIntl();
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

  const { run: updateFavorite } = useRequest((favorite: boolean) => (favorite ? addFavorite(id) : deleteFavorite(id)), {
    onSuccess: () => {
      if (onStarClickInner) {
        onStarClickInner();
      }
    },
    refreshDeps: [id, isFavorite],
    manual: true,
    throttleInterval: 500,
  });

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
          {
            isFavorite
              ? <StarFilled onClick={() => updateFavorite(false)} style={{ color: '#F4D03F' }} />
              : <StarTwoTone onClick={() => updateFavorite(true)} twoToneColor="#F4D03F" />
          }
          <Tooltip title={intl.formatMessage({ id: 'pages.cluster.action.buildDeploy' })}>
            <a
              aria-label={intl.formatMessage({ id: 'pages.cluster.action.buildDeploy' })}
              href={`/clusters${fullPath}/-/pipelines/new?type=builddeploy`}
            >
              <RocketTwoTone style={{ marginLeft: '1rem' }} />
            </a>
          </Tooltip>
          <Tooltip title={intl.formatMessage({ id: 'pages.cluster.podsTable.monitor' })}>
            <a
              aria-label={intl.formatMessage({ id: 'pages.cluster.podsTable.monitor' })}
              href={`/clusters${fullPath}/-/monitoring`}
            >
              <FundOutlined style={{ marginLeft: '1rem' }} />
            </a>
          </Tooltip>
          <Tooltip title={intl.formatMessage({ id: 'pages.clusterNew.basic.repo' })}>
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
            <PopupTime time={updatedAt} prefix={intl.formatMessage({ id: 'pages.common.updated' })} />
          </Tooltip>
        </div>
      </div>
    </div>
  );
}

Title.defaultProps = {
  env: '', fullPath: '', description: '', isFavorite: false, onStarClick: () => { },
};

const SearchKeyUser = 'User';
const SearchKeyEnv = 'Environment';
const SearchKeyTemplate = 'Template';
const SearchKeyRelease = 'TemplateRelease';
const SearchKeyRegion = 'Region';
const SearchKeyFavorite = 'Favorite';

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
const QueryFavorite = 'isFavorite';
const QueryRegion = 'region';

function Clusters(props: ClustersProps) {
  const { initialState, location } = props;

  const intl = useIntl();
  const [filter, setFilter] = useState('');
  const [total, setTotal] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [clusters, setClusters] = useState<CLUSTER.Cluster[]>([]);
  const [env2DisplayName, setEnv2DisplayName] = useState<Map<string, string>>();
  const [displayName2Region, setDisplayName2Region] = useState<Map<string, string>>(new Map());
  const [environment, setEnvironment] = useState('');
  const [tpl, setTpl] = useState('');
  const [tplRelease, setTplRelease] = useState('');
  const [isFavorite, setIsFavorite] = useState('');
  const [region, setRegion] = useState('');
  const [templateOptions, setTemplateOptions] = useState<CLUSTER.TemplateOptions[]>([]);
  const [defaultValue, setDefaultValue] = useState<Expression[]>([]);
  const [mode, setMode] = useState<string>('');

  useEffect(() => {
    const {
      [QueryName]: qName = '',
      [QueryEnv]: qEnv = '',
      [QueryRelease]: qRelease = '',
      [QueryTemplate]: qTemplate = '',
      [QueryMode]: qMode = Mode.Own,
      [QueryFavorite]: qFavorite = '',
      [QueryRegion]: qRegion = '',
    } = location.query ?? {};

    setMode(qMode as string);
    setTplRelease(qRelease as string);
    setTpl(qTemplate as string);
    setEnvironment(qEnv as string);
    setFilter(qName as string);
    setIsFavorite(qFavorite as string);
    setRegion(qRegion as string);
  }, [location.query]);

  const onSubmit = useCallback((result: Expression[]) => {
    setFilter('');
    setEnvironment('');
    setMode(Mode.All);
    setTpl('');
    setRegion('');
    setTplRelease('');
    setIsFavorite('');
    result.forEach((expr) => {
      if (expr.search) {
        setFilter(expr.search);
      }
      if (expr.category && expr.value) {
        switch (expr.category) {
          case SearchKeyEnv:
            setEnvironment(expr.value);
            break;
          case SearchKeyTemplate:
            setTpl(expr.value);
            break;
          case SearchKeyUser:
            setMode(expr.value);
            break;
          case SearchKeyRelease:
            setTplRelease(expr.value);
            break;
          case SearchKeyRegion:
            setRegion(expr.value);
            break;
          case SearchKeyFavorite:
            setIsFavorite(expr.value);
            break;
          default:
            break;
        }
      }
    });
  }, []);

  useEffect(() => {
    const exprs = getLastReview();
    onSubmit(exprs);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const exprs: Expression[] = [];
    if (mode !== '') {
      exprs.push({ category: SearchKeyUser, operator: '=', value: mode });
    }
    if (environment !== '') {
      exprs.push({ category: SearchKeyEnv, operator: '=', value: environment });
    }
    if (isFavorite !== '') {
      exprs.push({ category: SearchKeyFavorite, operator: '=', value: isFavorite });
    }
    if (region !== '') {
      exprs.push({ category: SearchKeyRegion, operator: '=', value: region });
    }
    if (tpl !== '') {
      exprs.push({ category: SearchKeyTemplate, operator: '=', value: tpl });
    }
    if (tplRelease !== '') {
      exprs.push({ category: SearchKeyRelease, operator: '=', value: tplRelease });
    }
    if (filter !== '') {
      exprs.push({ search: filter });
    }
    setDefaultValue([...exprs, {}]);
  }, [environment, filter, mode, tpl, tplRelease, isFavorite, region, intl]);

  const { data: envs } = useRequest(queryEnvironments, {
    onSuccess: () => {
      const e = new Map<string, string>();
      envs!.forEach((item) => e.set(item.name, item.displayName));
      setEnv2DisplayName(e);
    },
  });

  const { data: regions } = useRequest(queryRegions, {
    onSuccess: (items) => {
      items.forEach((item) => {
        displayName2Region?.set(item.displayName, item.name);
      });
      setDisplayName2Region(displayName2Region);
    },
  });

  useRequest(() => listTemplatesV2({ fullpath: false }), {
    onSuccess: (items) => {
      const t: CLUSTER.TemplateOptions[] = [];
      items.forEach((item) => {
        t.push({ label: item.name, value: item.name, isLeaf: false });
      });
      setTemplateOptions(t);
    },
  });

  const { refresh: refreshCluster } = useRequest(() => listClusters({
    userID: mode === Mode.Own
      ? initialState?.currentUser?.id
      : undefined,
    filter,
    pageSize,
    pageNumber,
    environment,
    region: displayName2Region?.get(region),
    template: tpl,
    templateRelease: tplRelease,
    isFavorite: (() => {
      if (isFavorite === 'true') return true;
      if (isFavorite === 'false') return false;
      return undefined;
    })(),
    withFavorite: true,
  }), {
    refreshDeps: [filter, pageNumber, pageSize, environment, tpl, tplRelease, mode, isFavorite, region],
    debounceInterval: 500,
    onSuccess: (data) => {
      const { items, total: t } = data!;
      setLastReview(defaultValue);
      setClusters(items);
      setTotal(t);
      setQuery({
        [QueryName]: filter,
        [QueryEnv]: environment,
        [QueryRelease]: tplRelease,
        [QueryTemplate]: tpl,
        [QueryMode]: mode,
        [QueryFavorite]: isFavorite,
        [QueryRegion]: region,
      });
    },
  });

  const clusterList = useMemo(() => (
    clusters && clusters.map((item: CLUSTER.Cluster) => {
      const treeData = {
        title: item.fullName?.split('/').join('  /  '),
        ...item,
      };
      return (
        <div key={item.id}>
          <Title
            id={treeData.id}
            updatedAt={treeData.updatedAt}
            filter={filter}
            scope={treeData.scope}
            env={env2DisplayName?.get(treeData.scope.environment)}
            template={treeData.template}
            name={treeData.name}
            fullPath={treeData.fullPath}
            git={treeData.git}
            isFavorite={treeData.isFavorite}
            description={treeData.description}
            onStarClick={refreshCluster}
          />
          <Divider style={{ margin: '5px 0 5px 0' }} />
        </div>
      );
    })
  ), [clusters, env2DisplayName, filter, refreshCluster]);

  const handler = useMemo(() => {
    const options: AutoCompleteOption[] = [
      {
        key: SearchKeyEnv,
        type: 'selection',
        values: [
          {
            operator: '=',
            possibleValues: envs ? envs.map((e) => e.name) : [],
          },
        ],

      },
      {
        key: SearchKeyTemplate,
        type: 'selection',
        values: [
          {
            operator: '=',
            possibleValues: templateOptions ? templateOptions.map((t) => t.value) : [],
          },
        ],
      },
      {
        key: SearchKeyRegion,
        type: 'selection',
        values: [
          {
            operator: '=',
            possibleValues: (regions ?? []).map((r) => r.displayName),
          },
        ],
      },
      {
        key: SearchKeyUser,
        type: 'selection',
        values: [
          {
            operator: '=',
            possibleValues: ['all', 'own'],
          },
        ],
      },
      {
        key: SearchKeyFavorite,
        type: 'selection',
        values: [
          {
            operator: '=',
            possibleValues: ['true', 'false'],
          },
        ],
      },
      {
        key: SearchKeyRelease,
        type: 'selection',
        values: [
          {
            operator: '=',
            possibleValues: [],
          },
        ],
        callback: (operator, trace) => {
          for (let i = 0; i < trace.arr.length; i += 1) {
            if (trace.arr[i].type === 'category' && trace.arr[i].value === 'template') {
              const j = i + 2;
              if (j < trace.arr.length && trace.arr[j].type === 'value') {
                const template = templateOptions.filter((t) => t.value === trace.arr[j].value)[0];
                if (template && template.children) {
                  return template.children.map((o) => o.value);
                }
                // eslint-disable-next-line no-await-in-loop
                const request = new XMLHttpRequest();
                request.open('GET', `/apis/core/v1/templates/${trace.arr[j].value}/releases`, false);
                request.send(null);
                if (request.status === 200) {
                  const resp = JSON.parse(request.responseText) as { data: Templates.Release[] };
                  template.children = [];
                  resp.data.forEach((item) => {
                    template.children!.push({
                      label: item.name,
                      value: item.name,
                      isLeaf: true,
                    });
                  });
                  setTemplateOptions([...templateOptions]);
                  return resp.data.map((o) => o.name);
                }
              }
            }
          }
          return [];
        },
      },
    ];

    return new HorizonAutoCompleteHandler(options);
  }, [envs, templateOptions, regions]);

  return (
    <>
      <SearchBox
        hKey="cluster"
        autoCompleteHandler={handler}
        defaultValue={defaultValue}
        onSubmit={onSubmit}
        isCluster
      />
      <Card
        title={intl.formatMessage({ id: 'pages.dashboard.filter.clusters' })}
      >
        {clusterList}
      </Card>
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
