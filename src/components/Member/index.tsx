import { useEffect, useRef, useState } from 'react';
import {
  Alert, Button, Card, Divider, Form, Input, List, Modal, Select,
} from 'antd';
import { useModel } from '@@/plugin-model/useModel';
import { DeleteOutlined, ExclamationCircleOutlined, ExportOutlined } from '@ant-design/icons';
import { useIntl } from '@@/plugin-locale/localeExports';
import { useRequest } from '@@/plugin-request/request';
import { history } from 'umi';
import Detail from '@/components/PageWithBreadcrumb';
import { queryUsers } from '@/services/members/members';
import Utils from '@/utils';
import RBAC from '@/rbac';
import styles from './index.less';
import { MemberType } from '@/const';
import { API } from '@/services/typings';

const { Option } = Select;
const { Search } = Input;
const inviteMemberKey = 'inviteMember';
const memberListKey = 'Existing shares';
const defaultPageNumber = 0;
let userPageNumber = 0;

interface MemberProps {

  title: string,

  resourceType: string,

  resourceID: number,

  resourceName: string

  onInviteMember: (member: API.NewMember) => Promise<any>;

  onListMembers: (resourceID: number) => Promise<any>;

  onUpdateMember: (id: number, member: API.UpdateMember) => Promise<any>;

  onRemoveMember: (id: number) => Promise<any>;

  allowInvite: boolean
}

