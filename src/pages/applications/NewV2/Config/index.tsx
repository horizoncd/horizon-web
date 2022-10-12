import {useIntl, useRequest} from 'umi';
import {Card, Form, Select} from 'antd';
import {forwardRef, useImperativeHandle, useRef,} from 'react';
import {queryReleases, querySchema} from '@/services/templates/templates';
import JsonSchemaForm from '@/components/JsonSchemaForm';
import styles from '../index.less';
import {Rule} from "rc-field-form/lib/interface";
import {Option} from "antd/es/mentions";


export default forwardRef((props: any, ref) => {
  const intl = useIntl();
  const {readonly = false} = props;
  const formRef = useRef();

  useImperativeHandle(ref, ()=>{
    return {
      submit: ()=>{
        formRef.current!.submit();
      }
    }
  })

  // query schema by template and release
  const {data} = useRequest(
    () => querySchema(props.template.name, props.release),
    {
      onSuccess: () => {
      },
      refreshDeps: [props.release],
      ready: !!props.release
    },
  );

  const templateVersionSelect = () => {
    console.log(props.template?.name)
    const requiredRule: Rule[] = [
      {
        required: true,
      },
    ];
    const formatReleaseOption = (item: Templates.Release) => {
      if (item.recommended) {
        return (
          <div>
            {item.name}
            {' '}
            <span style={{color: 'red'}}>(推荐)</span>
          </div>
        );
      }
      return item.name;
    }
    const labelName = intl.formatMessage({id: 'pages.applicationNew.basic.release'})
    const {data: releases} = useRequest<{ data: Templates.Release[] }>(() => {
      return queryReleases(props.template?.name)
    });

    const onReleaseChange = (releaseName: string) => {
      console.log("releaseName = %s", releaseName)
      props.setReleaseName(releaseName)
    }
    return (
      <div>
        <Form.Item
          label={labelName}
          name="release"
          rules={requiredRule}>
          <Select
            defaultValue={props.release}
            onChange={onReleaseChange}
            disabled={readonly}>
            {
              releases?.map((release) => {
                return <Option
                  key={release.name}
                  value={release.name}>
                  {formatReleaseOption(release)}
                </Option>
              })
            }
          </Select>
        </Form.Item>
      </div>
    )
  }

  const onChange = ({formData, errors}: any) => {
    props.setConfig(formData)
    props.setConfigErrors(errors)
  }

  const onSubmit = (schema: any) =>{
    props.onSubmit(schema)
  }

  const getJsonSchema =()=>{
    const appKey = "application"
    if (data && data[appKey]) {
      const {jsonSchema, uiSchema} = data[appKey];
      return (
        <div>
          <Card
            className={styles.gapBetweenCards}
            title={intl.formatMessage({id: 'pages.applicationNew.config.template'})}
          >
            <JsonSchemaForm
              ref = {formRef}
              disabled={readonly}
              jsonSchema={jsonSchema}
              uiSchema={uiSchema}
              formData={props.config}
              liveValidate
              showErrorList={false}
              onChange={onChange}
              onSubmit={onSubmit}
            />
          </Card>
        </div>
      )
    } else {
      return <div/>
    }
  }
  return (
    <div>
      <div>{templateVersionSelect()}</div>
      <div>{getJsonSchema()}</div>
    </div>
  );
});
