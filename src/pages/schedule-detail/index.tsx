import React, { useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import StatusBadge from '@/components/StatusBadge';
import SectionHeader from '@/components/SectionHeader';
import { ScheduleItem } from '@/types';
import { useAppStore } from '@/store/AppContext';
import { getFamilyByScheduleId } from '@/data/family';
import { formatDateCN, getWeekDay, getReligionText, formatMoney } from '@/utils';

const ScheduleDetailPage: React.FC = () => {
  const router = useRouter();
  const id = router.params.id || 's001';
  const {
    schedules,
    updateScheduleStatus,
    setCurrentScheduleId,
    setReligionFromSchedule
  } = useAppStore();
  const [schedule, setSchedule] = useState<ScheduleItem | null>(null);

  const refreshSchedule = () => {
    const data = schedules.find(s => s.id === id);
    if (data) {
      setSchedule(data);
      // 自动设置当前档期，供追思流程页使用
      setCurrentScheduleId(data.id);
      setReligionFromSchedule(data.religion);
    } else {
      Taro.showToast({ title: '档期不存在', icon: 'error' });
    }
  };

  useDidShow(() => {
    console.log('[ScheduleDetailPage] 页面显示，档期ID:', id);
    refreshSchedule();
  });

  if (!schedule) return null;

  const family = getFamilyByScheduleId(schedule.id);
  const genderText = schedule.gender === 'male' ? '先生' : '女士';

  // 开始仪式：booked → ongoing
  const handleStart = () => {
    Taro.showModal({
      title: '开始仪式',
      content: `确认开始 ${schedule.deceasedName}${genderText} 的告别仪式吗？\n开始后将自动进入追思流程页面。`,
      confirmText: '开始仪式',
      success: (res) => {
        if (res.confirm) {
          updateScheduleStatus(schedule.id, 'ongoing');
          Taro.showToast({ title: '仪式已开始', icon: 'success' });
          setTimeout(() => {
            refreshSchedule();
            // 自动跳转到追思流程
            Taro.switchTab({ url: '/pages/ceremony/index' });
          }, 800);
        }
      }
    });
  };

  // 完成仪式：ongoing → completed，并引导去结算
  const handleComplete = () => {
    Taro.showModal({
      title: '完成仪式',
      content: `确认 ${schedule.deceasedName}${genderText} 的告别仪式已圆满完成吗？\n完成后可进入结算流程。`,
      confirmText: '已完成',
      confirmColor: '#C53030',
      success: (res) => {
        if (res.confirm) {
          updateScheduleStatus(schedule.id, 'completed');
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

  // 去追思流程页
  const goCeremony = () => {
    setCurrentScheduleId(schedule.id);
    setReligionFromSchedule(schedule.religion);
    Taro.switchTab({ url: '/pages/ceremony/index' });
  };

  return (
    <View className={styles.container}>
      <View className={styles.headerCard}>
        <StatusBadge status={schedule.status} />
        <View style={{ height: 20 }}></View>
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
          extra={<Text style={{ color: '#2C5282', fontSize: 24 }}>查看沟通记录 ›</Text>}
        />
        {family && (
          <View
            className={styles.familyContact}
            onClick={() => Taro.navigateTo({ url: '/pages/family/index' })}
          >
            <View className={styles.familyAvatar}>
              {family.name.charAt(0)}
            </View>
            <View className={styles.familyInfo}>
              <Text className={styles.familyName}>{family.name}</Text>
              <Text className={styles.familyRel}>{family.relation} · {family.phone}</Text>
            </View>
            <View className={styles.phoneBtn} onClick={(e) => {
              e.stopPropagation();
              Taro.makePhoneCall({ phoneNumber: family.phone.replace(/\*/g, '0') });
            }}>
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
                borderRadius: 12,
              }}
              onClick={action.onClick}
            >
              <Text style={{ fontSize: 40, marginBottom: 8 }}>{action.icon}</Text>
              <Text style={{ fontSize: 24, color: '#4A5568' }}>{action.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 状态流程说明 */}
      {schedule.status !== 'completed' && (
        <View className={styles.card}>
          <SectionHeader title="当前进度" />
          <View style={{ display: 'flex', marginTop: 16, alignItems: 'center', gap: 8 }}>
            {[
              { label: '已预约', status: 'booked', icon: '📋' },
              { label: '进行中', status: 'ongoing', icon: '▶️' },
              { label: '已完成', status: 'completed', icon: '✅' }
            ].map((step, idx) => {
              const order = ['booked', 'ongoing', 'completed'];
              const curIdx = order.indexOf(schedule.status);
              const stepIdx = order.indexOf(step.status);
              const isDone = stepIdx < curIdx || schedule.status === step.status;
              const isActive = schedule.status === step.status;
              return (
                <View key={step.status} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <View
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      flex: 1
                    }}
                  >
                    <View
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 28,
                        background: isActive ? '#D69E2E' : isDone ? '#38A169' : '#E2E8F0',
                        color: isActive || isDone ? '#fff' : '#718096',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 24,
                        fontWeight: 600,
                        marginBottom: 8
                      }}
                    >
                      {step.icon}
                    </View>
                    <Text
                      style={{
                        fontSize: 22,
                        color: isActive ? '#D69E2E' : isDone ? '#38A169' : '#A0AEC0',
                        fontWeight: isActive || isDone ? 600 : 400
                      }}
                    >
                      {step.label}
                    </Text>
                  </View>
                  {idx < 2 && (
                    <View
                      style={{
                        height: 4,
                        flex: 1,
                        background: stepIdx < curIdx ? '#38A169' : '#E2E8F0',
                        borderRadius: 2,
                        margin: '0 8rpx 32rpx 8rpx'
                      }}
                    />
                  )}
                </View>
              );
            })}
          </View>
        </View>
      )}

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
