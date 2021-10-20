import {useEffect, useRef, useState} from 'react';
import {Alert, Button, Card, Divider, Form, Input, List, notification, Select} from 'antd';
import Detail from '@/components/PageWithBreadcrumb';
import {useModel} from "@@/plugin-model/useModel";
import {queryUsers} from "@/services/members/members";
import Utils from "@/utils";
import {DeleteOutlined, ExportOutlined} from "@ant-design/icons";
import styles from './index.less'
import {useIntl} from "@@/plugin-locale/localeExports";

const {Option} = Select;
const {Search} = Input;
const inviteMemberKey = "inviteMember";
const memberListKey = "Existing shares";
const defaultPageNumber = 0;
let userPageNumber = 0

// member组件入参
interface MemberProps {
  // 标题
  title: string,
  // 关联资源类型，group/application
  resourceType: string,
  // 关联资源id
  resourceID: number,
  // 关联资源名称
  resourceName: string
  // 新增member
  onInviteMember: (resourceType: string, resourceID: number, member: API.NewMember) => Promise<any>;
  // 查询member列表
  onListMembers: (resourceType: string, resourceID: number) => Promise<any>;
  // 更新member
  onUpdateMember: (id: number, member: API.UpdateMember) => Promise<any>;
  // 移除member
  onRemoveMember: (id: number) => Promise<any>;
}

