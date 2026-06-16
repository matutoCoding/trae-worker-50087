import React, { useState, useMemo } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import SectionHeader from '@/components/SectionHeader';
import { getCaseById } from '@/data/cases';
import { CaseItem } from '@/types';
import { useAppStore } from '@/store/AppContext';
import { formatDateCN, getCategoryText, getReligionText, renderStars } from '@/utils';

const CaseDetailPage: React.FC = () => {
  const router = useRouter();
  const id = router.params.id || 'case001';
  const { setCasePlan } = useAppStore();
  const [caseData, setCaseData] = useState<CaseItem | null>(null);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  useDidShow(() => {
    console.log('[CaseDetailPage] 页面显示，案例ID:', id);
    const data = getCaseById(id);
    if (data) {
      setCaseData(data);
    } else {
      Taro.showToast({ title: '案例不存在', icon: 'error' });
    }
  });

  if (!caseData) return null;

  const genderText = caseData.age >= 80 ? '老太' : '先生/女士';

  return (
    <View className={styles.container}>
      <View
        className={styles.coverImage}
        style={{ backgroundImage: `url(${caseData.coverImage})` }}
      >
        <View className={styles.coverOverlay} />
        <View className={styles.coverContent}>
          <View className={styles.coverCategory}>
            {caseData.category === 'traditional' && '🎎 传统仪式'}
            {caseData.category === 'modern' && '💐 现代简约'}
            {caseData.category === 'religious' && '⛪ 宗教仪式'}
            {caseData.category === 'customized' && '✨ 定制追思'}
          </View>
          <Text className={styles.coverTitle}>{caseData.title}</Text>
          <View className={styles.coverMeta}>
            <Text className={styles.metaItem}>📅 {formatDateCN(caseData.date)}</Text>
            <Text className={styles.metaItem}>👁️ {caseData.views}次浏览</Text>
            <Text className={styles.metaItem}>⭐ {caseData.rating}</Text>
          </View>
        </View>
      </View>

      <View className={styles.card}>
        <SectionHeader title="基本信息" />
        <View className={styles.infoGrid}>
          <View className={styles.infoCell}>
            <Text className={styles.infoLabel}>逝者姓名</Text>
            <Text className={styles.infoValue}>{caseData.deceasedName}</Text>
          </View>
          <View className={styles.infoCell}>
            <Text className={styles.infoLabel}>享年</Text>
            <Text className={styles.infoValue}>{caseData.age}岁</Text>
          </View>
          <View className={styles.infoCell}>
            <Text className={styles.infoLabel}>举办地点</Text>
            <Text className={styles.infoValue}>{caseData.location}</Text>
          </View>
          <View className={styles.infoCell}>
            <Text className={styles.infoLabel}>宗教信仰</Text>
            <Text className={styles.infoValue}>{getReligionText(caseData.religion)}</Text>
          </View>
        </View>
        <View className={styles.ratingRow}>
          <Text className={styles.ratingStars}>{renderStars(caseData.rating)}</Text>
          <Text className={styles.ratingScore}>{caseData.rating}</Text>
          <Text className={styles.ratingLabel}>家属评分 · {caseData.favorites}人收藏</Text>
        </View>
      </View>

      <View className={styles.card}>
        <SectionHeader title="案例标签" subtitle="仪式类型与特色" />
        <View className={styles.tagsRow}>
          <View className={classnames(styles.tagChip, styles.tagCategory)}>
            {getCategoryText(caseData.category)}
          </View>
          <View className={classnames(styles.tagChip, styles.tagReligion)}>
            {getReligionText(caseData.religion)}仪式
          </View>
          <View className={classnames(styles.tagChip, styles.tagType)}>
            {caseData.age >= 90 ? '🎂 喜丧仪式' : '🕊️ 庄重告别'}
          </View>
          <View className={classnames(styles.tagChip, styles.tagReligion)}>
            专业司仪主持
          </View>
        </View>
      </View>

      <View className={styles.card}>
        <SectionHeader title="案例概述" subtitle="仪式设计理念" />
        <Text className={styles.summaryText}>{caseData.summary}</Text>
      </View>

      <View className={styles.card}>
        <SectionHeader title="仪式流程" subtitle={`共${caseData.ceremonyFlow.length}个环节`} />
        <View className={styles.flowList}>
          {caseData.ceremonyFlow.map((step, idx) => (
            <View key={idx} className={styles.flowItem}>
              <View className={styles.flowIndex}>{idx + 1}</View>
              <Text className={styles.flowText}>{step}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.card}>
        <SectionHeader title="案例亮点" subtitle="服务特色与创新" />
        <View className={styles.highlightsList}>
          {caseData.highlights.map((h, idx) => (
            <View key={idx} className={styles.highlightItem}>
              <Text className={styles.highlightIcon}>✨</Text>
              <Text className={styles.highlightText}>{h}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.card}>
        <SectionHeader title="家属反馈" subtitle="真实评价" />
        <View className={styles.feedbackCard}>
          <Text className={styles.feedbackQuote}>"</Text>
          <Text className={styles.feedbackText}>{caseData.familyFeedback}</Text>
          <Text className={styles.feedbackAuthor}>
            —— {caseData.deceasedName}{genderText}家属
          </Text>
        </View>
      </View>

      <View className={styles.bottomBar}>
        <View
          className={classnames(styles.bottomBtn, styles.secondary)}
          onClick={() => {
            setIsFavorite(!isFavorite);
            Taro.showToast({
              title: isFavorite ? '已取消收藏' : '收藏成功',
              icon: 'none'
            });
          }}
        >
          {isFavorite ? '❤️ 已收藏' : '🤍 收藏'}
        </View>
        <View
          className={classnames(styles.bottomBtn, styles.warm)}
          onClick={() => Taro.showToast({ title: '分享案例', icon: 'none' })}
        >
          📤 分享
        </View>
        <View
          className={classnames(styles.bottomBtn, styles.primary)}
          onClick={() => {
            if (!caseData) return;
            Taro.showModal({
              title: '套用案例方案',
              content: `将把「${caseData.title}」的流程和亮点应用到追思仪式？`,
              confirmText: '确认套用',
              success: (res) => {
                if (res.confirm) {
                  setCasePlan({
                    caseId: caseData.id,
                    caseTitle: caseData.title,
                    flow: caseData.ceremonyFlow,
                    highlights: caseData.highlights,
                    religion: caseData.religion
                  });
                  Taro.showToast({ title: '方案已套用', icon: 'success' });
                  setTimeout(() => Taro.switchTab({ url: '/pages/ceremony/index' }), 1000);
                }
              }
            });
          }}
        >
          📋 套用方案
        </View>
      </View>
    </View>
  );
};

export default CaseDetailPage;
