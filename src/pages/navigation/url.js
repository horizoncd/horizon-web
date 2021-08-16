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
env.set(devControl, {name: '开发管控', flag: 'yf-dev'});
env.set(devCompute1, {name: '开发计算', flag: 'yf-dev1'});
env.set(testControl, {name: '测试管控', flag: 'yf-onlinetest'});
env.set(testCompute1, {name: '测试计算', flag: 'yf-onlinetest1'});
env.set(testEks, {name: '测试海外', flag: 'yf-onlinetest2'});
env.set(onlineControl, {name: '线上管控', flag: 'yf-online'});
env.set(onlineyq1, {name: '线上义桥', flag: 'yf-online1'});
env.set(onlinedg1, {name: '线上东冠', flag: 'yf-online-dg1'});
env.set(onlineEks, {name: '线上海外', flag: 'yf-meetyonline'});

const harbor = {
  moduleName: 'harbor',

  serviceSites: [devControl, devCompute1, testControl, testEks, onlineControl, onlinedg1, onlineEks],

  overwrite: {
    devControl: 'musiconline-dev',
    testControl: 'musiconline-test',
  },
};

const data = [{
  title: '发布构建部署',
  modules: [harbor, harbor, harbor, harbor, harbor, harbor, ],
}]

export default {
  env,
  data,
};
