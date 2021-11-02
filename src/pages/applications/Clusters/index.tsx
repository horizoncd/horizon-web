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

const {TabPane} = Tabs;
const {Search} = Input;

export default () => {
  const intl = useIntl();
  const {initialState} = useModel('@@initialState');
  const {id, name: application, fullPath} = initialState!.resource;
  const newCluster = `/applications${fullPath}/-/clusters/new`;

  const pageSize = 10;

  const columns = [
    {
      title: 'name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => {
        return <a href={`/clusters${fullPath}/${text}/-/pods`}>
          {text}
        </a>
      }
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
      title: 'updateTime',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
    },
  ]

  const [filter, setFilter] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [query, setQuery] = useState(0);
  const [environment, setEnvironment] = useState('');

  const {data: envs} = useRequest(queryEnvironments, {
    onSuccess: () => {
      setEnvironment(envs![0].name)
    }
  });

  const {data: clusters} = useRequest(() => {
    return queryClusters(id, {
        filter, environment, pageNumber, pageSize,
      }
    )
  }, {
    ready: !!environment,
    refreshDeps: [query, environment, pageNumber],
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
              application,
              environment
            }),
          });
        }}
      >
        {intl.formatMessage({id: 'pages.groups.New cluster'})}
      </Button>
    </div>
  )

  const data = clusters?.items.map(item => {
    return {
      key: item.name,
      name: item.name,
      region: item.scope.region,
      template: item.template.name,
    }
  })

  return (
    <PageWithBreadcrumb>
      <Tabs defaultActiveKey={environment} size={'large'} tabBarExtraContent={queryInput} onChange={setEnvironment}>
        {
          envs?.map(item => {
            const {name, displayName} = item
            return <TabPane tab={displayName} key={name}>
              <Table
                columns={columns}
                dataSource={data}
                pagination={{
                  position: ['bottomCenter'],
                  current: pageNumber,
                  hideOnSinglePage: true,
                  pageSize,
                  total: clusters?.total,
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
