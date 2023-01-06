import { useEffect, useRef, useState } from 'react';
import {
  Button, Card, Select,
} from 'antd';
import { useModel } from '@@/plugin-model/useModel';
import { useHistory, useIntl } from 'umi';
import { useRequest } from '@@/plugin-request/request';
import type { Param } from '@/components/DetailCard';
import {
  deleteApplication,
  getApplication,
  getApplicationEnvTemplate,
  updateApplicationEnvTemplate,
} from '@/services/applications/applications';
import { querySchema } from '@/services/templates/templates';
import Detail from '@/components/PageWithBreadcrumb';
import 'antd/lib/form/style';
import styles from '../index.less';
import Basic from '../Basic';
import utils from '@/utils';
import JsonSchemaForm from '@/components/JsonSchemaForm';
import { queryEnvironments } from '@/services/environments/environments';
import { parseGitRef } from '@/services/code/code';
import { API } from '@/services/typings';

const { Option } = Select;

export default () => {
  const intl = useIntl();
  const history = useHistory();
  const { initialState } = useModel('@@initialState');
  const { id, name: applicationName, fullPath: applicationFullPath } = initialState!.resource;
  const defaultApplication: API.Application = {
    fullPath: '',
    id: 0,
    groupID: 0,
    name: '',
    priority: 'P0',
    description: '',
    template: {
      name: '',
      release: '',
      recommendedRelease: '',
    },
    git: {
      url: '',
      subfolder: '',
      branch: '',
    },
    templateInput: undefined,
    createdAt: '',
    updatedAt: '',
  };
  const { successAlert } = useModel('alert');
  const [application, setApplication] = useState<API.Application>(defaultApplication);
  const [editing, setEditing] = useState(false);
  const [template, setTemplate] = useState({});
  const [templateInput, setTemplateInput] = useState({});
  const [templateInputError, setTemplateInputError] = useState({});
  const [currentEnv, setCurrentEnv] = useState('');

  const formRefs = useRef([]);
  const { run: refreshApplication } = useRequest(
    () => getApplication(id).then(({ data: result }) => {
      setApplication(result);
      setTemplateInput(result.templateInput);
      formRefs.current = formRefs.current.slice(0, Object.keys(result.templateInput).length);
      // query schema by template and release
      querySchema(result.template.name, result.template.release).then(({ data }) => {
        setTemplate(data);
      });
    }),
    {
      manual: true,
    },
  );

  useEffect(() => {
    refreshApplication();
  }, [refreshApplication]);
  const { gitRefType, gitRef } = parseGitRef(application.git);
  const serviceDetail: Param[][] = [
    [
      { key: intl.formatMessage({ id: 'pages.applicationNew.basic.name' }), value: application.name },
      { key: intl.formatMessage({ id: 'pages.applicationNew.basic.description' }), value: application.description || '' },
      { key: intl.formatMessage({ id: 'pages.applicationNew.basic.priority' }), value: application.priority },
    ],
    [
      {
        key: intl.formatMessage({ id: 'pages.applicationDetail.basic.release' }),
        value: `${application.template.name}-${application.template.release}`,
      },

      {
        key: intl.formatMessage({ id: 'pages.applicationNew.basic.recommendedRelease' }),
        value: `${application.template.name}-${application.template.recommendedRelease}`,
        hidden: application.template.release === application.template.recommendedRelease,
      },
      { key: intl.formatMessage({ id: 'pages.applicationNew.basic.url' }), value: application.git.url },
      {
        key: intl.formatMessage({ id: `pages.clusterDetail.basic.${gitRefType}` }),
        value: gitRef,
      },
      { key: intl.formatMessage({ id: 'pages.applicationNew.basic.subfolder' }), value: application.git.subfolder },
    ],
    [
      {
        key: intl.formatMessage({ id: 'pages.applicationDetail.basic.createTime' }),
        value: utils.timeToLocal(application.createdAt),
      },
      {
        key: intl.formatMessage({ id: 'pages.applicationDetail.basic.updateTime' }),
        value: utils.timeToLocal(application.updatedAt),
      },
    ],
  ];

  const { data: environments } = useRequest(() => queryEnvironments());

  const { run: delApplication } = useRequest(() => deleteApplication(id).then(() => {
    successAlert(intl.formatMessage({ id: 'pages.applicationDelete.success' }));
    window.location.href = applicationFullPath.substring(0, applicationFullPath.lastIndexOf('/'));
  }), { manual: true });

  const editApplicationRouteV1 = `/applications${applicationFullPath}/-/edit`;
  const templateInputHasError = () => {
    let hasError = false;
    Object.keys(templateInputError).forEach((item) => {
      if (templateInputError[item].length > 0) {
        hasError = true;
      }
    });

    return hasError;
  };

  const [totalFormData, setTotalFormData] = useState({});

  useEffect(() => {
    const cfgLength = Object.keys(templateInput).length;
    if (cfgLength > 0 && (Object.keys(totalFormData).length >= cfgLength)) {
      const updateData: API.AppSchemeConfigs = {
        application: totalFormData.application,
        pipeline: totalFormData.pipeline,
      };
      updateApplicationEnvTemplate(id, currentEnv, updateData).then(() => {
        successAlert(intl.formatMessage({ id: 'pages.message.template.update.success' }));
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalFormData]);

  const onEditClick = () => {
    history.push({
      pathname: editApplicationRouteV1,
    });
  };

  return (
    <Detail>
      <Basic
        id={id}
        name={applicationName}
        refreshApplication={refreshApplication}
        delApplication={delApplication}
        onEditClick={onEditClick}
        serviceDetail={serviceDetail}
      />
      <Card
        title={(
          <span className={styles.cardTitle}>{intl.formatMessage({ id: 'pages.applicationDetail.basic.config' })}</span>)}
        type="inner"
        extra={(
          <div>
            <Button
              type={editing ? 'primary' : 'default'}
              disabled={editing && templateInputHasError()}
              onClick={() => {
                if (editing) {
                  formRefs.current.forEach((formRef) => {
                    formRef.submit();
                  });
                }
                setEditing((prev) => !prev);
              }}
            >
              {editing ? intl.formatMessage({ id: 'pages.common.submit' }) : intl.formatMessage({ id: 'pages.common.edit' })}
            </Button>
            {
              editing && (
                <Button
                  style={{ marginLeft: '10px' }}
                  onClick={() => {
                    setEditing(false);
                    setTemplateInputError([]);
                    getApplicationEnvTemplate(id, currentEnv).then(({ data }) => {
                      setTemplateInput(data);
                    });
                  }}
                >
                  {intl.formatMessage({ id: 'pages.common.cancel' })}
                </Button>
              )
            }
            <Select
              style={{ minWidth: '100px', marginLeft: '10px' }}
              value={currentEnv}
              onSelect={(val: string) => {
                getApplicationEnvTemplate(id, val).then(({ data }) => {
                  setTemplateInput(data);
                });
                setCurrentEnv(val);
              }}
            >
              <Option key="default" value="">
                {intl.formatMessage({ id: 'pages.common.default' })}
              </Option>
              {environments?.map((item) => (
                <Option key={item.name} value={item.name}>
                  {item.displayName}
                </Option>
              ))}
            </Select>
          </div>
        )}
      >
        {
          template && Object.keys(template).map((item, i) => (
            <JsonSchemaForm
              key={item}
              ref={(dom) => {
                formRefs.current[i] = dom;
              }}
              disabled={!editing}
              uiSchema={template[item].uiSchema}
              formData={templateInput[item]}
              jsonSchema={template[item].jsonSchema}
              onChange={({ formData, errors }: any) => {
                setTemplateInput((config: any) => ({ ...config, [item]: formData }));
                setTemplateInputError((configErrors: any) => ({ ...configErrors, [item]: errors }));
              }}
              onSubmit={(schema: any) => {
                setTotalFormData((config: any) => ({ ...config, [item]: schema.formData }));
              }}
              liveValidate
              showErrorList={false}
            />
          ))
        }
      </Card>
    </Detail>
  );
};
