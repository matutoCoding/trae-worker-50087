import React, { useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import StatusBadge from '@/components/StatusBadge';
import SectionHeader from '@/components/SectionHeader';
import { ScheduleItem, BoardStepKey, BoardStepStatus } from '@/types';
import { useAppStore } from '@/store/AppContext';
import { formatDateCN, getWeekDay, getReligionText, formatMoney } from '@/utils';

interface BoardStep {
  key: BoardStepKey;
  label: string;
  icon: string;
  description: string;
  path?: string;
  isTab?: boolean;
}

const boardSteps: BoardStep[] = [
  { key: 'booked', label: '预约已确认', icon: '📋', description: '档期已预约' },
  { key: 'communicate', label: '家属沟通', icon: '💬', description: '已完成首次沟通', path: '/pages/family/index' },
  { key: 'flow_confirmed', label: '流程确认', icon: '⚙️', description: '仪式流程已确认', path: '/pages/ceremony/index', isTab: true },
  { key: 'ceremony_start', label: '仪式开始', icon: '▶️', description: '仪式已开始' },
  { key: 'ceremony_complete', label: '仪式完成', icon: '✅', description: '仪式已圆满完成' },
  { key: 'settled', label: '服务结算', icon: '💰', description: '费用已结算', path: '/pages/settlement/index' }
];

const ScheduleDetailPage: React.FC = () => {
  const router = useRouter();
  const id = router.params.id || 's001';
  const {
    schedules,
    updateScheduleStatus,
    setCurrentScheduleId,
    setReligionFromSchedule,
    advanceBoardStep,
    addOrUpdateSettlement,
    getFamilyForSchedule,
    getSettlementByScheduleId
  } = useAppStore();
  const [schedule, setSchedule] = useState<ScheduleItem | null>(null);
  const [settleSummary, setSettleSummary] = useState<{ text: string; color: string } | null>(null);
  const [familySummary, setFamilySummary] = useState<{ records: number; latest?: string } | null>(null);

  const refreshSchedule = () => {
    const data = schedules.find(s => s.id === id);
    if (data) {
      setSchedule(data);
      setCurrentScheduleId(data.id);
      setReligionFromSchedule(data.religion);
      const settle = getSettlementByScheduleId(data.id);
      if (settle) {
        setSettleSummary({
          text: settle.status === 'paid' ? '✓ 已结算' : '⏳ 待结算',
          color: settle.status === 'paid' ? '#38A169' : '#D69E2E'
        });
      } else if (data.status === 'completed') {
        setSettleSummary({ text: '待申请结算', color: '#E53E3E' });
      } else {
        setSettleSummary(null);
      }
      const family = getFamilyForSchedule(data.id);
      if (family) {
        setFamilySummary({
          records: family.communicationRecords.length,
          latest: family.communicationRecords[0]?.content
        });
      } else {
        setFamilySummary({ records: 0 });
      }
    } else {
      Taro.showToast({ title: '档期不存在', icon: 'error' });
    }
  };

  useDidShow(() => {
    console.log('[ScheduleDetailPage] 页面显示，档期ID:', id);
    refreshSchedule();
  });

  if (!schedule) return null;

  const family = getFamilyForSchedule(schedule.id);
  const genderText = schedule.gender === 'male' ? '先生' : '女士';
  const boardProgress = schedule.boardProgress;

  const handleStart = () => {
    Taro.showModal({
      title: '开始仪式',
      content: `确认开始 ${schedule.deceasedName}${genderText} 的告别仪式吗？\n开始后将自动进入追思流程页面。`,
      confirmText: '开始仪式',
      success: (res) => {
        if (res.confirm) {
          updateScheduleStatus(schedule.id, 'ongoing');
          advanceBoardStep(schedule.id, 'flow_confirmed');
          advanceBoardStep(schedule.id, 'ceremony_start');
          Taro.showToast({ title: '仪式已开始', icon: 'success' });
          setTimeout(() => {
            refreshSchedule();
            Taro.switchTab({ url: '/pages/ceremony/index' });
          }, 800);
        }
      }
    });
  };

  const handleComplete = () => {
    Taro.showModal({
      title: '完成仪式',
      content: `确认 ${schedule.deceasedName}${genderText} 的告别仪式已圆满完成吗？\n完成后可进入结算流程。`,
      confirmText: '已完成',
      confirmColor: '#C53030',
      success: (res) => {
        if (res.confirm) {
          updateScheduleStatus(schedule.id, 'completed');
          advanceBoardStep(schedule.id, 'ceremony_complete');
          addOrUpdateSettlement(schedule);
          Taro.showToast({ title: '仪式圆满完成', icon: 'success' });
          setTimeout(() => {
            refreshSchedule();
            Taro.showModal({
              title: '🎉 服务完成',
              content: `仪式已完成，服务费用 ${schedule.amount ? formatMoney(schedule.amount) : '待确认'}\n是否立即前往查看结算？`,
              confirmText: '去结算',
              cancelText: '稍后再说',
              success: (r2) => {
                if (r2.confirm) {
                  Taro.navigateTo({ url: '/pages/settlement/index' });
                }
              }
            });
          }, 1000);
        }
      }
    });
  };

  const goCeremony = () => {
    setCurrentScheduleId(schedule.id);
    setReligionFromSchedule(schedule.religion);
    advanceBoardStep(schedule.id, 'flow_confirmed');
    refreshSchedule();
    Taro.switchTab({ url: '/pages/ceremony/index' });
  };

  const handleBoardStepClick = (step: BoardStep) => {
    if (!step.path) return;
    if (step.key === 'communicate') {
      setCurrentScheduleId(schedule.id);
    }
    if (step.isTab) {
      Taro.switchTab({ url: step.path });
    } else {
      Taro.navigateTo({ url: step.path });
    }
  };

  const getStepStyle = (status?: BoardStepStatus) => {
    switch (status) {
      case 'done':
        return { bg: '#38A169', color: '#fff', border: '#38A169' };
      case 'doing':
        return { bg: '#D69E2E', color: '#fff', border: '#D69E2E' };
      default:
        return { bg: '#EDF2F7', color: '#718096', border: '#CBD5E0' };
    }
  };

  return (
    <View className={styles.container}>
      <View className={styles.headerCard}>
        <StatusBadge status={schedule.status} />
        {settleSummary && (
          <View style={{ marginTop: 12 }}>
            <Text style={{ fontSize: 22, color: settleSummary.color, fontWeight: 600 }}>
              {settleSummary.text}
            </Text>
          </View>
        )}
        <View style={{ height: 12 }} />
        <Text className={styles.deceasedName}>
          {schedule.deceasedName} {genderText}
        </Text>
        <Text className={styles.deceasedMeta}>
          享年 {schedule.age} 岁 · {getReligionText(schedule.religion)}
        </Text>
        <View className={styles.infoRow}>
          <Text>📅 {formatDateCN(schedule.date)} {getWeekDay(schedule.date)}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text>⏰ {schedule.time}</Text>
          <Text>📍 {schedule.hallName}</Text>
        </View>
      </View>

      <View className={styles.card}>
        <SectionHeader
          title="服务执行看板"
          subtitle="点击带链接的步骤可跳转对应页面"
        />
        <View style={{ display: 'flex', flexDirection: 'column', marginTop: 16, gap: 12 }}>
          {boardSteps.map((step, idx) => {
            const status = boardProgress?.[step.key] || 'pending';
            const style = getStepStyle(status);
            const isClickable = !!step.path && status !== 'pending';
            return (
              <View
                key={step.key}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  padding: 16,
                  background: '#F7FAFC',
                  borderRadius: 12,
                  border: `2rpx solid ${style.border}`,
                  opacity: isClickable ? 1 : 0.9
                }}
                onClick={() => isClickable && handleBoardStepClick(step)}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    background: style.bg,
                    color: style.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24,
                    fontWeight: 600,
                    marginRight: 16,
                    flexShrink: 0
                  }}
                >
                  {step.icon}
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontSize: 28, color: '#1A202C', fontWeight: 600 }}>
                      {idx + 1}. {step.label}
                    </Text>
                    {step.path && isClickable && (
                      <Text style={{ fontSize: 20, color: '#2C5282' }}>›</Text>
                    )}
                  </View>
                  <Text style={{ fontSize: 22, color: '#718096', marginTop: 4 }}>
                    {step.description}
                    {status === 'doing' && (
                      <Text style={{ color: '#D69E2E', marginLeft: 8 }}> · 进行中</Text>
                    )}
                  </Text>
                </View>
                <View>
                  <Text
                    style={{
                      fontSize: 20,
                      color: style.color,
                      padding: '4rpx 12rpx',
                      borderRadius: 8,
                      background:
                        status === 'done'
                          ? 'rgba(56,161,105,0.1)'
                          : status === 'doing'
                          ? 'rgba(214,158,46,0.1)'
                          : 'transparent'
                    }}
                  >
                    {status === 'done' ? '✓ 完成' : status === 'doing' ? '● 进行' : '○ 待办'}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      <View className={styles.card}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>📋</Text>
          基本信息
        </Text>
        <View className={styles.infoList}>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>仪式类型</Text>
            <Text className={styles.infoValue}>{schedule.ceremonyType}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>地点</Text>
            <Text className={styles.infoValue}>{schedule.location} · {schedule.hallName}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>服务费用</Text>
            <Text className={styles.infoValue} style={{ color: '#C53030', fontWeight: 600 }}>
              {schedule.amount ? formatMoney(schedule.amount) : '待确认'}
            </Text>
          </View>
          {schedule.notes && (
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>备注信息</Text>
              <Text className={styles.infoValue}>{schedule.notes}</Text>
            </View>
          )}
        </View>
        <View style={{ marginTop: 24 }}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>🏷️</Text>
            服务标签
          </Text>
          <View className={styles.tagRow} style={{ marginTop: 16 }}>
            <View className={styles.tag}>{getReligionText(schedule.religion)}仪式</View>
            <View className={classnames(styles.tag, styles.tagWarm)}>{schedule.ceremonyType}</View>
            <View className={classnames(styles.tag, styles.tagGold)}>专业司仪主持</View>
          </View>
        </View>
      </View>

      <View className={styles.card}>
        <SectionHeader
          title="家属联系人"
          extra={
            <Text
              style={{ color: '#2C5282', fontSize: 24 }}
              onClick={() => {
                setCurrentScheduleId(schedule.id);
                Taro.navigateTo({ url: '/pages/family/index' });
              }}
            >
              查看沟通记录 ›
            </Text>
          }
        />
        {family && (
          <View
            className={styles.familyContact}
            onClick={() => {
              setCurrentScheduleId(schedule.id);
              Taro.navigateTo({ url: '/pages/family/index' });
            }}
          >
            <View className={styles.familyAvatar}>
              {family.name.charAt(0)}
            </View>
            <View className={styles.familyInfo}>
              <Text className={styles.familyName}>{family.name}</Text>
              <Text className={styles.familyRel}>
                {family.relation} · {family.phone}
              </Text>
              {familySummary && familySummary.latest && (
                <Text style={{ fontSize: 22, color: '#718096', marginTop: 4 }}>
                  最近沟通：{familySummary.latest.slice(0, 20)}...
                </Text>
              )}
            </View>
            <View
              className={styles.phoneBtn}
              onClick={(e) => {
                e.stopPropagation();
                Taro.makePhoneCall({ phoneNumber: family.phone.replace(/\*/g, '0') });
              }}
            >
              📞
            </View>
          </View>
        )}
        {family && (
          <View>
            <Text className={styles.sectionTitle} style={{ fontSize: 26, marginTop: 16 }}>
              <Text className={styles.sectionIcon}>📌</Text>
              家属需求 ({family.requirements.length}项)
            </Text>
            {family.requirements.map((req, idx) => (
              <View key={idx} style={{ display: 'flex', padding: '12rpx 0', fontSize: 26, color: '#4A5568' }}>
                <Text style={{ color: '#2C5282', marginRight: 12 }}>✓</Text>
                {req}
              </View>
            ))}
          </View>
        )}
      </View>

      <View className={styles.card}>
        <SectionHeader title="快捷操作" />
        <View style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginTop: 16 }}>
          {[
            { icon: '📝', label: '悼词撰写', onClick: () => Taro.navigateTo({ url: '/pages/eulogy/index' }) },
            { icon: '⚙️', label: '仪式流程', onClick: goCeremony },
            { icon: '⛪', label: '宗教适配', onClick: () => Taro.navigateTo({ url: '/pages/religion/index' }) }
          ].map((action, idx) => (
            <View
              key={idx}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: 24,
                background: '#F7FAFC',
                borderRadius: 12
              }}
              onClick={action.onClick}
            >
              <Text style={{ fontSize: 40, marginBottom: 8 }}>{action.icon}</Text>
              <Text style={{ fontSize: 24, color: '#4A5568' }}>{action.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.bottomBar}>
        <View
          className={classnames(styles.bottomBtn, styles.secondary)}
          onClick={() => Taro.showToast({ title: '编辑档期', icon: 'none' })}
        >
          ✏️ 编辑
        </View>
        {schedule.status === 'booked' && (
          <View
            className={classnames(styles.bottomBtn, styles.primary)}
            onClick={handleStart}
          >
            ▶ 开始仪式
          </View>
        )}
        {schedule.status === 'ongoing' && (
          <View
            className={classnames(styles.bottomBtn, styles.warm)}
            onClick={handleComplete}
          >
            ✓ 完成仪式
          </View>
        )}
        {schedule.status === 'completed' && (
          <View
            className={classnames(styles.bottomBtn, styles.primary)}
            onClick={() => Taro.navigateTo({ url: '/pages/settlement/index' })}
          >
            💰 查看结算
          </View>
        )}
      </View>
    </View>
  );
};

export default ScheduleDetailPage;
