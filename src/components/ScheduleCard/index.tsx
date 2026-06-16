import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import StatusBadge from '@/components/StatusBadge';
import { ScheduleItem } from '@/types';
import { formatDateCN, getWeekDay, getReligionText, formatMoney } from '@/utils';

interface ScheduleCardProps {
  data: ScheduleItem;
  onClick?: (data: ScheduleItem) => void;
}

const ScheduleCard: React.FC<ScheduleCardProps> = ({ data, onClick }) => {
  const handleClick = () => {
    if (data.status === 'free') {
      if (onClick) {
        onClick(data);
      } else {
        Taro.showModal({
          title: '空闲档期',
          content: `${formatDateCN(data.date)} ${data.time}\n此档期可预约，是否立即创建预约？`,
          confirmText: '创建预约',
          cancelText: '稍后再说',
          success: (res) => {
            if (res.confirm) {
              Taro.showToast({ title: '新增档期功能开发中', icon: 'none' });
            }
          }
        });
      }
    } else {
      Taro.navigateTo({
        url: `/pages/schedule-detail/index?id=${data.id}`
      });
    }
  };

  const genderText = data.gender === 'male' ? '先生' : '女士';

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
        <>
          <View className={styles.content}>
            <View className={styles.deceased}>
              <Text className={styles.name}>{data.deceasedName}</Text>
              <Text className={styles.genderIcon}>{genderText}</Text>
              <Text className={styles.age}>享年{data.age}岁</Text>
            </View>
          </View>
          <View className={styles.meta}>
            <Text className={styles.time}>⏰ {data.time}</Text>
            <Text className={styles.hall}>📍 {data.hallName}</Text>
          </View>
          <View className={styles.tags}>
            <View className={classnames(styles.tag, styles.tagReligion)}>
              {getReligionText(data.religion)}
            </View>
            <View className={classnames(styles.tag, styles.tagType)}>
              {data.ceremonyType}
            </View>
          </View>
          <View className={styles.footer}>
            <Text className={styles.family}>家属：{data.familyName}</Text>
            <Text className={styles.amount}>
              {data.amount ? formatMoney(data.amount) : '面议'}
            </Text>
          </View>
        </>
      ) : (
        <View className={styles.freeContent}>
          <View className={styles.freeLeft}>
            <Text className={styles.freeText}>⏰ {data.time}</Text>
            <Text className={styles.freeSub}>此时间段暂无安排</Text>
          </View>
          <View className={styles.freeTime}>
            <Text>➕ 创建预约</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default ScheduleCard;
