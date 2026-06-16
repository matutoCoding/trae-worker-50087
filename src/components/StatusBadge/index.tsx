import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import { getStatusText, getStatusColor } from '@/utils';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const color = getStatusColor(status);
  const text = getStatusText(status);

  return (
    <View
      className={classnames(styles.badge, size === 'sm' && styles.badgeSm)}
      style={{ backgroundColor: `${color}15`, color: color, borderColor: `${color}30` }}
    >
      <Text className={styles.dot} style={{ backgroundColor: color }}></Text>
      <Text>{text}</Text>
    </View>
  );
};

export default StatusBadge;
