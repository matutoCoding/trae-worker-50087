import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { CaseItem } from '@/types';
import { getCategoryText, getReligionText } from '@/utils';

interface CaseCardProps {
  data: CaseItem;
}

const CaseCard: React.FC<CaseCardProps> = ({ data }) => {
  const handleClick = () => {
    Taro.navigateTo({
      url: `/pages/case-detail/index?id=${data.id}`
    });
  };

  return (
    <View className={styles.card} onClick={handleClick}>
      <View className={styles.cover}>
        <Image src={data.coverImage} className={styles.coverImg} mode="aspectFill" />
        <View className={styles.coverOverlay} />
        <View className={styles.categoryBadge}>
          {getCategoryText(data.category)}
        </View>
        <View className={styles.ratingBadge}>
          ★ {data.rating.toFixed(1)}
        </View>
      </View>
      <View className={styles.content}>
        <Text className={styles.title}>{data.title}</Text>
        <Text className={styles.summary}>{data.summary}</Text>
        <View className={styles.meta}>
          <View className={styles.metaItem}>
            <Text className={styles.metaText}>{getReligionText(data.religion)}</Text>
          </View>
          <View className={styles.metaItem}>
            <Text className={styles.metaText}>👁 {data.views}</Text>
          </View>
          <View className={styles.metaItem}>
            <Text className={styles.metaText}>♥ {data.favorites}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default CaseCard;
