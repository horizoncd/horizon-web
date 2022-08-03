import {listGitRef} from "@/services/code/code";
import {Form, Select} from "antd"
import {useRequest} from "umi";

const {Option} = Select;

export const TagSelector = (props: {repository: string, prefix: string[] }) => {
  const {data: tags} = useRequest((filter?: string) => listGitRef({
      refType: 'tag',
      giturl: props.repository,
      filter,
      pageNumber: 1,
      pageSize: 50,
    }), {
      debounceInterval: 100,
      ready: true,
    })




    return <Form.Item label={"Name"} name={props.prefix.length === 0 ? 'name' :[...props.prefix,'name']} 
    required={true} extra={'指定release的唯一名称'}>
    <Select>
        {tags === undefined ? <></> : tags.map(s => <Option key={s} value={s}>{s}</Option>)}
    </Select>
    </Form.Item>
}