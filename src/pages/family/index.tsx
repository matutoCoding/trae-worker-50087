import React, { useState, useMemo } from 'react';
import { View, Text, Input } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import SectionHeader from '@/components/SectionHeader';
import { FamilyContact, CommunicationRecord } from '@/types';
import { getCommunicationTypeText } from '@/utils';
import { useAppStore } from '@/store/AppContext';

const FamilyPage: React.FC = () => {
  const {
    currentScheduleId,
    getFamilyForSchedule,
    getCurrentSchedule,
    addCommunicationRecord,
    familyMap
  } = useAppStore();

  const [activeFamilyId, setActiveFamilyId] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  const [newRecordContent, setNewRecordContent] = useState('');
  const [newRecordType, setNewRecordType] = useState<'call' | 'message' | 'meeting'>('call');
  const [showAddForm, setShowAddForm] = useState(false);
  const [scheduleName, setScheduleName] = useState<string>('');

  useDidShow(() => {
    console.log('[FamilyPage] 页面显示, currentScheduleId:', currentScheduleId);
    const schedule = getCurrentSchedule();
    if (schedule) {
      setScheduleName(`${schedule.deceasedName}${schedule.gender === 'male' ? '先生' : '女士'} · ${schedule.ceremonyType}`);
    } else {
      setScheduleName('');
    }
    if (currentScheduleId) {
      const fam = getFamilyForSchedule(currentScheduleId);
      if (fam) {
        setActiveFamilyId(fam.id);
      }
    }
  });

  const allFamilies = useMemo((): FamilyContact[] => {
    const fromStore = Object.values(familyMap);
    if (currentScheduleId) {
      const current = fromStore.find(f => f.scheduleId === currentScheduleId);
      if (current) return [current];
      const fallback = getFamilyForSchedule(currentScheduleId);
      return fallback ? [fallback] : fromStore;
    }
    return fromStore;
  }, [familyMap, currentScheduleId]);

  const activeFamily = useMemo((): FamilyContact | undefined => {
    if (activeFamilyId) {
      const found = allFamilies.find(f => f.id === activeFamilyId);
      if (found) return found;
    }
    return allFamilies[0];
  }, [activeFamilyId, allFamilies]);

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

  const handleAddRecord = () => {
    if (!newRecordContent.trim()) {
      Taro.showToast({ title: '请输入沟通内容', icon: 'none' });
      return;
    }
    const sid = currentScheduleId || activeFamily?.scheduleId;
    if (!sid) {
      Taro.showToast({ title: '请先关联档期', icon: 'none' });
      return;
    }
    addCommunicationRecord(sid, {
      type: newRecordType,
      content: newRecordContent.trim()
    });
    setNewRecordContent('');
    setShowAddForm(false);
    Taro.showToast({ title: '记录已保存', icon: 'success' });
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

      <View className={styles.familySelector}>
        <SectionHeader
          title={currentScheduleId ? '本场家属联系人' : '家属选择'}
          subtitle={currentScheduleId ? '当前档期关联的家属' : '切换查看不同家属沟通记录'}
        />
        <View className={styles.familyList}>
          {allFamilies.map(family => (
            <View
              key={family.id}
              className={classnames(styles.familyItem, (!activeFamilyId || activeFamilyId === family.id) && styles.active)}
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
              {activeFamily.requirements.length === 0 && (
                <Text style={{ fontSize: 24, color: '#A0AEC0', padding: 16 }}>暂无家属需求，沟通后可添加</Text>
              )}
            </View>
          </View>

          <View className={styles.card}>
            <SectionHeader
              title="沟通记录"
              extra={
                <Text
                  style={{ color: '#2C5282', fontSize: 24 }}
                  onClick={() => setShowAddForm(!showAddForm)}
                >
                  {showAddForm ? '收起' : '添加 +'}
                </Text>
              }
            />
            {showAddForm && (
              <View style={{ padding: 16, background: '#F7FAFC', borderRadius: 12, marginBottom: 16 }}>
                <Text style={{ fontSize: 24, color: '#4A5568', marginBottom: 12 }}>沟通类型：</Text>
                <View style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                  {[
                    { key: 'call', label: '📞 电话' },
                    { key: 'message', label: '💬 消息' },
                    { key: 'meeting', label: '🤝 面谈' }
                  ].map(t => (
                    <View
                      key={t.key}
                      style={{
                        padding: '12rpx 24rpx',
                        borderRadius: 8,
                        background: newRecordType === t.key ? '#2C5282' : '#EDF2F7',
                        color: newRecordType === t.key ? '#fff' : '#4A5568',
                        fontSize: 24
                      }}
                      onClick={() => setNewRecordType(t.key as any)}
                    >
                      {t.label}
                    </View>
                  ))}
                </View>
                <Text style={{ fontSize: 24, color: '#4A5568', marginBottom: 12 }}>沟通内容：</Text>
                <Input
                  style={{
                    padding: 16,
                    background: '#fff',
                    borderRadius: 8,
                    fontSize: 26,
                    border: '2rpx solid #E2E8F0'
                  }}
                  placeholder="请输入本次沟通的内容..."
                  value={newRecordContent}
                  onInput={e => setNewRecordContent(e.detail.value)}
                />
                <View
                  style={{
                    marginTop: 16,
                    padding: 16,
                    textAlign: 'center',
                    background: '#2C5282',
                    color: '#fff',
                    borderRadius: 8,
                    fontSize: 26,
                    fontWeight: 600
                  }}
                  onClick={handleAddRecord}
                >
                  ✓ 保存沟通记录
                </View>
              </View>
            )}
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
              {filteredRecords.length === 0 && (
                <Text style={{ fontSize: 24, color: '#A0AEC0', padding: 16, textAlign: 'center' }}>
                  暂无沟通记录，点击上方「添加」开始记录
                </Text>
              )}
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
          onClick={() => {
            if (activeFamily) {
              Taro.makePhoneCall({ phoneNumber: activeFamily.phone.replace(/\*/g, '0') });
            } else {
              Taro.showToast({ title: '请先选择家属', icon: 'none' });
            }
          }}
        >
          📞 联系家属
        </View>
        <View
          className={classnames(styles.bottomBtn, styles.primary)}
          onClick={() => setShowAddForm(true)}
        >
          ✏️ 记录沟通
        </View>
      </View>
    </View>
  );
};

export default FamilyPage;
