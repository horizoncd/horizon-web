import SockJS from 'sockjs-client';
import URL from 'url-parse';

const WSstatusMapping = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
};

class WebSocket {
  constructor(param = {}) {
    this.param = param;
    this.socket = null;
    this.lockReconnect = false;
    this.timer = null;
  }

  createWebSocket = () => {
    const { socketUrl, protocol, loading } = this.param;
    try {
      const parsedUrl = new URL(socketUrl);
      if (['ws:', 'wss:'].includes(parsedUrl.protocol)) {
        if ('WebSocket' in window) {
          this.socket = new window.WebSocket(socketUrl, protocol);
        } else if ('MozWebSocket' in window) {
          this.socket = new window.MozWebSocket(socketUrl, protocol);
        }
      } else {
        this.socket = new SockJS(socketUrl, protocol);
      }

      if (this.socket.readyState === WSstatusMapping.CONNECTING) {
        loading();
      }
      this.socket.onopen = this.onopen;
      this.socket.onmessage = this.onmessage;
      this.socket.onclose = this.onclose;
      this.socket.onerror = this.onerror;
    } catch (e) {
      console.log(e, '初始化wb时重连');
      this.reconnect();
    }
  };

  onopen = () => {
    const { socketOpen } = this.param;
    if (socketOpen && this.socket) socketOpen();
    // heartBeat.start(this.socket);
  };

  onmessage = (msg) => {
    const { socketMessage } = this.param;
    // 当返回的信息满足和后端约定的心跳上报返回值时，重置心跳
    // heartBeat.reset(this.socket);
    return socketMessage && this.socket && socketMessage(msg);
  };

  onerror = (e) => {
    const { socketError } = this.param;
    this.socket = null;
    if (socketError) socketError(e);
    this.reconnect();
  };

  // 关闭连接触发， close()时会被触发
  onclose = (e) => {
    const { socketClose } = this.param;
    if (socketClose) socketClose(e);
    this.reconnect();
  };

  reconnect = () => {
    const { socketUrl } = this.param;
    if (this.lockReconnect) return;
    this.lockReconnect = true;
    this.socket = null;
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.createWebSocket(socketUrl);
      this.lockReconnect = false;
    }, 10000);
  };

  sendMessage = (value) => {
    if (this.socket) {
      this.socket.send(value);
    }
  };
}

export default WebSocket;
