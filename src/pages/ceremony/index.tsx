import React, { useState, useMemo } from 'react';
import { View, Text, Image, Input, ScrollView } from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import SectionHeader from '@/components/SectionHeader';
import StepTimeline from '@/components/StepTimeline';
import EmptyState from '@/components/EmptyState';
import { CeremonyStep, MusicItem } from '@/types';
import { mockCeremonySteps, mockMusicList } from '@/data/ceremony';
import { getReligionText } from '@/utils';

type TabType = 'flow' | 'music' | 'video' | 'rehearsal' | 'record';

interface EmergencyRecord {
  id: string;
  time: string;
  content: string;
}

const CeremonyPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('flow');
  const [currentReligion] = useState<string>('buddhism');
  const [steps, setSteps] = useState<CeremonyStep[]>(mockCeremonySteps['buddhism'] || []);
  const [playingMusic, setPlayingMusic] = useState<string>('');
  const [records, setRecords] = useState<EmergencyRecord[]>([
    { id: '1', time: '09:15', content: '家属情绪波动较大，已安排家属休息室并提供心理疏导。' },
    { id: '2', time: '09:45', content: '音响设备出现短暂故障，已切换备用设备，仪式延后2分钟。' }
  ]);
  const [recordInput, setRecordInput] = useState('');

  useDidShow(() => {
    console.log('[CeremonyPage] 页面显示');
  });

  usePullDownRefresh(() => {
    console.log('[CeremonyPage] 下拉刷新');
    setTimeout(() => Taro.stopPullDownRefresh(), 1000);
  });

  const progress = useMemo(() => {
    const completed = steps.filter(s => s.completed).length;
    const total = steps.length;
    const totalDuration = steps.reduce((sum, s) => sum + s.duration, 0);
    const completedDuration = steps.filter(s => s.completed).reduce((sum, s) => sum + s.duration, 0);
    return { completed, total, totalDuration, completedDuration, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }, [steps]);

  const handleStepClick = (step: CeremonyStep) => {
    setSteps(prev => prev.map(s =>
      s.id === step.id ? { ...s, completed: !s.completed } : s
    ));
    Taro.showToast({
      title: step.completed ? '已重置步骤' : '步骤已完成',
      icon: 'success'
    });
  };

  const handleMusicClick = (music: MusicItem) => {
    if (playingMusic === music.id) {
      setPlayingMusic('');
      Taro.showToast({ title: '暂停播放', icon: 'none' });
    } else {
      setPlayingMusic(music.id);
      Taro.showToast({ title: `正在播放：${music.name}`, icon: 'none' });
    }
  };

  const handleSendRecord = () => {
    if (!recordInput.trim()) {
      Taro.showToast({ title: '请输入内容', icon: 'none' });
      return;
    }
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setRecords(prev => [
      { id: Date.now().toString(), time, content: recordInput },
      ...prev
    ]);
    setRecordInput('');
    Taro.showToast({ title: '记录已保存', icon: 'success' });
  };

  const handleRehearsal = () => {
    Taro.showModal({
      title: '流程彩排',
      content: '确定要开始流程彩排吗？将按照仪式流程顺序模拟执行。',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '彩排开始', icon: 'loading', duration: 2000 });
        }
      }
    });
  };

  const tabs: { value: TabType; label: string }[] = [
    { value: 'flow', label: '仪式流程' },
    { value: 'music', label: '音乐选配' },
    { value: 'video', label: '追思视频' },
    { value: 'rehearsal', label: '流程彩排' },
    { value: 'record', label: '应变记录' }
  ];

  const renderFlow = () => (
    <View>
      <View className={styles.card}>
        <View className={styles.progressBar}>
          <View className={styles.progressStat}>
            <Text className={styles.progressNum}>{progress.completed}/{progress.total}</Text>
            <Text className={styles.progressLabel}>完成步骤</Text>
          </View>
          <View className={styles.progressDivider}></View>
          <View className={styles.progressStat}>
            <Text className={styles.progressNum}>{progress.percent}%</Text>
            <Text className={styles.progressLabel}>进度</Text>
          </View>
          <View className={styles.progressDivider}></View>
          <View className={styles.progressStat}>
            <Text className={styles.progressNum}>{progress.completedDuration}分</Text>
            <Text className={styles.progressLabel}>已用时间</Text>
          </View>
        </View>
      </View>

      <StepTimeline steps={steps} onStepClick={handleStepClick} />
    </View>
  );

  const renderMusic = () => (
    <View>
      <SectionHeader title="仪式音乐库" subtitle="点击播放/暂停" />
      <View className={styles.musicGrid}>
        {mockMusicList.map(music => (
          <View
            key={music.id}
            className={classnames(styles.musicCard, playingMusic === music.id && styles.playing)}
            onClick={() => handleMusicClick(music)}
          >
            <View className={styles.musicIcon}>
              {playingMusic === music.id ? '⏸' : '🎵'}
            </View>
            <Text className={styles.musicName}>{music.name}</Text>
            <Text className={styles.musicArtist}>{music.artist}</Text>
            <View className={styles.musicDuration}>
              {music.duration} · {music.category}
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderVideo = () => (
    <View>
      <SectionHeader title="追思视频" subtitle="可预览播放" />
      <View className={styles.videoCard}>
        <View className={styles.videoCover}>
          <Image
            src="https://picsum.photos/id/1015/750/400"
            className={styles.videoImg}
            mode="aspectFill"
          />
          <View className={styles.videoOverlay}>
            <View className={styles.playBtn}>▶</View>
          </View>
        </View>
        <View className={styles.videoInfo}>
          <Text className={styles.videoTitle}>张建国先生生平纪念视频</Text>
          <View className={styles.videoMeta}>
            <Text>时长：08分30秒</Text>
            <Text>张建国 · 享年78岁</Text>
          </View>
        </View>
      </View>

      <View className={styles.card}>
        <SectionHeader title="视频操作" />
        <View className={styles.actionRow}>
          <View
            className={classnames(styles.actionBtn, styles.secondary)}
            onClick={() => Taro.showToast({ title: '编辑视频', icon: 'none' })}
          >
            ✏️ 编辑
          </View>
          <View
            className={classnames(styles.actionBtn, styles.primary)}
            onClick={() => Taro.showToast({ title: '导出视频', icon: 'none' })}
          >
            📤 导出
          </View>
        </View>
      </View>
    </View>
  );

  const renderRehearsal = () => (
    <View>
      <View className={styles.card}>
        <SectionHeader title="流程彩排" subtitle="模拟仪式流程，熟悉每个环节" />
        <Text style={{ fontSize: '28rpx', color: '#4A5568', lineHeight: 1.8 }}>
          彩排模式将按照当前的仪式流程顺序进行模拟，帮助您熟悉每个环节的内容、时间和主持要点。
          彩排过程中可以暂停、跳过或重复某个步骤。
        </Text>
        <View className={styles.actionRow}>
          <View
            className={classnames(styles.actionBtn, styles.secondary)}
            onClick={() => Taro.showToast({ title: '查看彩排要点', icon: 'none' })}
          >
            📋 彩排要点
          </View>
          <View
            className={classnames(styles.actionBtn, styles.primary)}
            onClick={handleRehearsal}
          >
            ▶ 开始彩排
          </View>
        </View>
      </View>

      <View className={styles.card}>
        <SectionHeader title="彩排进度" subtitle="本次仪式" />
        <ScrollView>
          {steps.map(step => (
            <View
              key={step.id}
              style={{
                display: 'flex',
                padding: '20rpx 0',
                borderBottom: step.id !== steps[steps.length - 1].id ? '2rpx solid #EDF2F7' : 'none',
                alignItems: 'center'
              }}
            >
              <View style={{
                width: '48rpx',
                height: '48rpx',
                borderRadius: '50%',
                background: step.completed ? '#38A169' : '#EDF2F7',
                color: step.completed ? '#fff' : '#718096',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24rpx',
                marginRight: '20rpx',
                flexShrink: 0
              }}>
                {step.completed ? '✓' : step.order}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: '28rpx', color: '#1A202C', fontWeight: '500' }}>{step.title}</Text>
                <Text style={{ fontSize: '24rpx', color: '#718096', marginTop: '8rpx' }}>{step.duration}分钟 · {step.description}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  const renderRecord = () => (
    <View>
      <SectionHeader title="现场应变记录" subtitle="记录仪式过程中的突发情况和处理方式" />

      {records.length > 0 ? (
        records.map(record => (
          <View key={record.id} className={styles.recordCard}>
            <Text className={styles.recordTime}>⏰ {record.time}</Text>
            <Text className={styles.recordContent}>{record.content}</Text>
          </View>
        ))
      ) : (
        <EmptyState icon="📝" title="暂无记录" description="如有突发情况，请及时记录" />
      )}

      <View className={styles.card} style={{ marginTop: '24rpx' }}>
        <SectionHeader title="新增记录" />
        <View className={styles.inputArea}>
          <Input
            className={styles.textInput}
            placeholder="请输入应变记录..."
            value={recordInput}
            onInput={e => setRecordInput(e.detail.value)}
          />
          <View className={styles.sendBtn} onClick={handleSendRecord}>
            保存
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View className={styles.container}>
      <View className={styles.currentSchedule}>
        <Text className={styles.currentTitle}>🕯 当前仪式 · {getReligionText(currentReligion)}</Text>
        <Text className={styles.currentName}>张建国先生</Text>
        <Text style={{ fontSize: '26rpx', opacity: 0.9 }}>佛教传统仪式 · 追思厅A</Text>
        <View className={styles.currentInfo}>
          <Text>⏰ 08:30-10:30</Text>
          <Text>📍 市殡仪馆</Text>
        </View>
      </View>

      <View className={styles.tabBar}>
        {tabs.map(tab => (
          <View
            key={tab.value}
            className={classnames(styles.tabItem, activeTab === tab.value && styles.active)}
            onClick={() => setActiveTab(tab.value)}
          >
            {tab.label}
          </View>
        ))}
      </View>

      {activeTab === 'flow' && renderFlow()}
      {activeTab === 'music' && renderMusic()}
      {activeTab === 'video' && renderVideo()}
      {activeTab === 'rehearsal' && renderRehearsal()}
      {activeTab === 'record' && renderRecord()}
    </View>
  );
};

export default CeremonyPage;
