import {Button, Modal, Table} from "antd";
import {useParams} from "umi";
import type {ColumnsType} from 'antd/lib/table';
import {CopyOutlined, ExclamationCircleOutlined} from "@ant-design/icons";
import {createSecret, deleteSecret, listSecret} from "@/services/oauthapp/oauthapp";
import {useModel} from "@@/plugin-model/useModel";
import {useRequest} from "@@/plugin-request/request";
import {useState} from "react";
import copy from "copy-to-clipboard";
import RBAC from "@/rbac";

export default () => {
  const params = useParams<{ id: string }>();
  const {successAlert} = useModel('alert')


  const {data: cdata, run: runListSerect} = useRequest(() => listSecret(params.id));

  const columns: ColumnsType<API.OauthClientSecretInfo> = [
    {
      title: 'clientSecret',
      dataIndex: 'clientSecret',
      key: 'clientSecret',
    }, {
      title: 'createdBy',
      dataIndex: 'createdBy',
      key: 'createdBy',
    }, {
      title: 'createdAt',
      dataIndex: 'createdAt',
      key: 'createdAt',
    }
    ,
    {
      render: (text, row) => {
        function onDelete() {
          console.log(row)
          deleteSecret(params.id, row.id).then(() => {
            runListSerect()
          });
        }

        return <Button
          disabled={!RBAC.Permissions.deleteOauthClientSecret.allowed}
          style={RBAC.Permissions.deleteOauthClientSecret.allowed ? {backgroundColor: '#dd2b0e', color: 'white'} : {}}
          onClick={() => {
            Modal.confirm({
              title: 'Revoke',
              content: "This action cannot be undone. This client secret will stop working immediately. Are you sure you want to delete this client secret?",
              icon: <ExclamationCircleOutlined/>,
              okText: <div>OK</div>,
              cancelText: <div>Cancel</div>,
              onOk: onDelete,
            });
          }}>
          Revoke
        </Button>
      }
    }
  ]


  const [created, setCreated] = useState(false)
  const [secret, setSecret] = useState("")

  function onGenerate() {
    createSecret(params.id).then(({data}: { data: API.OauthClientSecretInfo }) => {
      setCreated(true)
      setSecret(data.clientSecret)
      runListSerect()
    })
  }


  const onCopyClick = (text: string) => {
    copy(text)
    successAlert("复制成功")
  }

  return (
    <div>
      <h2>ClientID</h2>
      <div><code>{params.id}</code>
      </div>
      <div style={{marginTop: 30}}
      >
        <h2>ClientSecrets</h2>
        <Table columns={columns} dataSource={cdata}/>
        <div hidden={!created}>
          <h3
            style={{
              backgroundColor: 'rgba(108,198,68,.1',
              height: 50,
              textAlign: 'center',
              lineHeight: '50px',
              overflow: "hidden"
            }}>
            Make sure to copy your new client secret now. You won’t be able to see it again.
          </h3>
          <h2
            style={{backgroundColor: 'rgba(84,174,255,0.4)', textAlign: 'center'}}
          >{secret}
            <Button
              style={{backgroundColor: "transparent"}}
              onClick={() => onCopyClick(secret)}
            >
              <CopyOutlined/>
            </Button>
          </h2>

        </div>
        <div style={{textAlign: "center"}}>
          <Button
            disabled={!RBAC.Permissions.createOauthClientSecret.allowed}
            onClick={onGenerate}
            type="primary">Generate a new client secret</Button>
        </div>
      </div>

    </div>
  );
}

