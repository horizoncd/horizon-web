import { Button, Col, Row } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import {
  history, useModel, useRequest,
} from 'umi';
import { ValidateErrorEntity } from 'rc-field-form/lib/interface';
import PageWithBreadcrumb from '@/components/PageWithBreadcrumb';
import IDPForm from '../Components/IDPForm';
import { getIDPByID, updateIDP } from '@/services/idps';
import { API } from '@/services/typings';
import PageWithID from '@/components/PageEnhancement/PageWithID/PageWithID';
import CenterSpin from '@/components/Widget/CenterSpin';

function EditIDP(props: { id: number }) {
  const { id } = props;
  const [form] = useForm();
  const { successAlert, errorAlert } = useModel('alert');
  const { loading } = useRequest(() => getIDPByID(id), {
    onSuccess: (item) => {
      form.setFieldsValue(item);
    },
  });

  if (loading) {
    return <CenterSpin />;
  }

  const submit = (values: any) => {
    updateIDP(id, values as API.CreateIDPParam)
      .then(() => {
        successAlert('IDP 创建成功');
        history.push('/admin/idps');
      });
  };

  const onFinishFailed = (err: ValidateErrorEntity) => {
    if (!err.outOfDate && err.errorFields.length > 0) {
      const item = err.errorFields[0];
      errorAlert(`${item.name}: ${item.errors.join(' ')}`);
    }
  };

  return (
    <PageWithBreadcrumb>
      <Row>
        <Col span={12} offset={6}>
          <IDPForm form={form} onFinish={submit} onFinishFailed={onFinishFailed} />
          <Button type="primary" onClick={form.submit}>Submit</Button>
        </Col>
      </Row>
    </PageWithBreadcrumb>
  );
}

export default PageWithID(EditIDP);
