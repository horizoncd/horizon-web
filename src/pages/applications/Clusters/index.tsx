import {Button, Input, Table, Tabs} from "antd";
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb'
import {useState} from "react";
import {history} from "@@/core/history";
import {stringify} from "querystring";
import {useIntl} from "@@/plugin-locale/localeExports";
import {useModel} from "@@/plugin-model/useModel";
import styles from './index.less'
import {useRequest} from "@@/plugin-request/request";
import {queryEnvironments} from "@/services/environments/environments";
import {queryClusters} from "@/services/clusters/clusters";
import NotFount from "@/pages/404";

const {TabPane} = Tabs;
const {Search} = Input;

export default () => {
  const intl = useIntl();
  const newCluster = '/clusters/new';
  const {initialState} = useModel('@@initialState');
  const {id, name: application} = initialState?.resource || {};
  if (!application) {
    return <NotFount/>;
  }

  const pageSize = 10;

  const [filter, setFilter] = useState('');
  const [total, setTotal] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [query, setQuery] = useState(0);
  const [env, setEnv] = useState('');

  const {data: envs} = useRequest(queryEnvironments, {
    onSuccess: () => {
      setEnv(envs![0].name)
    }
  });

  const columns = [
    {
      title: 'name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'region',
      dataIndex: 'region',
      key: 'region',
    },
    {
      title: 'template',
      dataIndex: 'template',
      key: 'template',
    },
    {
      title: 'createTime',
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: 'updateTime',
      dataIndex: 'updateTime',
      key: 'updateTime',
    },
  ]

  const {data: clusters} = useRequest(() => {
    if (env) {
      queryClusters(application, {
          filter, env, pageNumber, pageSize,
        }
      )
    }
  }, {
    onSuccess: () => {
      setTotal(clusters?.total || 0)
    },
    refreshDeps: [query, env, pageNumber],
  });

  const onChange = (e: any) => {
    const {value} = e.target;
    setFilter(value);
  };

  const onPressEnter = () => {
    setQuery(prev => prev + 1)
  }

  const onSearch = () => {
    setQuery(prev => prev + 1)
  }
  const queryInput = (
    <div>
      <Search className={styles.antInputGroupWrapper} placeholder="Search" onPressEnter={onPressEnter}
              onSearch={onSearch}
              onChange={onChange}/>

      <Button
        type="primary"
        className={styles.createClusterBtn}
        onClick={() => {
          history.push({
            pathname: newCluster,
            search: stringify({
              application
            }),
          });
        }}
      >
        {intl.formatMessage({id: 'pages.groups.New cluster'})}
      </Button>
    </div>
  )

  return (
    <PageWithBreadcrumb>
      <Tabs defaultActiveKey={env} size={'large'} tabBarExtraContent={queryInput}>
        {
          envs?.map(item => {
            const {name, displayName} = item
            return <TabPane tab={displayName} key={name}>
              <Table
                columns={columns}
                dataSource={clusters?.items}
                pagination={{
                  position: ['bottomCenter'],
                  current: pageNumber,
                  hideOnSinglePage: true,
                  pageSize,
                  total,
                  onChange: (page) => setPageNumber(page)
                }}
              />
            </TabPane>
          })
        }
      </Tabs>
    </PageWithBreadcrumb>
  )
}
