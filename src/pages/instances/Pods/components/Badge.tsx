import { Space } from 'antd';
import { useRequest } from 'umi';
import { useEffect, useMemo, useState } from 'react';
import { listBadges } from '@/services/badge/badge';

interface BadgeProps {
  name: string;
  svgLink: string;
  redirectLink?: string;
}

export const Badge = (props: BadgeProps) => {
  const { name, svgLink: badgeLink, redirectLink } = props;
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const height = 24;
      const rate = height / img.height;
      const width = img.width * rate;
      setDimensions({ width, height });
    };
    img.src = badgeLink;
  }, [badgeLink]);

  const img = useMemo(
    () => (
      <img
        src={badgeLink}
        alt={name}
        width={dimensions.width}
        height={dimensions.height}
      />
    ),
    [badgeLink, name, dimensions],
  );

  if (redirectLink) {
    return (
      <a href={redirectLink}>
        {img}
      </a>
    );
  }
  return img;
};

interface BadgeBarProps {
  badges: BadgeProps[];
}

export const BadgeBar = (props: BadgeBarProps) => {
  const { badges } = props;

  if (!badges || badges.length === 0) {
    return null;
  }

  return (
    <Space>
      {badges.map((badge) => <Badge {...badge} />)}
    </Space>
  );
};

interface ClusterBadgeBarProps {
  clusterID: number;
}

export const ClusterBadgeBar = (props: ClusterBadgeBarProps) => {
  const { clusterID } = props;
  const [badges, setBadges] = useState<BadgeProps[]>([]);
  useRequest(() => listBadges('clusters', clusterID), {
    refreshDeps: [clusterID],
    onSuccess: (data) => {
      setBadges(data);
    },
  });

  if (!badges || badges.length === 0) {
    return null;
  }
  return (
    <div style={{ marginTop: '8px', marginBottom: '8px' }}>
      <BadgeBar badges={badges} />
    </div>
  );
};
