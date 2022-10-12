import {useIntl, useRequest} from 'umi';
import {Card, Form, Select} from 'antd';
import {forwardRef, useEffect, useImperativeHandle, useRef, useState,} from 'react';
import {queryReleases, querySchema} from '@/services/templates/templates';
import JsonSchemaForm from '@/components/JsonSchemaForm';
import styles from '../index.less';
import {Rule} from "rc-field-form/lib/interface";
import {Option} from "antd/es/mentions";
import {applicationVersion2} from "@/services/applications/applications";


export default forwardRef((props: any, ref) => {
  const intl = useIntl();

  const {readonly = false} = props;
  const formRefs = useRef([]);

  // query schema by template and release
  const {data} = useRequest(
    () => querySchema(props.template.name, props.release),
    {
      onSuccess: () => {
        formRefs.current = formRefs.current.slice(0, Object.keys(data).length);
      },
      refreshDeps: [props.release],
      ready: !!props.release
    },
  );

  useImperativeHandle(
    ref,
    () => ({
      submit: () => {
        // 触发整个rjsf表单组的提交事件
        formRefs.current.forEach((formRef) => {
          formRef.submit();
        });
      },
    }),
  );

  const [totalFormData, setTotalFormData] = useState({});

  // 所有表单提交完成后，才会调用最终的onSubmit
  useEffect(() => {
    if (data != undefined && (Object.keys(totalFormData).length
      >= Object.keys(data).length)) {
      props.onSubmit(totalFormData);
    }
  }, [totalFormData]);

  const requiredRule: Rule[] = [
    {
      required: true,
    },
  ];


  const templateVersionSelect = () => {
    console.log(props.template?.name)
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
  const titlePrefix = 'pages.applicationNew.config';
  return (
    <div>
      {props.version === applicationVersion2 && !readonly && (<div>{templateVersionSelect()}</div>)}
      <div>
        {data
          && Object.keys(data).map((item, i) => {
            const currentFormData = props.config[item] || {};

            console.log("config props config below----")
            console.log(props.config[item])
            console.log(props.config)

            const onChange = ({formData, errors}: any) => {
              if (readonly) {
                return;
              }

              props.setConfig((config: any) => ({...config, [item]: formData}));
              props.setConfigErrors((configErrors: any) => ({...configErrors, [item]: errors}));
            };

            const {jsonSchema, uiSchema} = data[item];

            return (
              <Card
                className={styles.gapBetweenCards}
                key={item}
                title={intl.formatMessage({id: `${titlePrefix}.${item}`})}
              >
                <JsonSchemaForm
                  ref={(dom) => {
                    formRefs.current[i] = dom;
                  }}
                  disabled={readonly}
                  formData={currentFormData}
                  jsonSchema={jsonSchema}
                  onChange={onChange}
                  onSubmit={(schema: any) => {
                    setTotalFormData((fdts) => ({...fdts, [item]: schema.formData}));
                  }}
                  uiSchema={uiSchema}
                  liveValidate
                  showErrorList={false}
                />
              </Card>
            );
          })}
      </div>
    </div>
  );
});
