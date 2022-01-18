import React, {useEffect, useRef} from 'react';
import {Terminal} from 'xterm';
import {FitAddon} from 'xterm-addon-fit';
import WebSocket from '@/websocket';
import debounce from 'lodash/debounce';
import 'xterm/css/xterm.css';
import './index.module.less';

const fitAddon = new FitAddon();

interface IProps {
  url: string;
  protocol?: string;
  postSocketMessage?: (data: any) => any;
  postSendData?: (data: any) => any;
  onSocketOpen?: (
    socketRef: React.MutableRefObject<WebSocket | undefined>,
  ) => any;
}

const Index: React.FC<IProps> = ({
                                   url,
                                   protocol,
                                   postSocketMessage,
                                   postSendData,
                                   onSocketOpen,
                                 }) => {
  const containerRef = useRef<HTMLDivElement>();
  const terminalRef = useRef<Terminal | undefined>(undefined);
  const socketRef = useRef<WebSocket | undefined>(undefined);

  // 初始化terminal
  useEffect(() => {
    terminalRef.current = new Terminal({
      cursorBlink: true,
      cursorStyle: 'block',
      scrollback: 800,
      tabStopWidth: 8,
      fontFamily: "'Courier New', 'Courier', monospace",
      fontSize: 16,
      lineHeight: 1,
      theme: {
        foreground: '#f0f0f0',
        cursor: 'white',
      },
    });
    terminalRef.current.open(containerRef.current as HTMLElement);
    terminalRef.current.writeln(
      'The web terminal has been initialized successfully!',
    );
    terminalRef.current.loadAddon(fitAddon);
    fitAddon.fit();
    terminalRef.current.onData(
      (event) =>
        socketRef.current &&
        socketRef.current.sendMessage(
          postSendData ? postSendData(event) : event,
        ),
    );
    terminalRef.current.focus();
  }, []);

  // 初始化websocket连接
  useEffect(() => {
    socketRef.current = new WebSocket({
      socketUrl: url,
      protocol,
      loading: () =>
        terminalRef.current &&
        terminalRef.current.writeln('connecting to docker...'),
      socketOpen: () => {
        if (terminalRef.current) {
          terminalRef.current.write('\r\r\r');
          terminalRef.current.writeln(
            '*********************************** The websocket connection is established ****************************************',
          );
        }
        if (onSocketOpen) {
          onSocketOpen(socketRef);
        }
      },
      socketMessage: (event: any) => {
        const data = postSocketMessage ? postSocketMessage(event) : event;
        if (terminalRef.current && data) {
          terminalRef.current.write(data);
          terminalRef.current.scrollToBottom();
        }
      },
      socketClose: (e: { code: any; reason: any; }) =>
        terminalRef.current &&
        terminalRef.current.writeln(
          `The connection is being closed，with the error code ${
            e?.code
          }, the reason ${e?.reason || undefined}, reconnecting...`,
        ),
      socketError: () =>
        terminalRef.current &&
        terminalRef.current.writeln(
          'error occured during the connection process.',
        ),
    });

    socketRef.current.createWebSocket();
  }, []);

  // 窗口大小变化时的回调
  useEffect(() => {
    const listener = debounce(() => {
      fitAddon.fit();
      const dimensions = fitAddon.proposeDimensions();
      socketRef.current?.sendMessage?.(
        JSON.stringify([
          JSON.stringify({
            Op: 'resize',
            Cols: dimensions.cols,
            Rows: dimensions.rows,
          }),
        ]),
      );
    }, 100);
    window.addEventListener('resize', listener);
    return () => {
      window.removeEventListener('resize', listener);
    };
  }, []);

  return <div ref={containerRef as React.RefObject<HTMLDivElement>}/>;
};

export default Index
