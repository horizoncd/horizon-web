const devControl = 'devControl';
const devCompute1 = 'devCompute1';
const testControl = 'testControl';
const testCompute1 = 'testCompute1';
const testEks = 'testEks';
const onlineControl = 'onlineControl';
const onlineyq1 = 'onlineyq1';
const onlinedg1 = 'onlinedg1';
const onlineEks = 'onlineEks';

const env = new Map();
env.set(devControl, '开发管控');
env.set(devCompute1, '开发计算');
env.set(testControl, '测试管控');
env.set(testCompute1, '测试计算');
env.set(testEks, '测试海外');
env.set(onlineControl, '线上管控');
env.set(onlineyq1, '线上义桥');
env.set(onlinedg1, '线上东冠');
env.set(onlineEks, '线上海外');

const data = [
  {
    name: 'Harbor',

    sites: {
      devControl: 'harbor.musiconline-dev',
      devCompute1: 'harbor.yf-dev1',
      testControl: 'harbor.yf-onlinetest',
      testCompute1: 'harbor.yf-onlinetest1',
      testEks: 'harbor.yf-onlinetest2',
      onlineControl: 'harbor.yf-online',
      onlineyq1: 'harbor.yf-online1',
      onlinedg1: 'harbor.yf-online-dg1',
      onlineEks: 'harbor.yf-meetyonline',
    },
  },
];

export default {
  env,
  data,
};
