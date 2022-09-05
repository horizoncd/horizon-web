import { Space } from 'antd';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import Delete from '@/pages/groups/config/Advance/Delete';
import Transfer from '@/pages/groups/config/Advance/Transfer';
import RegionSelector from '@/pages/groups/config/Advance/RegionSelector';

export default () => (
  <PageWithBreadcrumb>
    <Space direction="vertical" size={10} style={{ display: 'flex' }}>
      <Transfer />
      <RegionSelector />
      <Delete />
    </Space>
  </PageWithBreadcrumb>
);
