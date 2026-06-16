import React, { useState, useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import SectionHeader from '@/components/SectionHeader';
import { mockFamilyContacts } from '@/data/family';
import { FamilyContact, CommunicationRecord } from '@/types';
import { getCommunicationTypeText } from '@/utils';

const FamilyPage: React.FC = () => {
  const [activeFamilyId, setActiveFamilyId] = useState<string>(mockFamilyContacts[0].id);
  const [filterType, setFilterType] = useState<string>('all');

  useDidShow(() => {
    console.log('[FamilyPage] 页面显示');
  });

  const activeFamily = useMemo((): FamilyContact | undefined => {
    return mockFamilyContacts.find(f => f.id === activeFamilyId);
  }, [activeFamilyId]);

  const filteredRecords = useMemo((): CommunicationRecord[] => {
    if (!activeFamily) return [];
    if (filterType === 'all') return activeFamily.communicationRecords;
    return activeFamily.communicationRecords.filter(r => r.type === filterType);
  }, [activeFamily, filterType]);

  const stats = useMemo(() => {
    if (!activeFamily) return { call: 0, message: 0, meeting: 0 };
    const records = activeFamily.communicationRecords;
    return {
      call: records.filter(r => r.type === 'call').length,
      message: records.filter(r => r.type === 'message').length,
      meeting: records.filter(r => r.type === 'meeting').length
    };
  }, [activeFamily]);

  const typeFilters = [
    { key: 'all', label: '全部' },
    { key: 'call', label: '📞 电话' },
    { key: 'message', label: '💬 消息' },
    { key: 'meeting', label: '🤝 面谈' }
  ];

  const reminders = [
    { id: 1, text: '明日8:00前到场准备仪式', time: '2026-06-18 08:00', done: false },
    { id: 2, text: '提醒家属准备逝者照片', time: '2026-06-17 18:00', done: true },
    { id: 3, text: '确认僧人到场时间', time: '2026-06-17 20:00', done: false }
  ];

  return (
    <View className={styles.container}>
      <View className={styles.familySelector}>
        <SectionHeader title="家属选择" subtitle="切换查看不同家属沟通记录" />
        <View className={styles.familyList}>
          {mockFamilyContacts.map(family => (
            <View
              key={family.id}
              className={classnames(styles.familyItem, activeFamilyId === family.id && styles.active)}
              onClick={() => setActiveFamilyId(family.id)}
            >
              <View className={styles.familyAvatar}>
                {family.name.charAt(0)}
              </View>
              <View className={styles.familyInfo}>
                <Text className={styles.familyName}>{family.name}</Text>
                <Text className={styles.familyMeta}>
                  {family.relation} · {family.phone} · {family.communicationRecords.length}条记录
                </Text>
              </View>
              <View
                className={styles.phoneIcon}
                onClick={(e) => {
                  e.stopPropagation();
                  Taro.makePhoneCall({ phoneNumber: family.phone.replace(/\*/g, '0') });
                }}
              >
                📞
              </View>
            </View>
          ))}
        </View>
      </View>

      {activeFamily && (
        <>
          <View className={styles.statsRow}>
            <View className={styles.statCard}>
              <Text className={styles.statNum}>{stats.call}</Text>
              <Text className={styles.statLabel}>📞 电话</Text>
            </View>
            <View className={styles.statCard}>
              <Text className={classnames(styles.statNum, styles.warm)}>{stats.message}</Text>
              <Text className={styles.statLabel}>💬 消息</Text>
            </View>
            <View className={styles.statCard}>
              <Text className={classnames(styles.statNum, styles.gold)}>{stats.meeting}</Text>
              <Text className={styles.statLabel}>🤝 面谈</Text>
            </View>
          </View>

          <View className={styles.card}>
            <SectionHeader title="家属需求清单" subtitle={`共${activeFamily.requirements.length}项需求`} />
            <View className={styles.requirementsList}>
              {activeFamily.requirements.map((req, idx) => (
                <View key={idx} className={styles.reqItem}>
                  <Text className={styles.reqCheck}>✓</Text>
                  <Text className={styles.reqText}>{req}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className={styles.card}>
            <SectionHeader title="沟通记录" extra={<Text style={{ color: '#2C5282', fontSize: 24 }}>添加 +</Text>} />
            <View className={styles.filterTabs}>
              {typeFilters.map(f => (
                <View
                  key={f.key}
                  className={classnames(styles.filterTab, filterType === f.key && styles.active)}
                  onClick={() => setFilterType(f.key)}
                >
                  {f.label}
                </View>
              ))}
            </View>
            <View className={styles.timeline} style={{ marginTop: 32 }}>
              {filteredRecords.map((record, idx) => (
                <View key={record.id} className={styles.timelineItem}>
                  <View className={classnames(styles.timelineDot, record.type)} />
                  <View className={styles.recordCard}>
                    <View className={styles.recordHeader}>
                      <Text className={classnames(styles.recordType, record.type)}>
                        {record.type === 'call' && '📞 '}
                        {record.type === 'message' && '💬 '}
                        {record.type === 'meeting' && '🤝 '}
                        {getCommunicationTypeText(record.type)}
                      </Text>
                      <Text className={styles.recordDate}>{record.date}</Text>
                    </View>
                    <Text className={styles.recordContent}>{record.content}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View className={styles.card}>
            <SectionHeader title="重要提醒" subtitle="待办事项及时跟进" />
            <View className={styles.reminderList}>
              {reminders.map(r => (
                <View key={r.id} className={classnames(styles.reminderItem, r.done && styles.done)}>
                  <Text className={styles.reminderIcon}>{r.done ? '✅' : '⏰'}</Text>
                  <View className={styles.reminderContent}>
                    <Text className={styles.reminderText}>{r.text}</Text>
                    <Text className={styles.reminderTime}>截止：{r.time}</Text>
                  </View>
                  <Text className={classnames(styles.reminderAction, r.done && styles.done)}>
                    {r.done ? '已完成' : '去处理'}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </>
      )}

      <View className={styles.bottomBar}>
        <View
          className={classnames(styles.bottomBtn, styles.warm)}
          onClick={() => Taro.showToast({ title: '拨打电话', icon: 'none' })}
        >
          📞 联系家属
        </View>
        <View
          className={classnames(styles.bottomBtn, styles.primary)}
          onClick={() => Taro.showToast({ title: '新增记录', icon: 'none' })}
        >
          ✏️ 记录沟通
        </View>
      </View>
    </View>
  );
};

export default FamilyPage;
