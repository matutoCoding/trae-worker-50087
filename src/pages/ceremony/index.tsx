import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, Image, Input, ScrollView } from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import SectionHeader from '@/components/SectionHeader';
import StepTimeline from '@/components/StepTimeline';
import EmptyState from '@/components/EmptyState';
import { CeremonyStep, MusicItem, ReligionType } from '@/types';
import { mockCeremonySteps, mockMusicList } from '@/data/ceremony';
import { useAppStore } from '@/store/AppContext';
import { getReligionText } from '@/utils';

type TabType = 'flow' | 'music' | 'video' | 'rehearsal' | 'record';

interface EmergencyRecord {
  id: string;
  time: string;
  content: string;
}

interface CustomStep {
  id: string;
  title: string;
  description: string;
  duration: number;
  order: number;
  completed: boolean;
}

const CeremonyPage: React.FC = () => {
  const {
    getCurrentSchedule,
    religionFromSchedule,
    casePlanData,
    clearCasePlan,
    caseAppliedHighlights,
    caseAppliedTitle,
    setCaseApplied,
    advanceBoardStep,
    currentScheduleId
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<TabType>('flow');
  const [currentReligion, setCurrentReligion] = useState<ReligionType>('buddhism');
  const [steps, setSteps] = useState<(CeremonyStep | CustomStep)[]>([]);
  const [playingMusic, setPlayingMusic] = useState<string>('');
  const [records, setRecords] = useState<EmergencyRecord[]>([
    { id: '1', time: '09:15', content: '家属情绪波动较大，已安排家属休息室并提供心理疏导。' },
    { id: '2', time: '09:45', content: '音响设备出现短暂故障，已切换备用设备，仪式延后2分钟。' }
  ]);
  const [recordInput, setRecordInput] = useState('');
  const [caseAppliedFlag, setCaseAppliedFlag] = useState(false);

  // ============================================
  // 根据档期/宗教自动切换流程模板
  // ============================================
  const initStepsByReligion = (religion: ReligionType) => {
    const templateSteps = mockCeremonySteps[religion] || [];
    setSteps(templateSteps.map(s => ({ ...s })));
  };

  // ============================================
  // 从案例套用方案
  // ============================================
  const applyCasePlan = () => {
    if (!casePlanData) return;
    const baseSteps = mockCeremonySteps[casePlanData.religion] || [];
    const mergedSteps = baseSteps.map((step, idx) => ({
      ...step,
      description: idx < casePlanData.flow.length
        ? `${step.description}（参考案例：${casePlanData.flow[idx]}）`
        : step.description
    }));
    setSteps(mergedSteps);
    setCurrentReligion(casePlanData.religion);
    setCaseAppliedFlag(true);
    setCaseApplied(casePlanData.caseTitle, casePlanData.highlights);
    if (currentScheduleId) {
      advanceBoardStep(currentScheduleId, 'flow_confirmed');
    }
    Taro.showToast({ title: `已套用：${casePlanData.caseTitle}`, icon: 'success' });
    clearCasePlan();
  };

  useDidShow(() => {
    const currentSchedule = getCurrentSchedule();
    console.log('[CeremonyPage] 当前档期:', currentSchedule);
    console.log('[CeremonyPage] 宗教来源:', religionFromSchedule);
    console.log('[CeremonyPage] 案例方案:', casePlanData);

    // 优先级1：如果有案例套用数据，优先处理
    if (casePlanData && !caseAppliedFlag) {
      Taro.showModal({
        title: '📋 套用案例方案',
        content: `检测到优秀案例「${casePlanData.caseTitle}」\n是否将其流程和亮点应用到当前仪式？`,
        confirmText: '立即套用',
        cancelText: '暂不套用',
        success: (res) => {
          if (res.confirm) {
            applyCasePlan();
          } else {
            clearCasePlan();
            // 用档期宗教初始化
            const religion = religionFromSchedule || currentReligion;
            setCurrentReligion(religion);
            initStepsByReligion(religion);
          }
        }
      });
      return;
    }

    // 优先级2：从档期读取宗教类型
    if (currentSchedule && religionFromSchedule) {
      setCurrentReligion(religionFromSchedule);
      initStepsByReligion(religionFromSchedule);
    } else {
      initStepsByReligion(currentReligion);
    }
  });

  usePullDownRefresh(() => {
    console.log('[CeremonyPage] 下拉刷新');
    setTimeout(() => Taro.stopPullDownRefresh(), 1000);
  });

  // 手动切换宗教
  const handleReligionChange = (religion: ReligionType) => {
    Taro.showModal({
      title: '切换仪式模板',
      content: `确认切换为${getReligionText(religion)}仪式模板吗？\n当前步骤进度将被重置。`,
      success: (res) => {
        if (res.confirm) {
          setCurrentReligion(religion);
          initStepsByReligion(religion);
          setCaseAppliedFlag(false);
        }
      }
    });
  };

  const progress = useMemo(() => {
    const completed = steps.filter(s => s.completed).length;
    const total = steps.length;
    const totalDuration = steps.reduce((sum, s) => sum + s.duration, 0);
    const completedDuration = steps.filter(s => s.completed).reduce((sum, s) => sum + s.duration, 0);
    return {
      completed,
      total,
      totalDuration,
      completedDuration,
      percent: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }, [steps]);

  const currentSchedule = getCurrentSchedule();

  const handleStepClick = (step: CeremonyStep | CustomStep) => {
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
      content: `确定要开始${getReligionText(currentReligion)}仪式流程彩排吗？`,
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

  const religionTabs: { key: ReligionType; label: string }[] = [
    { key: 'buddhism', label: '☸️ 佛' },
    { key: 'taoism', label: '☯️ 道' },
    { key: 'christianity', label: '✝️ 基' },
    { key: 'catholicism', label: '⛪ 天' },
    { key: 'none', label: '🌸 无' }
  ];

  const renderFlow = () => (
    <View>
      {/* 案例执行提示（持久化亮点） */}
      {(caseAppliedFlag || (caseAppliedHighlights && caseAppliedHighlights.length > 0)) && (
        <View className={styles.card} style={{ border: '2rpx solid #D69E2E', background: '#FFFBEB' }}>
          <SectionHeader
            title={`✨ ${caseAppliedTitle || '案例执行提示'}`}
            extra={
              <Text style={{ color: '#D69E2E', fontSize: 22 }}>
                {caseAppliedHighlights ? `${caseAppliedHighlights.length}条亮点` : '参考执行'}
              </Text>
            }
          />
          <Text style={{ fontSize: 24, color: '#92400E', marginTop: 8, display: 'block' }}>
            套用优秀案例的执行建议，作为本次仪式的参考要点
          </Text>
          <View style={{ marginTop: 16 }}>
            {(caseAppliedHighlights || []).map((h, idx) => (
              <View
                key={idx}
                style={{
                  display: 'flex',
                  padding: '16rpx 0',
                  alignItems: 'flex-start',
                  borderBottom: idx !== (caseAppliedHighlights?.length || 0) - 1 ? '2rpx solid #FAF089' : 'none'
                }}
              >
                <Text style={{ color: '#D69E2E', marginRight: 12, fontWeight: 600 }}>
                  ✨{idx + 1}.
                </Text>
                <Text style={{ fontSize: 26, color: '#744210', flex: 1, lineHeight: 1.6 }}>{h}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 宗教切换栏 */}
      <View className={styles.card}>
        <SectionHeader
          title="仪式模板"
          extra={caseAppliedFlag ? <Text style={{ color: '#D69E2E', fontSize: 22 }}>✨ 已套用案例</Text> : undefined}
        />
        <Text style={{ fontSize: 24, color: '#718096', display: 'block', marginBottom: 16 }}>
          {currentSchedule
            ? `当前档期：${currentSchedule.deceasedName} · ${currentSchedule.ceremonyType}`
            : '手动选择仪式模板，或从「档期详情」进入自动匹配'}
        </Text>
        <View style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {religionTabs.map(tab => (
            <View
              key={tab.key}
              className={classnames(
                styles.optionItem,
                currentReligion === tab.key && styles.active
              )}
              style={{
                padding: '16rpx 28rpx',
                borderRadius: 12,
                background: currentReligion === tab.key
                  ? 'rgba(44, 82, 130, 0.1)'
                  : '#F7FAFC',
                border: `2rpx solid ${currentReligion === tab.key ? '#2C5282' : '#E2E8F0'}`,
                color: currentReligion === tab.key ? '#2C5282' : '#718096',
                fontSize: 24,
                fontWeight: currentReligion === tab.key ? 600 : 400
              }}
              onClick={() => handleReligionChange(tab.key)}
            >
              {tab.label}
            </View>
          ))}
        </View>
      </View>

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

      <StepTimeline steps={steps as CeremonyStep[]} onStepClick={handleStepClick} />
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
          <Text className={styles.videoTitle}>
            {currentSchedule
              ? `${currentSchedule.deceasedName}生平纪念视频`
              : '张建国先生生平纪念视频'}
          </Text>
          <View className={styles.videoMeta}>
            <Text>时长：08分30秒</Text>
            <Text>
              {currentSchedule
                ? `${currentSchedule.deceasedName} · 享年${currentSchedule.age}岁`
                : '张建国 · 享年78岁'}
            </Text>
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
        <SectionHeader title="流程彩排" subtitle={`${getReligionText(currentReligion)}仪式 · ${steps.length}个环节`} />
        <Text style={{ fontSize: '28rpx', color: '#4A5568', lineHeight: 1.8 }}>
          彩排模式将按照当前的仪式流程顺序进行模拟，帮助您熟悉每个环节的内容、时间和主持要点。
          彩排过程中可以暂停、跳过或重复某个步骤。
        </Text>
        <View className={styles.actionRow}>
          <View
            className={classnames(styles.actionBtn, styles.secondary)}
            onClick={() => {
              const tips = steps.map((s, i) => `${i + 1}. ${s.title}`).join('\n');
              Taro.showModal({
                title: '彩排要点',
                content: tips,
                showCancel: false
              });
            }}
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
          {steps.map((step, idx) => (
            <View
              key={step.id}
              style={{
                display: 'flex',
                padding: '20rpx 0',
                borderBottom: idx !== steps.length - 1 ? '2rpx solid #EDF2F7' : 'none',
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
                <Text style={{ fontSize: '24rpx', color: '#718096', marginTop: '8rpx' }}>
                  {step.duration}分钟 · {step.description}
                </Text>
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
        <Text className={styles.currentTitle}>
          🕯 当前仪式 · {getReligionText(currentReligion)}
          {caseAppliedFlag && <Text style={{ marginLeft: 8 }}>✨</Text>}
        </Text>
        {currentSchedule ? (
          <>
            <Text className={styles.currentName}>
              {currentSchedule.deceasedName}
              {currentSchedule.gender === 'male' ? '先生' : '女士'}
            </Text>
            <Text style={{ fontSize: '26rpx', opacity: 0.9 }}>
              {currentSchedule.ceremonyType} · {currentSchedule.hallName}
            </Text>
            <View className={styles.currentInfo}>
              <Text>⏰ {currentSchedule.time}</Text>
              <Text>📍 {currentSchedule.location}</Text>
            </View>
          </>
        ) : (
          <>
            <Text className={styles.currentName}>示例仪式</Text>
            <Text style={{ fontSize: '26rpx', opacity: 0.9 }}>
              {getReligionText(currentReligion)}传统仪式 · 追思厅A
            </Text>
            <View className={styles.currentInfo}>
              <Text>⏰ 08:30-10:30</Text>
              <Text>📍 市殡仪馆</Text>
            </View>
          </>
        )}
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
