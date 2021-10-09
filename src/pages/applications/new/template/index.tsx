import { Card, Col, Row, Radio } from "antd";
import { useRequest } from 'umi';
import { queryTemplates } from "@/services/templates/templates";
import './index.less'

export default (props: any) => {
  const { data } = useRequest(queryTemplates)

  const isClicked = (item: API.Template) => {
    return item.name === props.template?.name
  }

  return (
    <Row gutter={ [30, 30] }>
      {
        data?.map((item: API.Template) => {
          return <Col key={item.name} span={ 8 }>
            <Card
              hoverable
              onClick={ () => props.resetTemplate(item) }
                  className={`card ${isClicked(item) ? 'card-after-clicked' : 'card-before-clicked'}`}
            >
              <div className='awsui-cards-card-header'>
                <span className="awsui-cards-card-header-inner">
                  {item.name}
                </span>
                <span  className="radio" >
                  <Radio checked={isClicked(item)}/>
                </span>
              </div>
              <h4>{item.description}</h4>
            </Card>
          </Col>
        })
      }
    </Row>
  )
}
