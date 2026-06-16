import React, { useState, useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import SectionHeader from '@/components/SectionHeader';
import { useAppStore } from '@/store/AppContext';
import { mockMusicList } from '@/data/ceremony';

type DeliveryStatus = 'done' | 'doing' | 'missing';

interface DeliveryItem {
  key: 'eulogy' | 'flow' | 'music' | 'communication' | 'review' | 'settlement';
  label: string;
  icon: string;
  desc: string;
  status: DeliveryStatus;
}

const statusText: Record<DeliveryStatus, string> = {
  done: '✅ 已完成',
  doing: '⚠️ 待完善',
  missing: '❌ 缺失'
};

const DeliveryPage: React.FC = () => {
  const {
    currentScheduleId,
    getCurrentSchedule,
    getEulogy,
    getFlowStepsFromSchedule,
    getFamilyForSchedule,
    getReview,
    getSettlementByScheduleId
  } = useAppStore();

  const [scheduleName, setScheduleName] = useState<string>('');

  useDidShow(() => {
    console.log('[DeliveryPage] 页面显示, currentScheduleId:', currentScheduleId);
    const schedule = getCurrentSchedule();
    if (schedule) {
      setScheduleName(`${schedule.deceasedName}${schedule.gender === 'male' ? '先生' : '女士'} · ${schedule.ceremonyType}`);
    } else {
      setScheduleName('');
    }
  });

  const deliveryItems = useMemo((): DeliveryItem[] => {
    if (!currentScheduleId) {
      return [
        { key: 'eulogy', label: '悼词', icon: '📝', desc: '逝者生平追思文稿', status: 'missing' },
        { key: 'flow', label: '流程单', icon: '⚙️', desc: '仪式流程步骤安排', status: 'missing' },
        { key: 'music', label: '音乐', icon: '🎵', desc: '仪式各环节背景音乐', status: 'missing' },
        { key: 'communication', label: '沟通纪要', icon: '💬', desc: '家属需求与沟通记录', status: 'missing' },
        { key: 'review', label: '复盘', icon: '📊', desc: '仪式服务复盘总结', status: 'missing' },
        { key: 'settlement', label: '结算单', icon: '💰', desc: '服务费用结算明细', status: 'missing' }
      ];
    }

    const eulogy = getEulogy(currentScheduleId);
    const eulogyStatus: DeliveryStatus = eulogy && eulogy.content && eulogy.content.trim().length > 0 ? 'done' : 'missing';

    const flowSteps = getFlowStepsFromSchedule(currentScheduleId);
    const flowStatus: DeliveryStatus = flowSteps && flowSteps.length > 0 ? 'done' : 'missing';

    const musicStatus: DeliveryStatus = mockMusicList && mockMusicList.length > 0 ? 'done' : 'missing';

    const family = getFamilyForSchedule(currentScheduleId);
    let commStatus: DeliveryStatus = 'missing';
    if (family) {
      const hasRequirements = family.requirements && family.requirements.length > 0;
      const hasRecords = family.communicationRecords && family.communicationRecords.length > 0;
      if (hasRequirements && hasRecords) {
        commStatus = 'done';
      } else if (hasRequirements || hasRecords) {
        commStatus = 'doing';
      }
    }

    const review = getReview(currentScheduleId);
    let reviewStatus: DeliveryStatus = 'missing';
    if (review) {
      const hasContent = (review.emergencyHandling && review.emergencyHandling.trim().length > 0)
        || (review.familyFeedback && review.familyFeedback.trim().length > 0)
        || (review.overallNote && review.overallNote.trim().length > 0)
        || (review.scenePhotos && review.scenePhotos.length > 0);
      reviewStatus = hasContent ? 'done' : 'doing';
    }

    const settlement = getSettlementByScheduleId(currentScheduleId);
    let settleStatus: DeliveryStatus = 'missing';
    if (settlement) {
      settleStatus = settlement.status === 'paid' ? 'done' : 'doing';
    }

    return [
      { key: 'eulogy', label: '悼词', icon: '📝', desc: '逝者生平追思文稿', status: eulogyStatus },
      { key: 'flow', label: '流程单', icon: '⚙️', desc: '仪式流程步骤安排', status: flowStatus },
      { key: 'music', label: '音乐', icon: '🎵', desc: '仪式各环节背景音乐', status: musicStatus },
      { key: 'communication', label: '沟通纪要', icon: '💬', desc: '家属需求与沟通记录', status: commStatus },
      { key: 'review', label: '复盘', icon: '📊', desc: '仪式服务复盘总结', status: reviewStatus },
      { key: 'settlement', label: '结算单', icon: '💰', desc: '服务费用结算明细', status: settleStatus }
    ];
  }, [
    currentScheduleId,
    getEulogy,
    getFlowStepsFromSchedule,
    getFamilyForSchedule,
    getReview,
    getSettlementByScheduleId
  ]);

  const stats = useMemo(() => {
    const done = deliveryItems.filter(i => i.status === 'done').length;
    const doing = deliveryItems.filter(i => i.status === 'doing').length;
    const missing = deliveryItems.filter(i => i.status === 'missing').length;
    return { done, doing, missing, total: deliveryItems.length };
  }, [deliveryItems]);

  const pendingItems = useMemo(() => {
    return deliveryItems.filter(i => i.status !== 'done');
  }, [deliveryItems]);

  const handleItemClick = (item: DeliveryItem) => {
    if (!currentScheduleId) {
      Taro.showToast({ title: '请先关联档期', icon: 'none' });
      return;
    }

    switch (item.key) {
      case 'eulogy':
        Taro.navigateTo({ url: '/pages/eulogy/index' });
        break;
      case 'flow':
        Taro.switchTab({ url: '/pages/ceremony/index' });
        break;
      case 'music':
        Taro.showToast({ title: '音乐清单待完善', icon: 'none' });
        break;
      case 'communication':
        Taro.navigateTo({ url: '/pages/family/index' });
        break;
      case 'review':
        Taro.navigateTo({ url: '/pages/review/index' });
        break;
      case 'settlement':
        Taro.navigateTo({ url: '/pages/settlement/index' });
        break;
    }
  };

  return (
    <View className={styles.container}>
      {scheduleName && (
        <View
          style={{
            background: 'linear-gradient(135deg, #2C5282 0%, #2B6CB0 100%)',
            padding: 20,
            margin: '0 -32rpx 24rpx -32rpx',
            color: '#fff'
          }}
        >
          <Text style={{ fontSize: 22, opacity: 0.9 }}>📌 当前关联档期</Text>
          <Text style={{ fontSize: 30, fontWeight: 600, display: 'block', marginTop: 8 }}>
            {scheduleName}
          </Text>
        </View>
      )}

      <View className={styles.statsRow}>
        <View className={styles.statCard}>
          <Text className={classnames(styles.statNum, styles.green)}>{stats.done}</Text>
          <Text className={styles.statLabel}>✅ 已完成</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={classnames(styles.statNum, styles.warm)}>{stats.doing}</Text>
          <Text className={styles.statLabel}>⚠️ 待完善</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={classnames(styles.statNum, styles.red)}>{stats.missing}</Text>
          <Text className={styles.statLabel}>❌ 缺失</Text>
        </View>
      </View>

      <View className={styles.card}>
        <SectionHeader
          title="交付项清单"
          subtitle={`共${stats.total}项，已完成${stats.done}项`}
        />
        <View className={styles.deliveryList}>
          {deliveryItems.map(item => (
            <View
              key={item.key}
              className={styles.deliveryItem}
              onClick={() => handleItemClick(item)}
            >
              <View className={styles.deliveryIcon}>{item.icon}</View>
              <View className={styles.deliveryInfo}>
                <Text className={styles.deliveryName}>{item.label}</Text>
                <Text className={styles.deliveryDesc}>{item.desc}</Text>
              </View>
              <View className={classnames(styles.deliveryStatus, item.status)}>
                {statusText[item.status]}
              </View>
              <Text className={styles.arrowIcon}>›</Text>
            </View>
          ))}
        </View>
      </View>

      {pendingItems.length > 0 && (
        <View className={styles.card}>
          <SectionHeader
            title="缺项汇总"
            subtitle={`${pendingItems.length}项待处理`}
          />
          <View className={styles.summaryList}>
            {pendingItems.map(item => (
              <View
                key={item.key}
                className={classnames(styles.summaryItem, item.status === 'doing' && styles.doing)}
                onClick={() => handleItemClick(item)}
              >
                <Text className={styles.summaryIcon}>
                  {item.status === 'doing' ? '⚠️' : '❌'}
                </Text>
                <Text className={styles.summaryText}>
                  {item.icon} {item.label}：{item.status === 'doing' ? '待完善' : '尚未创建'}
                </Text>
                <Text className={styles.summaryAction}>去处理 ›</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {pendingItems.length === 0 && (
        <View className={styles.card}>
          <SectionHeader title="缺项汇总" subtitle="交付状态" />
          <Text className={styles.emptyText}>🎉 太棒了！所有交付项均已完成</Text>
        </View>
      )}
    </View>
  );
};

export default DeliveryPage;
