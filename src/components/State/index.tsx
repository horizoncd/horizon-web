import {CheckCircleOutlined, CloseCircleOutlined, HourglassOutlined, LoadingOutlined, QuestionOutlined} from "@ant-design/icons";
import './index.less'

interface StatusProps {
  text?: string
  link?: string
}

const Succeeded = (props: StatusProps) => {
  const {text, link} = props;
  const txt = <span className="ci-status ci-success"><CheckCircleOutlined /> {text || 'Succeeded'}</span>
    return <div>
      {
        link ? <a href={link} className="ci-status ci-success">{txt}</a> : txt
      }
  </div>
}

const Failed = (props: StatusProps) => {
  const {text, link} = props;
  const txt = <span className="ci-status ci-failed"><CloseCircleOutlined /> {text || 'Failed'}</span>
  return <div>
    {
      link ? <a href={link} className="ci-status ci-failed">{txt}</a> : txt
    }
  </div>
}

const Progressing = (props: StatusProps) => {
  const {text, link} = props;
  const txt = <span className="ci-status ci-progressing"><LoadingOutlined/> {text || 'Progressing'}</span>
  return <div>
    {
      link ? <a href={link} className="ci-status ci-progressing">{txt}</a> : txt
    }
  </div>
}

const Suspended = (props: StatusProps) => {
  const {text, link} = props;
  const txt = <span className="ci-status ci-suspended"><HourglassOutlined/> {text || 'Suspended'}</span>
  return <div>
    {
      link ? <a href={link} className="ci-status ci-suspended">{txt}</a> : txt
    }
  </div>
}

const NotFount = (props: StatusProps) => {
  const {text, link} = props;
  const txt = <span className="ci-status ci-notfound"><QuestionOutlined /> {text || 'NotFound'}</span>
  return <div>
    {
      link ? <a href={link} className="ci-status ci-notfound">{txt}</a> : txt
    }
  </div>
}

export {
  Succeeded,
  Failed,
  Progressing,
  Suspended,
  NotFount
}
