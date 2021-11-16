import {Col, Row} from 'antd'

export default (props: {title: string, desc: string}) => {
  const {title, desc} = props
  return <Row style={{textAlign: 'center'}}>
    <Col offset={3} span={18}>
      <div style={{fontSize: '16px', color: 'black'}}>
        {title}
      </div>
      <div style={{fontSize: '14px', color: 'grey'}}>
        {desc}
      </div>
      <Row>
        <Col offset={3} span={18}>
          <img src={'/h.svg'} alt={'horizon'} style={{height: '400px'}}/>
        </Col>
      </Row>
    </Col>
  </Row>
}
