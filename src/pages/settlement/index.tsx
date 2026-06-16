import React, { useState, useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import SectionHeader from '@/components/SectionHeader';
import { mockReviews, mockSettlements, getMonthlyIncome, mockMasterProfile } from '@/data/settlement';
import { ReviewItem, SettlementItem } from '@/types';
import { formatMoney, getStatusText, renderStars } from '@/utils';

const SettlementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('review');
  const [settleFilter, setSettleFilter] = useState<string>('all');

  useDidShow(() => {
    console.log('[SettlementPage] 页面显示');
  });

  const monthlyIncome = useMemo(() => getMonthlyIncome(), []);

  const reviewStats = useMemo(() => {
    const total = mockReviews.length;
    const avgRating = total > 0
      ? (mockReviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1)
      : '5.0';
    const fiveStar = mockReviews.filter(r => r.rating >= 4.8).length;
    const replied = mockReviews.filter(r => r.reply).length;
    return { total, avgRating, fiveStar, replied };
  }, []);

  const allTags = useMemo(() => {
    const tagCount: Record<string, number> = {};
    mockReviews.forEach(r => {
      r.tags.forEach(t => {
        tagCount[t] = (tagCount[t] || 0) + 1;
      });
    });
    return Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => ({ tag, count }));
  }, []);

  const ratingDistribution = useMemo(() => {
    const dist = [0, 0, 0, 0, 0];
    mockReviews.forEach(r => {
      const star = Math.round(r.rating);
      if (star >= 1 && star <= 5) dist[5 - star]++;
    });
    const total = mockReviews.length || 1;
    return dist.map((count, idx) => ({
      star: 5 - idx,
      count,
      percent: Math.round((count / total) * 100)
    }));
  }, []);

  const filteredSettlements = useMemo((): SettlementItem[] => {
    if (settleFilter === 'all') return mockSettlements;
    return mockSettlements.filter(s => s.status === settleFilter);
  }, [settleFilter]);

  const settleTabs = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待结算' },
    { key: 'paid', label: '已结算' }
  ];

  return (
    <View className={styles.container}>
      <View className={styles.pageTabs}>
        <View
          className={classnames(styles.pageTab, activeTab === 'review' && styles.active)}
          onClick={() => setActiveTab('review')}
        >
          ⭐ 家属评价
        </View>
        <View
          className={classnames(styles.pageTab, activeTab === 'settle' && styles.active)}
          onClick={() => setActiveTab('settle')}
        >
          💰 服务结算
        </View>
      </View>

      {activeTab === 'review' && (
        <>
          <View className={styles.incomeHeader}>
            <Text className={styles.incomeLabel}>司仪：{mockMasterProfile.name} · {mockMasterProfile.title}</Text>
            <Text className={styles.incomeAmount}>{renderStars(4.9)} {reviewStats.avgRating}分</Text>
            <View className={styles.incomeBreakdown}>
              <View className={styles.incomeItem}>
                <Text className={styles.incomeItemNum}>{reviewStats.total}</Text>
                <Text className={styles.incomeItemLabel}>总评价</Text>
              </View>
              <View className={styles.incomeItem}>
                <Text className={styles.incomeItemNum}>{reviewStats.fiveStar}</Text>
                <Text className={styles.incomeItemLabel}>5星好评</Text>
              </View>
              <View className={styles.incomeItem}>
                <Text className={styles.incomeItemNum}>{reviewStats.replied}</Text>
                <Text className={styles.incomeItemLabel}>已回复</Text>
              </View>
            </View>
          </View>

          <View className={styles.reviewStats}>
            <View className={styles.statCard}>
              <Text className={styles.statNum}>{reviewStats.total}</Text>
              <Text className={styles.statLabel}>评价总数</Text>
            </View>
            <View className={styles.statCard}>
              <Text className={classnames(styles.statNum, styles.gold)}>{reviewStats.avgRating}</Text>
              <Text className={styles.statLabel}>综合评分</Text>
            </View>
            <View className={styles.statCard}>
              <Text className={classnames(styles.statNum, styles.green)}>
                {Math.round((reviewStats.fiveStar / (reviewStats.total || 1)) * 100)}%
              </Text>
              <Text className={styles.statLabel}>好评率</Text>
            </View>
            <View className={styles.statCard}>
              <Text className={classnames(styles.statNum, styles.red)}>
                {reviewStats.total - reviewStats.replied}
              </Text>
              <Text className={styles.statLabel}>待回复</Text>
            </View>
          </View>

          <View className={styles.card}>
            <SectionHeader title="评分分布" subtitle="家属评分详情" />
            <View className={styles.ratingOverview}>
              <View className={styles.ratingScore}>
                <Text className={styles.ratingNum}>{reviewStats.avgRating}</Text>
                <Text className={styles.ratingStars}>{renderStars(parseFloat(reviewStats.avgRating))}</Text>
              </View>
              <View className={styles.ratingDetail}>
                {ratingDistribution.map(item => (
                  <View key={item.star} className={styles.ratingBarRow}>
                    <Text className={styles.ratingBarLabel}>{item.star}星</Text>
                    <View className={styles.ratingBar}>
                      <View
                        className={styles.ratingBarFill}
                        style={{ width: `${item.percent}%` }}
                      />
                    </View>
                    <Text className={styles.ratingBarCount}>{item.count}条</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View className={styles.card}>
            <SectionHeader title="评价标签" subtitle={`共${allTags.length}个标签`} />
            <View className={styles.tagsList}>
              {allTags.map((item, idx) => (
                <Text
                  key={item.tag}
                  className={classnames(styles.tagItem, idx < 3 && styles.highlight)}
                >
                  {item.tag} ×{item.count}
                </Text>
              ))}
            </View>
          </View>

          <View className={styles.card}>
            <SectionHeader
              title="全部评价"
              subtitle={`${mockReviews.length}条`}
              extra={<Text style={{ color: '#2C5282', fontSize: 24 }}>回复评价 ›</Text>}
            />
            <View className={styles.reviewList}>
              {mockReviews.map((review: ReviewItem) => (
                <View key={review.id} className={styles.reviewCard}>
                  <View className={styles.reviewHeader}>
                    <View className={styles.reviewerInfo}>
                      <View className={styles.reviewerAvatar}>
                        {review.familyName.charAt(0)}
                      </View>
                      <View>
                        <Text className={styles.reviewerName}>{review.familyName}家属</Text>
                        <Text className={styles.reviewDate}>{review.date}</Text>
                      </View>
                    </View>
                    <Text className={styles.reviewStars}>
                      {renderStars(review.rating)} {review.rating}
                    </Text>
                  </View>
                  <Text className={styles.reviewContent}>{review.content}</Text>
                  {review.tags.length > 0 && (
                    <View className={styles.reviewTags}>
                      {review.tags.map((tag, idx) => (
                        <Text key={idx} className={styles.reviewTag}>{tag}</Text>
                      ))}
                    </View>
                  )}
                  {review.reply && (
                    <View className={styles.reviewReply}>
                      <Text className={styles.replyLabel}>司仪回复：</Text>
                      <Text className={styles.replyContent}>{review.reply}</Text>
                    </View>
                  )}
                  {!review.reply && (
                    <View
                      className={styles.actionBtn}
                      onClick={() => Taro.showToast({ title: '回复评价', icon: 'none' })}
                    >
                      ✏️ 回复家属评价
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        </>
      )}

      {activeTab === 'settle' && (
        <>
          <View className={styles.incomeHeader}>
            <Text className={styles.incomeLabel}>本月收入概览</Text>
            <Text className={styles.incomeAmount}>{formatMoney(monthlyIncome.total)}</Text>
            <View className={styles.incomeBreakdown}>
              <View className={styles.incomeItem}>
                <Text className={styles.incomeItemNum}>{formatMoney(monthlyIncome.paid)}</Text>
                <Text className={styles.incomeItemLabel}>已结算</Text>
              </View>
              <View className={styles.incomeItem}>
                <Text className={styles.incomeItemNum}>{formatMoney(monthlyIncome.pending)}</Text>
                <Text className={styles.incomeItemLabel}>待结算</Text>
              </View>
              <View className={styles.incomeItem}>
                <Text className={styles.incomeItemNum}>{mockSettlements.length}</Text>
                <Text className={styles.incomeItemLabel}>服务单数</Text>
              </View>
            </View>
          </View>

          <View className={styles.card}>
            <SectionHeader title="结算记录" subtitle="服务费用明细" />
            <View className={styles.settleTabs}>
              {settleTabs.map(tab => (
                <View
                  key={tab.key}
                  className={classnames(styles.settleTab, settleFilter === tab.key && styles.active)}
                  onClick={() => setSettleFilter(tab.key)}
                >
                  {tab.label}
                </View>
              ))}
            </View>
            <View className={styles.settleList}>
              {filteredSettlements.map((settle: SettlementItem) => (
                <View key={settle.id} className={classnames(styles.settleCard, settle.status)}>
                  <View className={styles.settleHeader}>
                    <Text className={styles.settleName}>{settle.deceasedName} · 告别仪式主持</Text>
                    <View className={classnames(styles.settleStatus, settle.status)}>
                      {settle.status === 'pending' ? '⏳ 待结算' : '✓ 已结算'}
                    </View>
                  </View>
                  <View className={styles.settleInfo}>
                    <View className={styles.settleMeta}>
                      <Text className={styles.settleDate}>服务日期：{settle.date}</Text>
                      {settle.paidDate && (
                        <Text className={styles.settleMethod}>
                          结算方式：{settle.paymentMethod} · {settle.paidDate}
                        </Text>
                      )}
                      {!settle.paidDate && (
                        <Text className={styles.settleMethod}>预计结算：仪式完成后3个工作日</Text>
                      )}
                    </View>
                    <Text className={classnames(styles.settleAmount, settle.status)}>
                      {formatMoney(settle.amount)}
                    </Text>
                  </View>
                  {settle.status === 'pending' && (
                    <View
                      className={styles.actionBtn}
                      onClick={() => Taro.showToast({ title: '申请结算', icon: 'none' })}
                    >
                      📤 申请结算
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        </>
      )}
    </View>
  );
};

export default SettlementPage;
