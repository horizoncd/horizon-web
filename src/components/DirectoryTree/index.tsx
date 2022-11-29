import {
  Divider, Space, Tooltip, Tree,
} from 'antd';
import type { DataNode } from 'rc-tree/lib/interface';
import React from 'react';
import styles from './index.less';
import utils, { handleHref } from '@/utils';
import NoData from '../NoData';

const { DirectoryTree } = Tree;

export interface TreeDataNode extends DataNode {
  group?: number,
  title: string,
  fullName: string,
  fullPath: string,
  updatedAt: string,
}

export function DTreeAvatar(props: { title: string, size: number }) {
  const { title, size } = props;
  const firstLetter = title.charAt(0).toUpperCase();
  const sizeInCss = `${size}px`;
  return (
    <span
      className={`identicon bg${utils.getAvatarColorIndex(title)}`}
      style={
        {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: sizeInCss,
          height: sizeInCss,
          borderRadius: '4px',
          fontSize: '20px',
        }
      }
    >
      {firstLetter}
    </span>
  );
}

export function DTreeDate(props: { updatedAt: string }) {
  const { updatedAt } = props;

  return (
    <Tooltip title={utils.timeToLocal(updatedAt)}>
      Updated
      {' '}
      {utils.timeFromNowEnUS(updatedAt)}
    </Tooltip>
  );
}

export function DTreeTitle(props: { title: string, fullPath: string }) {
  const { title, fullPath } = props;
  return (
    <a className={styles.treeTitle} href={fullPath}>
      {title}
    </a>
  );
}

interface DTreeItemProps {
  title: string,
  fullPath: string,
  updatedAt: string,
  extra?: React.ReactNode,
}
export function DTreeItem(props: DTreeItemProps) {
  const {
    title, fullPath, updatedAt, extra,
  } = props;
  return (
    <div style={
      {
        display: 'inline-flex',
        alignItems: 'center',
      }
    }
    >
      <Space>
        {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
        <div
          onClick={(e: any) => handleHref(e, fullPath)}
        >
          <Space size="large">
            <DTreeAvatar title={title} size={48} />
            <DTreeTitle title={title} fullPath={fullPath} />
          </Space>
        </div>
        {extra}
      </Space>
      <div style={
        {
          position: 'absolute',
          right: 0,
          fontSize: 14,
          color: '#666666',
        }
      }
      >
        <DTreeDate updatedAt={updatedAt} />
      </div>
    </div>
  );
}

DTreeItem.defaultProps = {
  extra: null,
};

const defaultRender = (node: TreeDataNode): React.ReactNode => {
  const { title, fullPath, updatedAt } = node;

  return <DTreeItem key={title} title={title} fullPath={fullPath} updatedAt={updatedAt} />;
};

export interface DTreeItemProp {
  id: number,
  fullName?: string,
  fullPath: string,
  updatedAt: string,
  icon?: React.ReactNode,
}
export function DTree(props: { items: DTreeItemProp[], render?: (node: TreeDataNode) => React.ReactNode }) {
  const { items, render } = props;
  if (items === null || items.length === 0) {
    return <NoData title="" desc="没有数据" />;
  }
  const data = items.map((item: DTreeItemProp) => {
    const treeData = {
      key: item.id,
      title: (item.fullName ?? item.fullPath.substring(1)).split('/').join('  /  '),
      isLeaf: true,
      icon: item.icon,
      fullName: item.fullName ?? item.fullPath.substring(1),
      ...item,
    };
    return treeData;
  });
  return (
    <div
      style={
        {
          width: '100%',
        }
      }
    >

      <DirectoryTree
        treeData={data as TreeDataNode[]}
        //@ts-ignore
        titleRender={render}
      />
      <Divider style={{ margin: '5px 0 5px 0' }} />
    </div>
  );
}

DTree.defaultProps = {
  render: defaultRender,
};
