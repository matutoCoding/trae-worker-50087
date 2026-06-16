import React, { useState, useMemo } from 'react';
import { View, Text, Image, Input } from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import SectionHeader from '@/components/SectionHeader';
import StepTimeline from '@/components/StepTimeline';
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
    currentScheduleId,
    getFamilyForSchedule,
    getAppliedCaseFromSchedule,
    saveAppliedCaseToSchedule,
    getFlowStepsFromSchedule,
    saveFlowStepsToSchedule
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
  const [persistedTitle, setPersistedTitle] = useState<string | null>(null);
  const [persistedHighlights, setPersistedHighlights] = useState<string[] | null>(null);
  const [familyRequirements, setFamilyRequirements] = useState<string[]>([]);
  const [familyRiskTags, setFamilyRiskTags] = useState<string[]>([]);

  const initStepsByReligion = (religion: ReligionType) => {
    const templateSteps = mockCeremonySteps[religion] || [];
    setSteps(templateSteps.map(s => ({ ...s })));
  };

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
    setPersistedTitle(casePlanData.caseTitle);
    setPersistedHighlights(casePlanData.highlights);
    if (currentScheduleId) {
      saveAppliedCaseToSchedule(
        currentScheduleId,
        casePlanData.caseTitle,
        casePlanData.highlights,
        mergedSteps as CeremonyStep[]
      );
      saveFlowStepsToSchedule(currentScheduleId, mergedSteps as CeremonyStep[]);
      advanceBoardStep(currentScheduleId, 'flow_confirmed');
    }
    Taro.showToast({ title: `已套用：${casePlanData.caseTitle}`, icon: 'success' });
    clearCasePlan();
  };

  useDidShow(() => {
    const currentSchedule = getCurrentSchedule();
    const sid = currentSchedule?.id || currentScheduleId;

    const family = sid ? getFamilyForSchedule(sid) : undefined;
    if (family) {
      setFamilyRequirements(family.requirements || []);
      setFamilyRiskTags(family.riskTags || []);
    }

    const applied = sid ? getAppliedCaseFromSchedule(sid) : null;
    if (applied?.title && applied.highlights) {
      setPersistedTitle(applied.title);
      setPersistedHighlights(applied.highlights);
      setCaseApplied(applied.title, applied.highlights);
      setCaseAppliedFlag(true);
      if (applied.flowSteps) {
        setSteps(applied.flowSteps);
        if (currentSchedule) {
          setCurrentReligion(currentSchedule.religion);
        }
        console.log('[CeremonyPage] 从档期读取了持久化的流程和亮点');
        return;
      }
    }

    const persistedFlow = sid ? getFlowStepsFromSchedule(sid) : null;
    if (persistedFlow && persistedFlow.length > 0) {
      setSteps(persistedFlow);
      if (currentSchedule) {
        setCurrentReligion(currentSchedule.religion);
      }
      return;
    }

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
            const religion = religionFromSchedule || currentSchedule?.religion || currentReligion;
            setCurrentReligion(religion);
            initStepsByReligion(religion);
          }
        }
      });
      return;
    }

    if (currentSchedule && religionFromSchedule) {
      setCurrentReligion(religionFromSchedule);
      initStepsByReligion(religionFromSchedule);
    } else if (currentSchedule) {
      setCurrentReligion(currentSchedule.religion);
      initStepsByReligion(currentSchedule.religion);
    } else {
      initStepsByReligion(currentReligion);
    }
  });

  usePullDownRefresh(() => {
    setTimeout(() => Taro.stopPullDownRefresh(), 1000);
  });

  const handleReligionChange = (religion: ReligionType) => {
    Taro.showModal({
      title: '切换仪式模板',
      content: `确认切换为${getReligionText(religion)}仪式模板吗？\n当前步骤进度将被重置。`,
      success: (res) => {
        if (res.confirm) {
          setCurrentReligion(religion);
          initStepsByReligion(religion);
          setCaseAppliedFlag(false);
          setPersistedTitle(null);
          setPersistedHighlights(null);
          if (currentScheduleId) {
            saveAppliedCaseToSchedule(currentScheduleId, '', [], []);
          }
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
    setSteps(prev => {
      const updated = prev.map(s =>
        s.id === step.id ? { ...s, completed: !s.completed } : s
      );
      if (currentScheduleId) {
        saveFlowStepsToSchedule(currentScheduleId, updated as CeremonyStep[]);
      }
      return updated;
    });
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

  const displayTitle = persistedTitle || caseAppliedTitle;
  const displayHighlights = persistedHighlights || caseAppliedHighlights;

  const renderFlow = () => (
    <View>
      {(familyRiskTags.length > 0 || familyRequirements.length > 0) && (
        <View className={styles.card} style={{ border: '2rpx solid #E53E3E', background: '#FFF5F5' }}>
          <SectionHeader
            title="⚠️ 家属特别交代"
            subtitle="仪式执行时务必注意"
          />
          {familyRiskTags.length > 0 && (
            <View style={{ marginTop: 8 }}>
              <Text style={{ fontSize: 24, color: '#C53030', fontWeight: 600 }}>风险提醒：</Text>
              <View style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 8 }}>
                {familyRiskTags.map((t, i) => (
                  <Text
                    key={i}
                    style={{
                      padding: '8rpx 20rpx',
                      borderRadius: 8,
                      background: '#FED7D7',
                      color: '#C53030',
                      fontSize: 24,
                      fontWeight: 600
                    }}
                  >
                    ⚠️ {t}
                  </Text>
                ))}
              </View>
            </View>
          )}
          {familyRequirements.length > 0 && (
            <View style={{ marginTop: 16 }}>
              <Text style={{ fontSize: 24, color: '#2C5282', fontWeight: 600 }}>家属需求：</Text>
              <View style={{ marginTop: 8 }}>
                {familyRequirements.map((r, i) => (
                  <View
                    key={i}
                    style={{
                      display: 'flex',
                      padding: '8rpx 0',
                      alignItems: 'flex-start'
                    }}
                  >
                    <Text style={{ color: '#2C5282', marginRight: 12, fontSize: 26 }}>✓</Text>
                    <Text style={{ fontSize: 26, color: '#2A4365', flex: 1, lineHeight: 1.6 }}>{r}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      )}

      {(caseAppliedFlag || (displayHighlights && displayHighlights.length > 0)) && (
        <View className={styles.card} style={{ border: '2rpx solid #D69E2E', background: '#FFFBEB' }}>
          <SectionHeader
            title={`✨ ${displayTitle || '案例执行提示'}`}
            extra={
              <Text style={{ color: '#D69E2E', fontSize: 22 }}>
                {displayHighlights ? `${displayHighlights.length}条亮点` : '参考执行'}
              </Text>
            }
          />
          <Text style={{ fontSize: 24, color: '#92400E', marginTop: 8, display: 'block' }}>
            套用优秀案例的执行建议，作为本次仪式的参考要点（已跟随档期保存）
          </Text>
          <View style={{ marginTop: 16 }}>
            {(displayHighlights || []).map((h, idx) => (
              <View
                key={idx}
                style={{
                  display: 'flex',
                  padding: '16rpx 0',
                  alignItems: 'flex-start',
                  borderBottom: idx !== (displayHighlights?.length || 0) - 1 ? '2rpx solid #FAF089' : 'none'
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

      <View className={styles.card}>
        <SectionHeader
          title="仪式模板"
          extra={caseAppliedFlag || persistedTitle ? <Text style={{ color: '#D69E2E', fontSize: 22 }}>✨ 已套用案例</Text> : undefined}
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
          建议在仪式前30分钟完成完整彩排，确认各环节衔接顺畅、音乐视频播放正常。
        </Text>
        <View style={{ display: 'flex', flexDirection: 'column', marginTop: 24, gap: 12 }}>
          {steps.map((step, idx) => (
            <View
              key={step.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: 16,
                background: step.completed ? '#F0FFF4' : '#F7FAFC',
                borderRadius: 12,
                border: `2rpx solid ${step.completed ? '#C6F6D5' : '#E2E8F0'}`
              }}
            >
              <Text style={{ width: 32, fontWeight: 600, color: step.completed ? '#38A169' : '#718096' }}>
                {step.completed ? '✓' : idx + 1}
              </Text>
              <Text style={{ flex: 1, color: step.completed ? '#2F855A' : '#2D3748' }}>
                {step.title}
              </Text>
              <Text style={{ color: '#A0AEC0', fontSize: 22 }}>{step.duration}分</Text>
            </View>
          ))}
        </View>
        <View
          className={classnames(styles.actionBtn, styles.primary)}
          style={{ marginTop: 24 }}
          onClick={handleRehearsal}
        >
          🎬 开始彩排
        </View>
      </View>
    </View>
  );

  const renderRecord = () => (
    <View>
      <View className={styles.card}>
        <SectionHeader title="现场应变记录" subtitle="记录突发情况和处理方式" />
        <View style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <Input
            style={{
              flex: 1,
              padding: 16,
              background: '#F7FAFC',
              borderRadius: 12,
              border: '2rpx solid #E2E8F0',
              fontSize: 26
            }}
            placeholder="记录现场情况..."
            value={recordInput}
            onInput={e => setRecordInput(e.detail.value)}
          />
          <View
            className={classnames(styles.actionBtn, styles.primary)}
            style={{ padding: '16rpx 32rpx' }}
            onClick={handleSendRecord}
          >
            保存
          </View>
        </View>
        <View style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {records.map(r => (
            <View
              key={r.id}
              style={{
                padding: 16,
                background: '#FFFBEB',
                borderRadius: 12,
                border: '2rpx solid #FEEBC8'
              }}
            >
              <Text style={{ fontSize: 22, color: '#C05621', fontWeight: 600 }}>⏰ {r.time}</Text>
              <Text style={{ display: 'block', marginTop: 8, fontSize: 26, color: '#2D3748', lineHeight: 1.6 }}>
                {r.content}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <View className={styles.container}>
      <View className={styles.currentSchedule}>
        <Text className={styles.currentTitle}>
          🕯 当前仪式 · {getReligionText(currentReligion)}
          {(caseAppliedFlag || persistedTitle) && <Text style={{ marginLeft: 8 }}>✨</Text>}
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
          </>
        ) : (
          <Text style={{ fontSize: 24, color: 'rgba(255,255,255,0.8)' }}>请从「档期详情」进入，自动匹配仪式</Text>
        )}
      </View>

      <View className={styles.tabs}>
        {tabs.map(tab => (
          <View
            key={tab.value}
            className={classnames(styles.tab, activeTab === tab.value && styles.active)}
            onClick={() => setActiveTab(tab.value)}
          >
            {tab.label}
          </View>
        ))}
      </View>

      <View className={styles.content}>
        {activeTab === 'flow' && renderFlow()}
        {activeTab === 'music' && renderMusic()}
        {activeTab === 'video' && renderVideo()}
        {activeTab === 'rehearsal' && renderRehearsal()}
        {activeTab === 'record' && renderRecord()}
      </View>
    </View>
  );
};

export default CeremonyPage;
