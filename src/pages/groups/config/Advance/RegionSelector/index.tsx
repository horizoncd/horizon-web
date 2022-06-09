import {Card} from 'antd';
import DynamicTagForm, {ValueType} from "@/components/DynamicTagForm";
import {useModel} from "@@/plugin-model/useModel";
import {getGroupByID, updateGroupRegionSelector} from "@/services/groups/groups";
import RBAC from "@/rbac";

export default () => {

  const {initialState} = useModel('@@initialState');
  const {id} = initialState!.resource

  const title = <div>
    <div>
      关联Kubernetes
    </div>
    <div style={{fontWeight: 300, fontSize: 14}}>
      分组和kubernetes通过标签进行关联，具体标签信息请访问kubernetes管理页进行查看
    </div>
  </div>

  return (
    <Card title={title}>
      <DynamicTagForm
        queryTags={() => getGroupByID(id).then(({data}) => {
          return {
            data: {
              tags: data.regionSelectors
            }
          }
        })}
        updateTags={(data) => updateGroupRegionSelector(id, data.tags)}
        valueType={ValueType.Multiple}
        disabled={!RBAC.Permissions.setRegionSelector.allowed}
      />
    </Card>
  )
};
