import {Button} from "antd";
import RBAC from "@/rbac";
import {history} from "@@/core/history";
import {useModel} from "@@/plugin-model/useModel";


export default (props: any) => {
  const { initialState } = useModel('@@initialState');
  const { fullPath: fullPath } = initialState!.resource;
  const newApplicationV1 = `/groups${fullPath}/-/newapplicationv1`;
  const newApplicationV2 = `/groups${fullPath}/-/newapplicationv2`;
  return (
    <div>
      <div>
        <Button
          disabled={!RBAC.Permissions.createApplication.allowed}
          type="primary"
          onClick={()=>{
            history.push({
              pathname: newApplicationV2,
            })
          }}
          >
          从Git构建
        </Button>
        <Button
          disabled={!RBAC.Permissions.createApplication.allowed}
          onClick={()=> {
            history.push({
              pathname: newApplicationV1,
              }
            )
          }}
        >
          老入口
        </Button>
      </div>
    </div>
  );
}
