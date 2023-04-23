function getRevision(n: CLUSTER.ResourceNode) {
  if (n.info && n.info.length > 0) {
    const revision = n.info.filter((item) => item.name === 'Revision');
    if (revision.length > 0) {
      return revision[0].value;
    }
  }
  return '';
}

type Tree = {
  parent?: Tree,
  node: CLUSTER.ResourceNode,
  children: Tree[],
};

function genTree(data: CLUSTER.ResourceTree) {
  const roots: Tree[] = [];
  const visited: Record<string, Tree> = {};

  Object.keys(data.nodes).forEach((k) => {
    if (k in visited) {
      return;
    }
    let key = k;

    let preNode: Tree | undefined;

    while (true) {
      let root = visited[key];
      if (root === undefined) {
        root = {
          node: data.nodes[key],
          children: [],
        };
        visited[key] = root;
      }

      if (preNode !== undefined) {
        preNode.parent = root;
        // eslint-disable-next-line @typescript-eslint/no-loop-func
        if (root.children.filter((n) => n.node.uid === preNode?.node.uid).length === 0) {
          root.children.push(preNode);
        }
      }

      if (root.node && root.node.parentRefs && root.node.parentRefs.length !== 0) {
        key = root.node.parentRefs[0].uid;
        preNode = root;
      } else {
        roots.push(root);
        return;
      }
    }
  });
  return visited;
}

function getVersion(revision: string) {
  const pattern = /Rev:([0-9]+)/;
  const matches = pattern.exec(revision);
  if (matches === null || matches.length < 2) {
    return -1;
  }
  const version = parseInt(matches[1], 10);
  if (isNaN(version)) {
    return -1;
  }
  return version;
}

function getSortedKey(data?: CLUSTER.ResourceTree): string[] {
  if (!data) {
    return [];
  }

  const { nodes } = data;

  const trees = genTree(data);

  function getPrefix(k: string) {
    let n = trees[k];
    let res = '';
    while (true) {
      if (res !== '') {
        res = `${n.node.name}/${res}`;
      } else {
        res = n.node.name;
      }
      if (n.parent) {
        n = n.parent;
      } else {
        return res;
      }
    }
  }

  const revisionSet = new Set<Tree>();

  Object.keys(nodes).forEach((uid: string) => {
    const node = nodes[uid];
    if (node.kind === 'Pod') {
      const n = trees[node.uid];
      if (n.parent) {
        revisionSet.add(n.parent);
      }
    }
  });

  const revisions = Array.from(revisionSet);
  const parents: Tree[] = [];

  revisions.forEach((revision) => {
    const pods = revision.children.filter((n) => n.node.kind === 'Pod');
    if (pods && pods.length > 0) {
      parents.push(revision);
    }
  });

  const sortedKey = parents.sort((a, b) => {
    const revisionA = getRevision(a.node);
    const revisionB = getRevision(b.node);
    // order by revision desc
    if (revisionA !== '' && revisionB !== '') {
      if (revisionA === revisionB) {
        // order by name desc
        return -a.node.name.localeCompare(b.node.name);
      }
      const versionA = getVersion(revisionA);
      const versionB = getVersion(revisionB);
      return versionB - versionA;
    }
    if (revisionA !== '') {
      return 1;
    }
    if (revisionB !== '') {
      return -1;
    }
    // order by name desc
    return -a.node.name.localeCompare(b.node.name);
  }).map((n) => getPrefix(n.node.uid));

  return sortedKey;
}

export default getSortedKey;