export default (props: MemberProps) => {
  const [form] = Form.useForm();
  const intl = useIntl();
  const {
    title,
    resourceType,
    resourceID,
    resourceName,
    onInviteMember,
    onListMembers,
    onUpdateMember,
    onRemoveMember,
    allowInvite,
  } = props;
  const { initialState, refresh } = useModel('@@initialState');
  const { successAlert } = useModel('alert');
  const currentUser = initialState?.currentUser as API.CurrentUser;
  // const roles = initialState?.;
  const [memberFilter, setMemberFilter] = useState<string>('');

  const defaultMemberPageSize = 10;
  const [membersAfterFilter, setMembersAfterFilter] = useState<API.PageResult<API.Member>>({ items: [], total: 0 });
  const { roleRank, roleList } = RBAC.GetRoleList();
  const [needAlert, setNeedAlert] = useState(true);

  const { data, run: refreshMembers, loading: loadingMembers } = useRequest(() => onListMembers(resourceID), {
    refreshDeps: [memberFilter],
    onSuccess: () => {
      if (!data.items) {
        data.items = [];
      }
      for (let i = 0; i < data.items.length; i += 1) {
        if (data.items[i].memberNameID === currentUser.id) {
          setNeedAlert(false);
          break;
        }
      }
      if (memberFilter === '') {
        setMembersAfterFilter({ items: data.items, total: data.total });
      } else {
        let cnt = 0;
        let items: API.Member[] = [];
        for (let i = 0; i < data.items.length; i += 1) {
          if (data.items[i].memberName.indexOf(memberFilter) !== -1) {
            items = items.concat(data.items[i]);
            cnt += 1;
          }
        }
        setMembersAfterFilter({ items, total: cnt });
      }
    },
  });

  const defaultUserPageSize = 20;
  const [users, setUsers] = useState<API.PageResult<API.User>>({ total: 0, items: [] });
  const [userPage, setUserPage] = useState<API.PageParam>({
    pageNumber: defaultPageNumber,
    pageSize: defaultUserPageSize,
  });

  const pageOnMount = useRef(true);
  useEffect(() => {
    if (pageOnMount.current) {
      pageOnMount.current = false;
      return;
    }
    queryUsers(userPage.pageNumber, userPage.pageSize, userPage.filter).then((result) => {
      if (userPage.isConcat === true) {
        const newUsers = {
          total: users.total,
          items: users.items.concat(result.data.items),
        };
        setUsers(newUsers);
      } else {
        setUsers(result.data);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userPage]);

  const onSearchUser = (filter: string) => {
    if (filter.length < 3) {
      setUsers({ total: 0, items: [] });
      return;
    }
    setUserPage({ pageNumber: defaultPageNumber, pageSize: defaultUserPageSize, filter });
  };

  const onScrollUser = (e: any) => {
    const { target } = e;
    if ((users.total > (userPageNumber + 1) * defaultUserPageSize) && (target.scrollTop + target.offsetHeight >= target.scrollHeight)) {
      userPageNumber += 1;
      setUserPage({
        pageNumber: userPageNumber, pageSize: defaultUserPageSize, filter: userPage.filter, isConcat: true,
      });
    }
  };

  const onInviteClick = (values: {
    role: string,
    userID: number,
  }) => {
    onInviteMember({
      resourceType,
      resourceID,
      memberType: MemberType.USER,
      memberNameID: values.userID,
      role: values.role,
    }).then(() => {
      successAlert(intl.formatMessage({ id: 'pages.members.add.success' }));
      form.resetFields();
      setUsers({ total: 0, items: [] });
      refreshMembers().then();
    });
  };

  const onMemberSearch = (filter: string) => {
    setMemberFilter(filter);
    refreshMembers().then();
  };

  const onMemberChange = (e: any) => {
    if (e.target.value === '') {
      setMemberFilter(e.target.value);
    }
  };

  const onRemoveClick = (memberID: number, memberName: string) => {
    Modal.confirm({
      title: intl.formatMessage({ id: 'pages.members.remove.confirm.title' }, {
        member: (
          <span className={styles.bold}>
            {' '}
            {memberName}
          </span>
        ),
      }),
      icon: <ExclamationCircleOutlined />,
      okText: intl.formatMessage({ id: 'pages.applicationDelete.confirm.ok' }),
      cancelText: intl.formatMessage({ id: 'pages.applicationDelete.confirm.cancel' }),
      onOk: () => {
        onRemoveMember(memberID).then(() => {
          successAlert(intl.formatMessage({ id: 'pages.members.remove.success' }));
          refreshMembers().then();
        });
      },
    });
  };

  const onLeaveClick = (memberID: number) => {
    Modal.confirm({
      title: intl.formatMessage({ id: 'pages.members.leave.confirm.title' }),
      icon: <ExclamationCircleOutlined />,
      okText: intl.formatMessage({ id: 'pages.applicationDelete.confirm.ok' }),
      cancelText: intl.formatMessage({ id: 'pages.applicationDelete.confirm.cancel' }),
      onOk: () => {
        onRemoveMember(memberID).then(() => {
          refresh().then();
          successAlert(intl.formatMessage({ id: 'pages.members.leave.success' }));
          refreshMembers().then();
        });
      },
    });
  };

  const onRoleSelect = (role: string, memberID: number) => {
    onUpdateMember(memberID, {
      id: memberID,
      role,
    }).then(() => {
      successAlert(intl.formatMessage({ id: 'pages.members.update.success' }));
      refreshMembers().then();
    });
  };

  const inviteTabList = [
    {
      key: 'inviteMember',
      tab: intl.formatMessage({ id: 'pages.members.user.title' }),
    },
  ];

  const memberTabList = [
    {
      key: memberListKey,
      tab: (
        <div>
          {intl.formatMessage({ id: 'pages.members.list.label' })}
          <span
            className={styles.tabNumber}
          >
            {membersAfterFilter.total}
          </span>
        </div>
      ),
    },
  ];

  const searchMemberLabel = (
    <span
      className={styles.textBold}
    >
      {intl.formatMessage({ id: 'pages.members.user.email.label' })}
    </span>
  );
  const chooseRoleLabel = (
    <span
      className={styles.textBold}
    >
      {intl.formatMessage({ id: 'pages.members.user.role.label' })}
    </span>
  );
  // FIXME: remove this
  const roleOptions = (history.location.pathname.startsWith('/templates')
    ? roleList.slice(1, 2)
    : roleList.slice(roleRank.get(currentUser.role)))
    .map((role) => <Option key={role} value={role}>{role}</Option>);
  const userOptions = users.items.map((user) => (
    <Option
      key={user.id}
      value={user.id}
      label={user.name}
      filter={user.name + user.email + user.fullName}
    >
      <p>
        {user.name}
        <br />
        <span className={styles.textSecondary}>
          @
          {user.fullName}
        </span>
      </p>
    </Option>
  ));

  const inviteTabsContents = {
    inviteMember: (
      <Form
        layout="vertical"
        onFinish={onInviteClick}
        form={form}
      >
        <Form.Item
          name="userID"
          rules={[{ required: true, message: intl.formatMessage({ id: 'pages.members.user.email.message' }) }]}
          label={searchMemberLabel}
        >
          <Select
            showSearch
            defaultOpen={false}
            onSearch={onSearchUser}
            optionFilterProp="filter"
            optionLabelProp="label"
            onPopupScroll={onScrollUser}
            placeholder={intl.formatMessage({ id: 'pages.members.user.email.threshold' })}
          >
            {userOptions}
          </Select>
        </Form.Item>
        <Form.Item
          name="role"
          label={chooseRoleLabel}
          rules={[{ required: true, message: intl.formatMessage({ id: 'pages.members.user.role.message' }) }]}
          tooltip={(
            <div
              className={styles.whitespacePreLine}
            >
              {intl.formatMessage({ id: 'pages.members.role.tip' })}
            </div>
          )}
        >
          <Select>
            {roleOptions}
          </Select>
        </Form.Item>
        <Button type="primary" htmlType="submit">{intl.formatMessage({ id: 'pages.members.user.invite' })}</Button>
      </Form>
    ),
  };

  return (
    <Detail>
      <h1>{title}</h1>
      <Divider />
      {!loadingMembers && needAlert && (
        <Alert
          className={styles.alert}
          message={(
            <span className={styles.alertSpan}>{intl.formatMessage({ id: 'pages.members.user.anonymous.alert' })}</span>)}
        />
      )}
      {
        (currentUser.isAdmin || allowInvite) && (
          <Card
            tabList={inviteTabList}
            activeTabKey={inviteMemberKey}
          >
            {inviteTabsContents[inviteMemberKey]}
          </Card>
        )
      }
      <Card
        bodyStyle={{ padding: '0px' }}
        bordered={false}
        tabList={memberTabList}
        activeTabKey={memberListKey}
      >
        <div className={styles.searchAboveMemberList}>
          <span>
            {intl.formatMessage({ id: 'pages.members.list.title' })}
            <span
              className={styles.textBold}
            >
              {resourceName}
            </span>
          </span>
          <div className={styles.componentFlex} />
          <Search
            type="search"
            className={styles.searchShortWidth}
            onChange={onMemberChange}
            onSearch={onMemberSearch}
            placeholder={intl.formatMessage({ id: 'pages.common.search' })}
          />
        </div>
        <List
          pagination={{
            pageSize: defaultMemberPageSize,
            total: membersAfterFilter.total,
          }}
          itemLayout="horizontal"
          dataSource={membersAfterFilter.items}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                title={(
                  <span>
                    {item.memberName}
                    <span hidden={item.resourceID === resourceID} />
                    {(currentUser.id === item.memberNameID)
                      ? <span className={styles.textSelfAnnotation}>It&apos;s you</span> : null}
                  </span>
                )}
                className={styles.memberListPadding}
                description={(
                  <div>
                    <span
                      hidden={resourceID === item.resourceID}
                    >
                      {intl.formatMessage({ id: 'pages.members.list.sourceFrom' }, {
                        resourceName: (
                          <a href={`/${item.resourceType}${item.resourcePath}/-/members`}>
                            {item.resourceName}
                          </a>
                        ),
                      })}
                    </span>
                    <span>
                      {intl.formatMessage({ id: 'pages.members.list.givenAccess' }, {
                        grantorName: item.grantorName,
                        grantedTime: Utils.timeFromNow(item.grantTime),
                      })}
                    </span>
                  </div>
                )}
              />
              {currentUser.id !== item.memberNameID && roleRank.get(currentUser.role) <= roleRank.get(item.role)
                && item.resourceID === resourceID
                ? (
                  <Select
                    dropdownMatchSelectWidth={false}
                    onSelect={(role: string) => {
                      onRoleSelect(role, item.id);
                    }}
                    defaultValue={item.role}
                  >
                    {roleList.slice(roleRank.get(currentUser.role)).map((role) => <Option key={role} value={role}>{role}</Option>)}
                  </Select>
                ) : (
                  <span
                    className={styles.selectRoleNarrow}
                  >
                    {item.role}
                  </span>
                )}
              {currentUser.id === item.memberNameID
                && item.resourceID === resourceID ? (
                  <Button
                    type="primary"
                    danger
                    className={styles.buttonRightSide}
                    size="small"
                    onClick={() => {
                      onLeaveClick(item.id);
                    }}
                    value={item.id}
                    icon={
                      <ExportOutlined />
                  }
                  >
                    {intl.formatMessage({ id: 'pages.members.list.leave' })}
                  </Button>
                ) : null}
              {currentUser.id !== item.memberNameID && roleRank.get(currentUser.role) <= roleRank.get(item.role)
                && item.resourceID === resourceID
                ? (
                  <Button
                    type="primary"
                    danger
                    className={styles.buttonRightSide}
                    value={item.id}
                    onClick={() => {
                      onRemoveClick(item.id, item.memberName);
                    }}
                    icon={<DeleteOutlined />}
                  />
                ) : null}
            </List.Item>
          )}
        />
      </Card>
    </Detail>
  );
};
