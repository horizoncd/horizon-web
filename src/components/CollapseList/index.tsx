import {useState} from "react";
import {Tag} from "antd";
import styles from "./index.less"

export default (props: { data: Record<string, string>, defaultCount: number }) => {
  const items = []
  const ks = Object.keys(props.data)
  const [showAll, setShowAll] = useState(false)
  for (const k in props.data) {
    let annotationStyle = styles.annotation
    // 列表最后一个无需margin bottom
    if (k == ks[ks.length - 1]) {
      annotationStyle = styles.annotationWithoutMargin
    }
    items.push(
      <Tag id={annotationStyle}>
        {k}: {props.data[k]}
      </Tag>
    )
    // 折叠状态下，只显示前两个
    if (!showAll && items.length >= 2) {
      break
    }
  }
  return <div>
    {items}
    {
    !showAll && items.length >= props.defaultCount && <a
      style={{padding: '0'}}
      onClick={() => {
        setShowAll(true)
      }}
    >
      显示所有
    </a>
  }
    {
      showAll && items.length >= props.defaultCount && <a
        style={{padding: '0'}}
        onClick={() => {
          setShowAll(false)
        }}
      >
        收起
      </a>
    }
  </div>
}
