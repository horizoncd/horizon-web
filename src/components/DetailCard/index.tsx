// 一个用于展示多列数据的卡片
import {Card} from "antd";
import styles from './index.less'
import * as React from "react";


interface Props {
  // 标题
  title: React.ReactNode;
  // 数据[列][行]
  data: Param[][];
}

export type Param = {
  key: string,
  value: string | string[] | Record<string, string>;
}

export default (props: Props) => {
  const {title, data} = props;
  const contents: any = []
  let col = 0
  const columnSeparator = <div className={styles.separator}/>
  data.forEach((params, index) => {
      const columnContent = <div className={styles.data} key={col++}>
        {index !== 0 ? columnSeparator : null}
        <div className={styles.dataColumn}>
          {params.map((param) => {
            return <div key={param.key} className={styles.dataColumnItem}>
              <div className={styles.textKey}>{param.key}</div>
              <div>{param.value}</div>
            </div>
          })}
        </div>
      </div>
      contents.push(columnContent)
    }
  );

  return (
    <div className={styles.card}>
      <Card title={title} type={"inner"}>
        <div className={styles.cardBody}>
          {contents}
        </div>
      </Card>
    </div>
  );
};