export default (props: MemberProps) => {
  const intl = useIntl();
  const {
    title,
    resourceType,
    resourceID,
    resourceName,
    onInviteMember,
    onListMembers,
    onUpdateMember,
    onRemoveMember
  } = props;
  const {initialState} = useModel('@@initialState');
  const currentUser = initialState?.currentUser as API.CurrentUser;
  const [currentRole, setCurrentRole] = useState<string>(Utils.roles.NotExist);
  // const now = new Date();

  // member翻页监听：重新获取member列表
  const defaultMemberPageSize = 6;
  const [members, setMembers] = useState<API.PageResult<API.Member>>({items: [], total: 0})
  const [membersAfterFilter, setMembersAfterFilter] = useState<API.PageResult<API.Member>>({items: [], total: 0})
  const [memberPage, setMemberPage] = useState<API.PageParam>({
    pageNumber: defaultPageNumber,
    pageSize: defaultMemberPageSize
  })
  useEffect(() => {
    onListMembers(resourceType, resourceID).then(({data}) => {
      setCurrentRole(Utils.roles.NotExist)
      for (let i = 0; i < data.items.length; i++) {
        if (data.items[i].memberNameID === currentUser.id) {
          setCurrentRole(data.items[i].role);
          break;
        }
      }
      setMembers(data);

      //前端过滤
      if (memberPage.filter === undefined || memberPage.filter === "") {
        setMembersAfterFilter(data)
      } else {
        let cnt = 0;
        let items: API.Member[] = [];
        for (let i = 0; i < data.items.length; i++) {
          if (data.items[i].memberName.indexOf(memberPage.filter) !== -1) {
            items = items.concat(data.items[i])
            cnt++;
          }
        }
        setMembersAfterFilter({items: items, total: cnt});
      }
    })
  }, [memberPage]);

  // role翻页监听：重新获取role列表
  // const defaultRolePageSize = 6;
  // const [roleList, setRoleList] = useState<API.Role[]>([])
  // const [rolePage, setRolePage] = useState<API.PageParam>({
  //   pageNumber: defaultPageNumber,
  //   pageSize: defaultRolePageSize
  // })
  // useEffect(() => {
  //   queryRoles().then(({items}) => {
  //     setRoleList(items)
  //   });
  // }, [rolePage]);

  // user翻页监听：重新获取user列表
  const defaultUserPageSize = 20;
  const [users, setUsers] = useState<API.PageResult<API.User>>({total: 0, items: []})
  const [userPage, setUserPage] = useState<API.PageParam>({
    pageNumber: defaultPageNumber,
    pageSize: defaultUserPageSize
  })

  const pageOnMount = useRef(true)
  useEffect(() => {
    // 第一次（即页面刷新时）不执行
    if (pageOnMount.current) {
      pageOnMount.current = false;
      return;
    }
    queryUsers(userPage.pageNumber, userPage.pageSize, userPage.filter).then(({data}) => {
      if (userPage.isConcat === true) {
        const newUsers = {
          total: users.total,
          items: users.items.concat(data.items)
        }
        setUsers(newUsers);
      } else {
        setUsers(data);
      }
    });
  }, [userPage]);

  // 页面刷新监听
  useEffect(() => {
    // setRolePage({pageNumber: defaultPageNumber, pageSize: defaultRolePageSize});
    setMemberPage({pageNumber: defaultPageNumber, pageSize: defaultUserPageSize});
  }, []);

  // user搜索框过滤事件：查询user列表
  const onSearchUser = (filter: string) => {
    if (filter.length < 3) {
      setUsers({total: 0, items: []});
      return;
    }
    setUserPage({pageNumber: defaultPageNumber, pageSize: defaultUserPageSize, filter: filter});
  }

  // user搜索框滚动事件：分页查询user列表
  const onScrollUser = (e: any) => {
    const {target} = e;
    if ((users.total > (userPageNumber + 1) * defaultUserPageSize) && (target.scrollTop + target.offsetHeight >= target.scrollHeight)) {
      userPageNumber++;
      setUserPage({pageNumber: userPageNumber, pageSize: defaultUserPageSize, filter: userPage.filter, isConcat: true});
    }
  }

  // invite member按钮点击事件：添加member
  const onInviteClick = (values: {
    role: string,
    userID: number,
  }) => {
    onInviteMember(resourceType, resourceID, {
      resourceType: resourceType,
      resourceID: resourceID,
      memberType: 0,
      memberNameID: values.userID,
      role: values.role,
    }).then(() => {
      notification.success({
        message: intl.formatMessage({id: "pages.members.add.success"}),
      })
      setMemberPage({pageNumber: defaultPageNumber, pageSize: defaultUserPageSize});
    })
  }

  // member列表翻页
  // const onMemberPageChange = (page: number, pageSize: number) => {
  //   setMemberPage({pageSize: pageSize, pageNumber: page, filter: memberPage.filter});
  // }

  // member搜索
  const onMemberSearch = (filter: string) => {
    setMemberPage({pageSize: defaultMemberPageSize, pageNumber: defaultPageNumber, filter: filter})
  }

  // member搜索条件变化事件：清空则重置搜索条件
  const onMemberChange = (e: any) => {
    if (e.target.value === "") {
      setMemberPage({pageSize: defaultMemberPageSize, pageNumber: defaultPageNumber})
    }
  }

  // 移除按钮点击事件：删除member
  const onRemoveClick = (e: any) => {
    onRemoveMember(e.currentTarget.value).then(() => {
      notification.success(
        {
          message: intl.formatMessage({id: "pages.members.remove.success"}),
        }
      );
      setMemberPage({pageNumber: defaultPageNumber, pageSize: defaultUserPageSize});
    })
  }

  // 退出按钮点击事件：删除member
  const onLeaveClick = (e: any) => {
    onRemoveMember(e.currentTarget.value).then(() => {
      notification.success(
        {
          message: intl.formatMessage({id: "pages.members.leave.success"}),
        }
      );
      setMemberPage({pageNumber: defaultPageNumber, pageSize: defaultUserPageSize});
    })
  }

  // 选择角色事件：更新member
  const onRoleSelect = (role: string, memberID: number) => {
    onUpdateMember(memberID, {
      id: memberID,
      role: role,
    }).then(() => {
      notification.success(
        {
          message: intl.formatMessage({id: "pages.members.update.success"}),
        }
      )
      setMemberPage({pageNumber: defaultPageNumber, pageSize: defaultUserPageSize});
    })
  }

  const inviteTabList = [
    {
      key: "inviteMember",
      tab: intl.formatMessage({id: 'pages.members.user.title'}),
    },
  ]

  const memberTabList = [
    {
      key: memberListKey,
      tab: <div>{intl.formatMessage({id: 'pages.members.list.label'})}<span
        className={styles.tabNumber}>{members.total}</span></div>,
    },
  ]

  const searchMemberLabel = <span
    className={styles.textBold}>{intl.formatMessage({id: 'pages.members.user.email.label'})}</span>
  const chooseRoleLabel = <span
    className={styles.textBold}>{intl.formatMessage({id: 'pages.members.user.role.label'})}</span>
  const roleOptions = Utils.rolePermissions[currentRole][Utils.actions.ManageMember].map(function (role) {
    return <Option key={role} value={role}>{role}</Option>
  })
  const userOptions = users.items.map(function (user) {
    return <Option key={user.id} value={user.id} label={user.name}
                   filter={user.name + user.email + user.fullName}>
      <p>{user.name}<br/><span className={styles.textSecondary}>@{user.fullName}</span></p>
    </Option>
  })

  const inviteTabsContents = {
    inviteMember: <Form layout="vertical" onFinish={onInviteClick}>
      <Form.Item name="userID"
                 rules={[{required: true, message: intl.formatMessage({id: "pages.members.user.email.message"})}]}
                 label={searchMemberLabel}>
        <Select
          showSearch
          defaultOpen={false}
          onSearch={onSearchUser}
          optionFilterProp={"filter"}
          optionLabelProp={"label"}
          onPopupScroll={onScrollUser}
          placeholder={intl.formatMessage({id: 'pages.members.user.email.threshold'})}>
          {userOptions}
        </Select>
      </Form.Item>
      <Form.Item name="role" label={chooseRoleLabel}
                 rules={[{required: true, message: intl.formatMessage({id: "pages.members.user.role.message"})}]}
                 tooltip={(
                   <div
                     className={styles.whitespacePreLine}>{intl.formatMessage({id: "pages.members.role.tip"})}</div>)}>
        <Select>
          {roleOptions}
        </Select>
      </Form.Item>
      <Button type="primary" htmlType="submit">{intl.formatMessage({id: 'pages.members.user.invite'})}</Button>
    </Form>,
  }


  return (
    <Detail>
      <h1>{title}</h1>
      <Divider/>
      {currentRole === Utils.roles.NotExist ? <Alert
        message={intl.formatMessage({id: "pages.members.user.notExist.alert"})}
      /> : null}
      <Card
        hidden={currentRole === Utils.roles.NotExist}
        tabList={inviteTabList}
        activeTabKey={inviteMemberKey}
      >
        {inviteTabsContents[inviteMemberKey]}
      </Card>
      <Card
        bodyStyle={{padding: "0px"}}
        bordered={false}
        tabList={memberTabList}
        activeTabKey={memberListKey}
      >
        <div className={styles.searchAboveMemberList}>
          <span>{intl.formatMessage({id: 'pages.members.list.title'})}<span
            className={styles.textBold}>{resourceName}</span></span>
          <div className={styles.componentFlex}/>
          <Search type="search" className={styles.searchShortWidth} onChange={onMemberChange}
                  onSearch={onMemberSearch}
                  placeholder="Search"/>
        </div>
        <List
          pagination={{
            // onChange: (page, pageSize) => {
            //   onMemberPageChange(page, pageSize as number)
            // },
            pageSize: defaultMemberPageSize,
            total: members.total,
          }}
          itemLayout="horizontal"
          dataSource={membersAfterFilter.items}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                title={<span>{item.memberName}<span hidden={item.resourceID === resourceID}>·</span><a
                  hidden={item.resourceID === resourceID}
                  href={"/groups" + item.resourcePath + "/-/members"}>{item.resourceName}</a>
                  <span hidden={currentUser.id !== item.memberNameID}
                        className={styles.textSelfAnnotation}>It's you</span>
                </span>}
                className={styles.memberListPadding}
                description={(
                  <span>{intl.formatMessage({id: "pages.members.remove.givenAccess"}, {
                    grantorName: item.grantorName,
                    grantedTime: Utils.timeFromNow(item.grantTime)
                  })}</span>)}
              />
              {currentUser.id !== item.memberNameID && Utils.permissionAllowed(currentRole, Utils.actions.ManageMember, item.role) ?
                <Select
                  dropdownMatchSelectWidth={false}
                  onSelect={(role: string) => {
                    onRoleSelect(role, item.id)
                  }}
                  defaultValue={item.role}>
                  {Utils.rolePermissions[currentRole][Utils.actions.ManageMember].map(function (role) {
                    return <Option key={role} value={role}>{role}</Option>
                  })}
                </Select> : <span
                  className={styles.selectRoleNarrow}>{item.role}</span>}
              {currentUser.id === item.memberNameID
              && item.resourceID === resourceID ? <Button type="primary" danger
                                                          className={styles.buttonRightSide}
                                                          size="small"
                                                          onClick={onLeaveClick}
                                                          value={item.id}
                                                          icon={
                                                            <ExportOutlined/>}>
                {intl.formatMessage({id: 'pages.members.list.leave'})}
              </Button> : null}
              {currentUser.id !== item.memberNameID && Utils.permissionAllowed(currentRole, Utils.actions.ManageMember, item.role)
              && item.resourceID === resourceID ?
                <Button type="primary" danger
                        className={styles.buttonRightSide}
                        value={item.id}
                        onClick={onRemoveClick}
                        icon={<DeleteOutlined/>}>
                </Button> : null}
            </List.Item>
          )}
        />
      </Card>

    </Detail>
  );
};
