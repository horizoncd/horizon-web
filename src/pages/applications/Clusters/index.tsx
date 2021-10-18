import {Button, Input, Table, Tabs} from "antd";
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb'
import {useState} from "react";
import {history} from "@@/core/history";
import {stringify} from "querystring";
import {useIntl} from "@@/plugin-locale/localeExports";
import {useModel} from "@@/plugin-model/useModel";
import styles from './index.less'

const {TabPane} = Tabs;
const {Search} = Input;

export default () => {
  const intl = useIntl();
  const newCluster = '/clusters/new';
  const {initialState} = useModel('@@initialState');
  const {id} = initialState?.resource || {};
  const pageSize = 10;

  const [searchValue, setSearchValue] = useState('');
  const [total, setTotal] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [query, setQuery] = useState(0);

  const envs = [
    'dev', 'test'
  ]

  const columns = [
    {
      title: 'name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'template',
      dataIndex: 'template',
      key: 'template',
    },
    {
      title: 'version',
      dataIndex: 'version',
      key: 'version',
    },
    {
      title: 'status',
      dataIndex: 'status',
      key: 'status',
    },
  ]

  const data = [
    {
      key: 1,
      name: 'John Brown',
      template: 'New York No. 1 Lake Park',
      version: 'version',
      status: 'status'
    },
  ]

  // 搜索框输入值监听
  const onChange = (e: any) => {
    const {value} = e.target;
    setSearchValue(value);
  };

  // 搜索框按enter
  const onPressEnter = () => {
    setQuery(prev => prev + 1)
  }

  // 按搜索按钮
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
              parentID: id,
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
      <Tabs defaultActiveKey="1" size={'large'} tabBarExtraContent={queryInput}>
        {
          envs.map(env => {
            return <TabPane tab={env} key={env}>
              <Table
                columns={columns}
                dataSource={data}
                pagination={{ position: ['bottomCenter'], current: pageNumber, hideOnSinglePage: true, pageSize, total, onChange: (page) => setPageNumber(page) }}
              />
            </TabPane>
          })
        }
      </Tabs>
    </PageWithBreadcrumb>
  )
}
