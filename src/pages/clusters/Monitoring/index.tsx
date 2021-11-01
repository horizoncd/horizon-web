import {useRef} from 'react';

export default () => {
  const ref = useRef<HTMLIFrameElement>(null);


  return <iframe
    ref={ref}
    title={'Monitor'}
    onLoad={() => {
      if (ref.current) {
        const htmlCollectionOf = ref.current.getElementsByClassName('submenu-controls');
        for (var i = 0; i < htmlCollectionOf.length; i++) {
        }
      }
    }}
    src={'http://grafana.yf-onlinetest.netease.com/d/6581e46e4e5c7ba40a07646395ef7b23/kubernetes-compute-resources-pod?orgId=1&refresh=10s'}
    style={{
      width: '100%',
      height: '100%',
      border: 'none',
    }}
    scrolling={'no'}
  />
};
