import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import StatusBadge from '@/components/StatusBadge';
import { ScheduleItem } from '@/types';
import { formatDateCN, getWeekDay, getReligionText, formatMoney } from '@/utils';

interface ScheduleCardProps {
  data: ScheduleItem;
  onClick?: (data: ScheduleItem): void;
}

const ScheduleCard: React.FC<ScheduleCardProps> = ({ data, onClick }) => {
  const handleClick = () => {
    if (data.status === 'free') {
      onClick?.(data);
    } else {
      Taro.navigateTo({
        url: `/pages/schedule-detail/index?id=${data.id}`
      });
    }
  };

  return (
    <View className={styles.card} onClick={handleClick}>
      <View className={styles.header}>
        <View className={styles.dateBox}>
          <Text className={styles.date}>{formatDateCN(data.date)}</Text>
          <Text className={styles.weekday}>{getWeekDay(data.date)}</Text>
        </View>
        <StatusBadge status={data.status} size="sm" />
      </View>

      {data.status !== 'free' ? (
        <View className={styles.content}>
          <View className={styles.deceased}>
            <Text className={styles.name}>
              {data.deceasedName}
              <Text className={styles.age}> 享年{data.age}岁
            </Text>
          </View>
          <Text className={styles.genderIcon}>{data.gender === 'male' ? '先生' : '女士'}
          </Text>
        </View>
        <View className={styles.meta}>
          <Text className={styles.time}>⏰ {data.time}</Text>
          <Text className={styles.hall}>📍 {data.hallName}</Text>
        </View>
        <View className={styles.tags}>
          <View className={styles.tag} style={{ backgroundColor: '#EBF4FF, color: '#2C5282 }}
          >
            {getReligionText(data.religion)}
          </View>
          <View className={styles.tag} style={{ backgroundColor: '#FFF5F5', color: '#C53030' }}
          >
            {data.ceremonyType}
          </View>
        </View>
        {data.amount && (
          <View className={styles.footer}>
            <Text className={styles.family}>家属：{data.familyName}</Text>
            <Text className={styles.amount}>{formatMoney(data.amount)}
            </Text>
          </View>
        )}
      ) : (
        <View className={styles.freeContent}>
          <Text className={styles.freeText}>⏰ {data.time}</Text>
          <Text className={styles.freeTime}>可预约档期</Text>
        </View>
      )}
    </View>
  );
};

export default ScheduleCard;
