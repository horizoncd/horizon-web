import PageWithBreadcrumb from '@/components/PageWithBreadcrumb'
import type {Param} from '@/components/DetailCard'
import DetailCard from '@/components/DetailCard'
import CodeEditor from '@/components/CodeEditor'
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/mode/sql/sql'
import 'codemirror/addon/hint/show-hint.css'
import './index.less'
import 'codemirror/addon/display/fullscreen.css'
import 'codemirror/addon/display/fullscreen'
import {Button, Card, notification} from "antd";
import {CopyOutlined, FullscreenOutlined} from "@ant-design/icons";
import styles from './index.less'
import copy from "copy-to-clipboard";
import FullscreenModal from '@/components/FullscreenModal'
import {useState} from "react";


export default (props: any) => {
  console.log(props.match.params.id)
  const data: Param[][] = [
    [
      {
        key: '状态/Status',
        value: 'Running',
      },
      {
        key: '启动时间/Started',
        value: '2021-10-14T08:08:44+08:00',
      },
      {
        key: '持续时间/Duration',
        value: '3min',
      },
    ],
    [
      {
        key: '触发者/Trigger',
        value: 'shepenghui',
      },
      {
        key: 'Git info',
        value: {
          'commit id': 'f3d91920',
          'message': 'add api for application member',
        }
      }
    ]
  ]

  const cardTab = [
    {
      key: "日志",
      tab: "日志"
    },
    {
      key: "变更内容",
      tab: "变更内容"
    }
  ]

  const buildLog = 'Build Server: hzajd-music-ndp-build1.v1.music.jd1.vpc, ip = 10.199.4.135, port = 8181\n' +
    '[2021-10-01 00:40:33] [git] start to download source code\n' +
    '[2021-10-01 00:40:33] [git] fetch source code\n' +
    '[2021-10-01 00:40:33] Git: start to clone code from ssh://git@g.hz.netease.com:22222/music-cloud-native/middle-gift-account.git\n' +
    '[2021-10-01 00:40:33] [git] successfully cloned code\n' +
    '[2021-10-01 00:40:33] [git] start to checkout to branch master\n' +
    '[2021-10-01 00:40:33] [git] checkout to the version: 3aa1944369918ba8a695dc600bbf400e6dc4bd7a\n' +
    '[2021-10-01 00:40:33] [git] successfully downloaded source code\n' +
    'repo: The project module generate build xml success.\n' +
    '[2021-10-01 00:40:33 taskId:5109044] use default build.xml...\n' +
    'exec ant build command... taskId =5109044\n' +
    'Buildfile: /home/appops/ndp/source/yufeng-cicd-demo_regression/build.xml\n' +
    'deploy:\n' +
    '     [echo] begin auto deploy......\n' +
    'clean:\n' +
    'parentInstall:\n' +
    '     [exec] [INFO] Scanning for projects...\n' +
    '     [exec] Downloading from hz_repo: http://mvn.hz.netease.com/artifactory/repo/com/netease/music/music-server-parent/2.5.7.32/music-server-parent-2.5.7.32.pom\n' +
    '[exec] Progress (1): 3.7/5.9 kB\n' +
    '     [exec] Progress (1): 5.9 kB                        Downloaded from hz_repo: http://mvn.hz.netease.com/artifactory/repo/com/netease/music/music-server-parent/2.5.7.32/music-server-parent-2.5.7.32.pom (5.9 kB at 60 kB/s)[WARNING] \n' +
    '     [exec] [WARNING] Some problems were encountered while building the effective model for com.netease.music:middle-gift-account-manager:jar:1.0.0\n' +
    '     [exec] [WARNING] \'build.plugins.plugin.version\' for org.apache.maven.plugins:maven-compiler-plugin is missing. @ com.netease.music:music-server-parent:2.5.7.32, /home/appops/.m2/repository/com/netease/music/music-server-parent/2.5.7.32/music-server-parent-2.5.7.32.pom, line 112, column 21\n' +
    '     [exec] [WARNING] \n' +
    '     [exec] [WARNING] Some problems were encountered while building the effective model for com.netease.music:middle-gift-account-api:jar:1.0.5\n' +
    '     [exec] [WARNING] \'parent.relativePath\' of POM com.netease.music:middle-gift-account-api:1.0.5 (/data/ndp/source/yufeng-cicd-demo_regression/api/pom.xml) points at com.netease.music:middle-gift-account instead of com.netease.music:music-server-parent-api, please verify your project structure @ line 5, column 13\n' +
    '     [exec] [WARNING] \'build.plugins.plugin.version\' for org.apache.maven.plugins:maven-compiler-plugin is missing. @ com.netease.music:music-server-parent-api:2.5.4.1, /home/appops/.m2/repository/com/netease/music/music-server-parent-api/2.5.4.1/music-server-parent-api-2.5.4.1.pom, line 25, column 21\n' +
    '     [exec] [WARNING] \n' +
    '     [exec] [WARNING] Some problems were encountered while building the effective model for com.netease.music:middle-gift-account-service:jar:1.0.0'

  const deployLog = '2021-10-08 16:10:59 [NDP_CLIENT_BEGIN]\n' +
    '2021-10-08 16:10:59 ndpclient / v2.7.0 (2021-07-13)\n' +
    '2021-10-08 16:10:59 set env: NDP_DEPLOY_BATCH=1 NDP_CLUSTER_PROFILE=reg NDP_INSTANCE_TEMPLATE=97 NDP_DEPLOY_PATH=/home/appops/yufeng-cicd-demo/yufeng-cicd-demo_regression/default/ NDP_CLUSTER_NAME=yufeng-cicd-demo_regression NDP_INSTANCE_VERSION=yufeng-cicd-demo_regression_2021-10-01_00_40_33-master-3aa1944369918ba8a695dc600bbf400e6dc4bd7a NDP_DEPLOY_VERSION=yufeng-cicd-demo_regression_2021-10-01_00_40_33-master-3aa1944369918ba8a695dc600bbf400e6dc4bd7a NDP_APPLICATION_NAME=yufeng-cicd-demo NDP_INSTANCE_NAME=default NDP_HOST_SN=7024418 NDP_DEPLOY_BATCH_COUNT=1 NDP_DEPLOY_TEMPLATE=97 \n' +
    '2021-10-08 16:10:59 do deploy...\n' +
    '2021-10-08 16:10:59 lock deploy...\n' +
    '2021-10-08 16:11:15 deploy yufeng-cicd-demo_regression begin...\n' +
    '2021-10-08 16:11:15 download http://nos2-i.service.163.org/ndp/t.ctrl.py.62f98b3ee163f5a9383dc7549752eaaa begin...\n' +
    '2021-10-08 16:11:15 size: 21.45 KB\n' +
    '2021-10-08 16:11:15 get: 21.45 KB, left: 0 B (100.00%)\n' +
    '2021-10-08 16:11:15 download ok\n' +
    '2021-10-08 16:11:15 download http://nos2-i.service.163.org/ndp/a.yufeng-cicd-demo_regression_2021-10-01_00_40_33.tar.gz begin...\n' +
    '2021-10-08 16:11:16 size: 101.70 MB\n' +
    '2021-10-08 16:11:17 get: 9.24 MB, left: 92.46 MB (9.09%)\n' +
    '2021-10-08 16:11:18 get: 24.52 MB, left: 77.18 MB (24.11%)\n' +
    '2021-10-08 16:11:19 get: 35.81 MB, left: 65.90 MB (35.21%)\n' +
    '2021-10-08 16:11:20 get: 50.17 MB, left: 51.53 MB (49.33%)\n' +
    '2021-10-08 16:11:21 get: 63.41 MB, left: 38.29 MB (62.35%)\n' +
    '2021-10-08 16:11:22 get: 75.94 MB, left: 25.76 MB (74.67%)\n' +
    '2021-10-08 16:11:23 get: 82.89 MB, left: 18.81 MB (81.50%)\n' +
    '2021-10-08 16:11:24 get: 95.27 MB, left: 6.43 MB (93.68%)\n' +
    '2021-10-08 16:11:25 get: 101.70 MB, left: 0 B (100.00%)\n' +
    '2021-10-08 16:11:25 download ok\n' +
    '2021-10-08 16:11:25 extract file a.yufeng-cicd-demo_regression_2021-10-01_00_40_33.tar.gz begin...\n' +
    '2021-10-08 16:11:26 extract file ok\n' +
    '2021-10-08 16:11:26 unlock deploy\n' +
    '2021-10-08 16:11:26,630 - 102 - INFO : Current ctrl.py version:1\n' +
    '2021-10-08 16:11:26,631 - 439 - INFO : do offline\n' +
    '2021-10-08 16:11:31,641 - 445 - INFO : ----offline sucess\n' +
    'do stop\n' +
    '200000\n' +
    'stopping app server.\n' +
    'stop success.\n' +
    '2021-10-08 16:11:43,692 - 451 - INFO : ----stop success\n' +
    'do deploy\n' +
    '2021-10-08 16:11:44,621 - 455 - INFO : ----deploy sucess\n' +
    'do start\n' +
    '200000\n' +
    'starting app server.\n' +
    'process start success.\n' +
    '2021-10-08 16:11:49,198 - 459 - INFO : ----start sucess\n' +
    'do check\n' +
    '2021-10-08 16:11:59,206 - 463 - INFO : ----check sucess\n' +
    'do online\n' +
    '2021-10-08 16:11:59,207 - 416 - ERROR : online failed ：<urlopen error [Errno 111] Connection refused>\n' +
    '2021-10-08 16:12:19,226 - 416 - ERROR : online failed ：<urlopen error [Errno 111] Connection refused>\n' +
    '2021-10-08 16:12:39,246 - 416 - ERROR : online failed ：<urlopen error [Errno 111] Connection refused>\n' +
    '2021-10-08 16:13:20,006 - 467 - INFO : ----online sucess\n' +
    '1\n' +
    '2021-10-08 16:13:20 lock deploy...\n' +
    '2021-10-08 16:13:20 delete biz packages...\n' +
    'remove file: a.yufeng-cicd-demo_regression_2021-10-01_00_40_33.tar.gz\n' +
    'remove dir: yufeng-cicd-demo_regression/yufeng-cicd-demo_regression_2021-10-01_00_40_33\n' +
    '2021-10-08 16:13:20 unlock deploy\n' +
    '2021-10-08 16:13:20 [NDP_CLIENT_END]'
  const [fullscreen, setFullscreen] = useState(false)
  const onFullscreenClick = () => {
    setFullscreen(true)
  }

  const onCopyClick = () => {
    if (copy(props.content)) {
      notification.success({message: "复制成功"})
    } else {
      notification.success({message: "复制失败"})
    }
  }

  const onClose = () => {
    setFullscreen(false)
  }

  return <PageWithBreadcrumb>
    <DetailCard
      title={<span>基础信息</span>}
      data={data}
    />
    <Card
      tabList={cardTab}
      bodyStyle={{height: '500px'}}
      tabBarExtraContent={(
        <div>
          <Button className={styles.buttonClass}>
            <CopyOutlined className={styles.iconCommonModal} onClick={onCopyClick}/>
          </Button>
          <Button className={styles.buttonClass}>
            <FullscreenOutlined className={styles.iconCommonModal} onClick={onFullscreenClick}/>
          </Button>
        </div>
      )}
    >
      <CodeEditor
        content={buildLog + deployLog}
      />
    </Card>
    <FullscreenModal
      title={'应用sph-test的流水线1日志'}
      visible={fullscreen}
      onClose={onClose}
      fullscreen={true}
      allowToggle={false}
    >
      <CodeEditor
        content={buildLog + deployLog}
      />
    </FullscreenModal>
  </PageWithBreadcrumb>
}

