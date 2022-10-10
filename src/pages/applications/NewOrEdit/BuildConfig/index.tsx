import {useIntl, useRequest} from 'umi';
import JsonSchemaForm from '@/components/JsonSchemaForm';
import {Card} from 'antd';
import styles from '../index.less';
import {getBuildSchema} from "@/services/buildschema/buildschema";

export default (props: any) => {
  const {readonly = false} = props;

  const  {data} = useRequest(() => getBuildSchema(),{
    onSuccess:() => {
      console.log("getBuildSchema success")
      console.log(data)
    },
    onError:() =>{
      console.log("getBuildSchema error")
    }
  });
  const onChange = ({formData, errors}: any) => {
    if (readonly) {
      return;
    }
    props.setConfig(formData)
    console.log("onChange form data below")
    console.log(formData)
    console.log("onChange error below")
    console.log(errors)
    props.setConfigErrors(errors)
  }
  return (
    <div>
      { data && (
        <Card
          className={styles.gapBetweenCards}
        >
          <JsonSchemaForm
            disabled={readonly}
            jsonSchema={data.jsonSchema}
            uiSchema={data.uiSchema}
            formData={props.config}
            onChange={onChange}
            liveValidate
            showErrorList={false}
          />
        </Card>
      )
    }
    </div>
  )
};
