import React from 'react';
import {Divider} from "antd";
import DynamicTagForm from '@/components/DynamicTagForm'

import {getClusterTemplateSchemaTags, updateClusterTemplateSchemaTags} from "@/services/clusters/clusters";
import Detail from '@/components/PageWithBreadcrumb'

export default (): React.ReactNode => {
  return (
    <Detail>
      <h1>{"管理员标签管理"}</h1>
      <Divider/>
      <DynamicTagForm
        queryTags={getClusterTemplateSchemaTags}
        updateTags={updateClusterTemplateSchemaTags}
      />
    </Detail>
  );
};
