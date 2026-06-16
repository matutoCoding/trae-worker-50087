import React, { useState, useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import SectionHeader from '@/components/SectionHeader';
import { mockReviews, mockMasterProfile } from '@/data/settlement';
import { ReviewItem, SettlementItem } from '@/types';
import { formatMoney, renderStars } from '@/utils';
import { useAppStore } from '@/store/AppContext';

const SettlementPage: React.FC = () => {
  const {
    settlements,
    getCurrentSchedule,
    applySettlementPaid,
    addOrUpdateSettlement,
    advanceBoardStep,
    setCurrentScheduleId,
    getReview
  } = useAppStore();
  const [activeTab, setActiveTab] = useState<string>('settle');
  const [settleFilter, setSettleFilter] = useState<string>('all');
  const [highlightId, setHighlightId] = useState<string | null>(null);

  useDidShow(() => {
    console.log('[SettlementPage] 页面显示');
    const currentSchedule = getCurrentSchedule();
    if (currentSchedule && currentSchedule.status === 'completed') {
      const added = addOrUpdateSettlement(currentSchedule);
      setHighlightId(added.id);
      setTimeout(() => setHighlightId(null), 2000);
    }
  });

  const monthlyIncome = useMemo(() => {
    const paid = settlements.filter(s => s.status === 'paid').reduce((sum, s) => sum + s.amount, 0);
    const pending = settlements.filter(s => s.status === 'pending').reduce((sum, s) => sum + s.amount, 0);
    return { paid, pending, total: paid + pending };
  }, [settlements]);

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
    let list = settlements;
    if (settleFilter !== 'all') {
      list = list.filter(s => s.status === settleFilter);
    }
    return list.slice().sort((a, b) => b.date.localeCompare(a.date));
  }, [settlements, settleFilter]);

  const settleTabs = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待结算' },
    { key: 'paid', label: '已结算' }
  ];

  const handleApplyPaid = (settle: SettlementItem) => {
    if (!settle.scheduleId) return;
    Taro.showActionSheet({
      itemList: ['微信支付', '支付宝', '银行转账', '现金'],
      success: (res) => {
        const methods = ['微信支付', '支付宝', '银行转账', '现金'];
        applySettlementPaid(settle.scheduleId!, methods[res.tapIndex]);
        advanceBoardStep(settle.scheduleId!, 'settled');
        Taro.showToast({ title: '已申请结算', icon: 'success' });
      }
    });
  };

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
                <Text className={styles.incomeItemNum}>{settlements.length}</Text>
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
                <View
                  key={settle.id}
                  className={classnames(
                    styles.settleCard,
                    settle.status,
                    highlightId === settle.id && styles.highlight
                  )}
                >
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
                      onClick={() => handleApplyPaid(settle)}
                    >
                      📤 申请结算
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>

          <View className={styles.card}>
            <SectionHeader title="服务交付" subtitle="复盘记录与交付清单" />
            <View style={{ display: 'flex', flexDirection: 'row', gap: 16, marginTop: 16 }}>
              <View
                style={{
                  flex: 1,
                  padding: 24,
                  background: '#FFFBEB',
                  borderRadius: 12,
                  borderWidth: 1,
                  borderStyle: 'solid',
                  borderColor: '#FEEBC8'
                }}
                onClick={() => {
                  const s = getCurrentSchedule(); if (s) { setCurrentScheduleId(s.id); }
                  Taro.navigateTo({ url: '/pages/review/index' });
                }}
              >
                <Text style={{ fontSize: 32, marginBottom: 8 }}>📊</Text>
                <Text style={{ fontSize: 26, color: '#92400E', fontWeight: '600' }}>服务复盘</Text>
                <Text style={{ fontSize: 22, color: '#B7791F', marginTop: 4 }}>突发情况、家属反馈</Text>
              </View>
              <View
                style={{
                  flex: 1,
                  padding: 24,
                  background: '#EBF8FF',
                  borderRadius: 12,
                  borderWidth: 1,
                  borderStyle: 'solid',
                  borderColor: '#BEE3F8'
                }}
                onClick={() => {
                  const s = getCurrentSchedule(); if (s) { setCurrentScheduleId(s.id); }
                  Taro.navigateTo({ url: '/pages/delivery/index' });
                }}
              >
                <Text style={{ fontSize: 32, marginBottom: 8 }}>📦</Text>
                <Text style={{ fontSize: 26, color: '#2A4365', fontWeight: '600' }}>交付清单</Text>
                <Text style={{ fontSize: 22, color: '#2C5282', marginTop: 4 }}>悼词/流程/沟通汇总</Text>
              </View>
            </View>
          </View>
        </>
      )}
    </View>
  );
};

export default SettlementPage;
