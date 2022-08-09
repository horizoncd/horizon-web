import {Card, Form, Input, Select} from 'antd';
import type {FieldData, Rule} from 'rc-field-form/lib/interface';
import {useRequest} from 'umi';
import {queryReleases} from '@/services/templates/templates';
import styles from '../index.less';
import {useIntl} from "@@/plugin-locale/localeExports";
import {listGitRef, GitRefType} from '@/services/code/code'
import HForm from '@/components/HForm'
import {useEffect, useState} from "react";

const {TextArea} = Input;
const {Option} = Select;

export default (props: any) => {
  const intl = useIntl();

  // query release version
  const {data: releases} = useRequest(() => queryReleases(props.template?.name));
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

  useEffect(() => {
    if (props.editing) {
      refreshGitRefList(props.form.getFieldValue('url'), '')
    }
  }, [props.editing, props.form, refreshGitRefList])

  const formatMessage = (suffix: string, defaultMsg?: string) => {
    return intl.formatMessage({id: `pages.applicationNew.basic.${suffix}`, defaultMessage: defaultMsg})
  }

  const nameRules: Rule[] = [
    {
      required: true,
      pattern: new RegExp('^(?=[a-z])(([a-z][-a-z0-9]*)?[a-z0-9])?$'),
      message: formatMessage('name.ruleMessage'),
      max: 64,
    },
  ];

  const gitURLRegExp = new RegExp('^ssh://.+[.]git$')
  const gitURLRules: Rule[] = [
    {
      pattern: gitURLRegExp,
      required: true,
      message: 'Invalid! A right example: ssh://git@g.hz.netease.com:22222/music-cloud-native/horizon/horizon.git',
      max: 128,
    },
  ];

  const gitRevisionRules: Rule[] = [
    {
      max: 128,
    },
  ];

  const requiredRule: Rule[] = [
    {
      required: true,
    },
  ];

  const priorities = ['P0', 'P1', 'P2', 'P3'];

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

  const {readonly = false, editing = false} = props;

  const gitRefTypeList = [
    {
      displayName: "分支",
      key: "branch",
    },
    {
      displayName: "Tag",
      key: "tag",
    },
    {
      displayName: "Commit",
      key: "commit",
    },
  ]

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
            <Input placeholder={formatMessage('name.ruleMessage')} disabled={readonly || editing}/>
          </Form.Item>
          <Form.Item label={formatMessage('description')} name={'description'}>
            <TextArea placeholder={readonly ? '' : formatMessage('description.ruleMessage')} maxLength={255}
                      disabled={readonly} autoSize={{minRows: 3}}/>
          </Form.Item>
          <Form.Item label={formatMessage('template', 'template')}>
            <Input disabled={true} value={props.template?.name}/>
          </Form.Item>
          <Form.Item label={formatMessage('release')} name={'release'} rules={requiredRule}>
            <Select disabled={readonly}>
              {releases?.map((item: { name: any; description?: string; recommended?: boolean; }) => {
                return (
                  <Option key={item.name} value={item.name}>
                    {formatReleaseOption(item)}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
          <Form.Item label={formatMessage('priority')} name={'priority'} rules={requiredRule}>
            <Select disabled={readonly}>
              {priorities.map((item) => {
                return (
                  <Option key={item} value={item}>
                    {item}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
        </Card>

        <Card title={formatMessage('repo')} className={styles.gapBetweenCards}>
          <Form.Item label={formatMessage('url')} name={'url'} rules={gitURLRules}>
            <Input
              placeholder="ssh://git@g.hz.netease.com:22222/music-cloud-native/horizon/horizon.git"
              disabled={readonly}
            />
          </Form.Item>
          <Form.Item
            label={"版本"} name={'refType'} rules={gitRevisionRules}>
            <Form.Item
              name={"refType"}
              style={{display: 'inline-block', width: '100px'}}
            >
              <Select disabled={readonly} defaultValue={gitRefTypeList[0]}
                      onSelect={(key: any) => {
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
          <Form.Item label={formatMessage('subfolder')} name={'subfolder'}>
            <Input disabled={readonly} placeholder={readonly ? '' : '非必填，默认为项目根目录'}/>
          </Form.Item>
        </Card>
      </HForm>
    </div>
  );
};
