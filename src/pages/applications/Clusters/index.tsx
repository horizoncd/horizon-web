import {Button, Dropdown, Input, Menu, Select, Table, Tabs, Tooltip} from "antd";
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
import RBAC from '@/rbac'
import Utils from '@/utils'
import NoData from "@/components/NoData";
import withTrim from "@/components/WithTrim";
import TagSearch, {SearchInputType} from "@/components/TagSearch";
import type {SearchInput, MultiValueTag} from "@/components/TagSearch";
import {querySubresourceTags} from "@/services/tags/tags";
import {QuestionCircleOutlined} from "@ant-design/icons";
import CollapseList from "@/components/CollapseList";

const {TabPane} = Tabs;
const Search = withTrim(Input.Search);
const {Option} = Select;

export default (props: any) => {
  const {query: q} = props.location;
  const {environment = '', tagSelector = "", filter = ""} = q

  const intl = useIntl();
  const {initialState} = useModel('@@initialState');
  const {id, name: application, fullPath} = initialState!.resource;
  const newCluster = `/applications${fullPath}/-/clusters/new`;
  const [tagSelectorState, setTagSelectorState] = useState(tagSelector)
  const [filterState, setFilterState] = useState(filter)

  const pageSize = 10;

  const TagSelector2SearchInput = (ts: TAG.TagSelector[] | undefined) => {
    if (!ts) {
      return []
    }
    return ts.map((t)=>{
      return {
        type: SearchInputType.Tag,
        key: t.key,
        operator: t.operator,
        value: t.values.length>0 ? t.values[0]: ""
      }
    })
  }

  const encodeTagSelector = (ts: TAG.TagSelector[] | undefined) => {
    if (!ts) {
      return ""
    }
    return ts?.map((t) => {
      return t.key + t.operator + t.values.join(",")
    }).join(",")
  }

  const decodeTagSelector = (tss: string | undefined)  => {
    if (!tss) {
      return []
    }
   
    const ts = tss?.split(",", -1)

    return ts.filter((t)=>{
        const parts = t.split("=", -1)
        if (parts.length != 2) {
          return false
        }
        return true
      }
    ).map((t) => {
      const parts = t.split("=", -1)
      return {
        key: parts[0],
        operator: "=",
        values: [parts[1]],
      }
    })
  }

  const columns = [
    {
      title: '集群名',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => {
        return <a href={`/clusters${fullPath}/${text}/-/pods`}>
          {text}
        </a>
      }
    },
    {
      title: '环境',
      dataIndex: 'environment',
      key: 'environment',
    },
    {
      title: '区域',
      dataIndex: 'regionDisplayName',
      key: 'region',
    },
    {
      title: '模版',
      dataIndex: 'template',
      key: 'template',
    },
    {
      title: <div className={styles.tagTitle}>
      <div>标签</div>
      <Tooltip
        title={<span>键/值长度超过16个字符的标签请到集群主页查看</span>}>
        <QuestionCircleOutlined style={{display: 'block', marginLeft: '5px'}}
        />
      </Tooltip>
    </div>,
      dataIndex: 'tag',
      key: 'tag',
      width: '15%',
      render: (text: any, record: any) => {
        const data = {};
        if (record.tags && Object.keys(record.tags).length > 0) {
          for (const tag of record.tags) {
            if (!Utils.tagShouldOmit(tag)) {
              data[tag.key] = tag.value
            }
          }
          return <div>
              <CollapseList defaultCount={3} data={data}/>
            </div>
        } else {
          return <div/>
        }
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdTime',
      key: 'createdTime',
    },
    {
      title: '修改时间',
      dataIndex: 'updatedTime',
      key: 'updatedTime',
    },
  ]

  const [pageNumber, setPageNumber] = useState(1);
  const [env2DisplayName, setEnv2DisplayName] = useState<Map<string, string>>();
  const [tags, setTags] = useState<MultiValueTag[]>([]);

  const {data: envs} = useRequest(queryEnvironments, {
    onSuccess: () => {
      const e = new Map<string, string>();
      envs!.forEach(item => e.set(item.name, item.displayName))
      setEnv2DisplayName(e)
    }
  });
  const {data: clusters} = useRequest(() => queryClusters(id, 
    {filter, pageNumber, pageSize, environment, tagSelector: tagSelector}
  ), {
    refreshDeps: [filter, environment, pageNumber, tagSelector],
    debounceInterval: 200,
  });
  // 查询应用下的集群标签列表
  const {data: tagsResp} = useRequest(() => querySubresourceTags("applications", id), {
    onSuccess: () => {
      const tMap = new Map<string, string[]>();
      const ts: MultiValueTag[] = []
      tagsResp?.tags.forEach(
        (tag) => {
          if (tag.key == 'jvmExtra' || Utils.tagShouldOmit(tag)) {
            return
          }
          if (tMap.has(tag.key)) {
            const values = tMap.get(tag.key) as string[]
            values.push(tag.value)
            tMap.set(tag.key, values)
          } else {
            tMap.set(tag.key, [tag.value])
          }
        }
      )
      tMap.forEach(
        (value, key) => {
          ts.push({
            key: key,
            values: value,
          })
        }
      )
      setTags(ts)
    }
  });

  const onTagClear = () => {
    setTagSelectorState("")
    setFilterState("")
    history.replace({
      pathname: `/applications${fullPath}/-/clusters`,
      query: {
        environment: environment,
        filter: "",
        tagSelector: ""
      }
    })
  }

  const onTagSearch = (values: SearchInput[]) => {
    const ts: TAG.TagSelector[] = []
    let ft = ""
    values.forEach((v) => {
      if (v.type == SearchInputType.Tag) {
        ts.push(
          {
            key: v.key!,
            operator: v.operator!,
            values: [v.value]
          }
        )
      } else {
        ft = v.value
      }
    })

    const tsEncode = encodeTagSelector(ts)
    
    setTagSelectorState(tsEncode)
    setFilterState(ft)

    history.replace({
      pathname: `/applications${fullPath}/-/clusters`,
      query: {
        environment: environment,
        filter: ft,
        tagSelector: tsEncode
      }
    })
  }

  const queryInput = (
    // @ts-ignore
    <div style={{display: 'flex'}}>
      {
        <Button
          type="primary"
          disabled={!RBAC.Permissions.createCluster.allowedEnv(environment)}
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
      }
    </div>
  )

  const data = clusters?.items.map(item => {
    const {name, scope, template, updatedAt, createdAt, tags: tagList} = item
    return {
      key: name,
      name: name,
      environment: env2DisplayName?.get(scope.environment),
      regionDisplayName: scope.regionDisplayName,
      template: `${template.name}-${template.release}`,
      createdTime: Utils.timeToLocal(createdAt),
      updatedTime: Utils.timeToLocal(updatedAt),
      tags: tagList,
    }
  }).sort((a, b) => {
    if (a.updatedTime < b.updatedTime) {
      return 1;
    }
    if (a.updatedTime > b.updatedTime) {
      return -1;
    }

    return 0;
  })

  const locale = {
    emptyText: <NoData title={'集群为特定应用的部署实例'} desc={
      '你可以将你的cluster集群部署到各种不同的环境（测试线上）\n' +
      '和区域（杭州、新加坡等），集群继承应用的各项配置，当然也可以对大多数配置进行修改。\n' +
      '为不同人员赋予cluster的不同权限\n' +
      '比如只读guest只能查看、项目owner、maintainer可以进行发布的修改'}
    />
  }

  const table = <Table
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

  const tabOnChange = (key: string) => {
    setFilterState(filter)
    setTagSelectorState(tagSelector)
    history.replace({
      pathname: `/applications${fullPath}/-/clusters`,
      query: {
        environment: key,
        filter: filterState,
        tagSelector: tagSelectorState,
      }
    })
  }

  const tagSearch = <div style={{display: "flex", alignItems: 'baseline'}}>
    <TagSearch
      defaultValues={[
        ...TagSelector2SearchInput(decodeTagSelector(tagSelectorState)), 
        {value: filterState}
      ]}
      tagSelectors={tags}
      onSearch={onTagSearch}
      onClear={onTagClear}
    />
    <div style={{marginLeft: '10px'}}>
      <Tooltip
        title={<span>多个搜索条件之间是“与”的关系，键/值长度超过16个字符的标签不会自动提示</span>}>
        <QuestionCircleOutlined style={{display: 'block'}}
        />
      </Tooltip>
    </div>
  </div>

  return (
    <PageWithBreadcrumb>
      <Tabs activeKey={environment} size={'large'} tabBarExtraContent={queryInput} onChange={tabOnChange}
        animated={false}>
        <TabPane tab={'所有'} key={''}>
          {tagSearch}
          {table}
        </TabPane>
        {
          envs?.map(item => {
            const {name, displayName} = item
            return <TabPane tab={displayName} key={name}>
              {tagSearch}
              {table}
            </TabPane>
          })
        }
      </Tabs>
    </PageWithBreadcrumb>
  )
}
