import { ComponentWithParamID, PageWithBreadcrumb } from '@/components/Enhancement';
import { UserDetail, UserDetailProps } from '@/pages/user/Detail';

// eslint-disable-next-line react/jsx-props-no-spreading
const AdminUserDetail = (props: Omit<UserDetailProps, 'userPage'>) => <UserDetail {...props} userPage={false} />;

export default PageWithBreadcrumb(
  ComponentWithParamID(AdminUserDetail),
);
