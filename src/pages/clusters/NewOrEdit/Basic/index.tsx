import {Card, Form, Input, Select} from 'antd';
import type {Rule} from 'rc-field-form/lib/interface';
import styles from '../index.less';
import {useIntl} from "@@/plugin-locale/localeExports";
import {useRequest} from "@@/plugin-request/request";
import {queryEnvironments} from "@/services/environments/environments";
import {listGitRef, GitRefType, gitRefTypeList} from "@/services/code/code";
import {queryReleases} from "@/services/templates/templates";
import HForm from '@/components/HForm'
import type {FieldData} from 'rc-field-form/lib/interface'
import {history} from "@@/core/history";
import {queryRegions} from "@/services/applications/applications";
import {useModel} from "@@/plugin-model/useModel";
import {useState} from "react";

const {TextArea} = Input;
const {Option} = Select;

export default (props: any) => {
  const {readonly = false, editing = false} = props;
  const {query: q} = history.location;
  // @ts-ignore
  const {environment: envFromQuery} = q
  const {initialState} = useModel('@@initialState');
  const {id, parentID} = initialState!.resource;
  const intl = useIntl();

  const {data: releases} = useRequest(() => queryReleases(props.template?.name), {
    ready: !!props.template.name && !readonly
  });

  // query application's selectable regions when creating cluster
  const applicationID = editing ? parentID : id
  const {data: regions} = useRequest(() => queryRegions(applicationID, props.form.getFieldValue('environment')), {
    ready: !!props.form.getFieldValue('environment'),
    refreshDeps: [props.form.getFieldValue('environment')],
    onSuccess: () => {
      if (!editing && regions) {
        // put default region on top of the list
        regions.sort((a, b) => {
          return Number(b.isDefault) - Number(a.isDefault)
        })
        // put disabled regions on bottom of the list
        regions.sort((a, b) => {
          return Number(a.disabled) - Number(b.disabled)
        })
        if (!props.form.getFieldValue('region')) {
          regions.forEach(r => {
            if (r.isDefault && !r.disabled) {
              props.form.setFields([{
                name: ['region'], value: r.name, errors: []
              }])
            }
          });
        }
      }
    }
  });

  const {data: environments} = useRequest(() => queryEnvironments());

  const {data: gitRefList = [], run: refreshGitRefList} = useRequest((filter?: string) => {
    const giturl = props.form.getFieldValue('url')
    const refType = props.form.getFieldValue('refType')
    return listGitRef({
      refType,
      giturl,
      filter,
      pageNumber: 1,
      pageSize: 50,
    })
  }, {
    debounceInterval: 100,
    ready: !!props.form.getFieldValue('url') && !readonly,
  })

  const formatMessage = (suffix: string, defaultMsg?: string) => {
    return intl.formatMessage({id: `pages.clusterNew.basic.${suffix}`, defaultMessage: defaultMsg})
  }

  const nameRules: Rule[] = [
    {
      required: true,
      pattern: new RegExp('^(?=[a-z0-9])(([a-z0-9][-a-z0-9]*)?[a-z0-9])?$'),
      message: formatMessage('name.ruleMessage'),
      max: 64,
    },
  ];

  const urlRules: Rule[] = [
    {
      pattern: new RegExp('^ssh://.+[.]git$'),
      required: true,
      message: 'Invalid! A right example: ssh://git@g.hz.netease.com:22222/music-cloud-native/horizon/horizon.git',
      max: 128,
    },
  ];

  const requiredRule: Rule[] = [
    {
      required: true,
    },
  ];

  const formatReleaseOption = (item: API.Release) => {
    if (item.recommended) {
      return (
        <div>
          {item.name} <span style={{color: 'red'}}>(推荐)</span>
        </div>
      );
    }

    return item.name;
  };

  const name = editing ? <Input disabled/> :
    <Input addonBefore={`${props.applicationName}-`} placeholder={formatMessage('name.ruleMessage')}
           disabled={readonly}/>;


  return (
    <div>
      <HForm layout={'vertical'} form={props.form}
             onFieldsChange={(a: FieldData[], b: FieldData[]) => {
               props.setFormData(a, b)
             }}
             fields={props.formData}
      >
        <Card title={formatMessage('title')} className={styles.gapBetweenCards}>
          <Form.Item label={formatMessage('name')} name={'name'} rules={nameRules}>
            {name}
          </Form.Item>
          <Form.Item label={formatMessage('description')} name={'description'}>
            <TextArea placeholder={formatMessage('description.ruleMessage')} maxLength={255} disabled={readonly}
                      autoSize={{minRows: 3}}/>
          </Form.Item>
          <Form.Item label={formatMessage('template', '模版')}>
            <Input disabled={true} value={props.template?.name}/>
          </Form.Item>
          <Form.Item label={formatMessage('release', '模版版本')} name={'release'}>
            <Select disabled={readonly}>
              {releases?.map((item) => {
                return (
                  <Option key={item.name} value={item.name}>
                    {formatReleaseOption(item)}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
          <Form.Item label={formatMessage('environment')} name={'environment'} rules={requiredRule}>
            <Select disabled={!!envFromQuery || readonly || editing}>
              {environments?.map((item) => {
                return <Option key={item.name} value={item.name}>
                  {item.displayName}
                </Option>
              })}
            </Select>
          </Form.Item>
          <Form.Item label={formatMessage('region')} name={'region'} rules={requiredRule}>
            <Select disabled={readonly || editing}>
              {regions?.map((item) => {
                const defaultText = item.isDefault ? `${item.displayName} (default)` : item.displayName
                const text = item.disabled ? `${defaultText} (disabled)` : defaultText
                return <Option key={item.name} value={item.name} disabled={item.disabled}>
                  {text}
                </Option>
              })}
            </Select>
          </Form.Item>
        </Card>

        <Card title={formatMessage('repo')} className={styles.gapBetweenCards}>
          <Form.Item label={formatMessage('url')} name={'url'} rules={urlRules}>
            <Input disabled={readonly}/>
          </Form.Item>
          <Form.Item label={formatMessage('subfolder')} name={'subfolder'}>
            <Input disabled={readonly}/>
          </Form.Item>
          <Form.Item
            label={"版本"}
            name={'ref'}
            rules={[{required: true, message: "git ref required"}]}
          >
            <Form.Item
              name={"refType"}
              rules={[{required: true, message: "git ref is required"}]}
              style={{display: 'inline-block', width: '100px'}}
            >
              <Select disabled={readonly} defaultValue={gitRefTypeList[0]}
                      onSelect={(key: any) => {
                        // props.form.setFieldsValue({"refValue": ""})
                        if (key != GitRefType.Commit) {
                          refreshGitRefList();
                        }
                      }}
              >
                {
                  gitRefTypeList.map((item) => {
                    return <Option key={item.key} value={item.key}>{item.displayName}</Option>
                  })
                }
              </Select>
            </Form.Item>
            <Form.Item
              name={"refValue"}
              rules={[{required: true, message: "git ref is required"}]}
              style={{display: 'inline-block', width: 'calc(100% - 100px)'}}
            >
              {
                props.form.getFieldValue('refType') == GitRefType.Commit ?
                  <Input/> : <Select disabled={readonly} showSearch
                                     onSearch={(item) => {
                                       refreshGitRefList(item);
                                     }}>
                    {
                      gitRefList.map((item: string) => {
                        return <Option key={item} value={item}>{item}</Option>
                      })
                    }
                  </Select>
              }
            </Form.Item>
          </Form.Item>
        </Card>
      </HForm>
    </div>
  );
};
