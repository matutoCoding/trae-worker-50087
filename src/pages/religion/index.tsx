import React, { useState, useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import SectionHeader from '@/components/SectionHeader';
import { mockReligionConfigs } from '@/data/ceremony';
import { mockCeremonySteps } from '@/data/ceremony';
import { ReligionConfig, ReligionType } from '@/types';
import { getReligionText } from '@/utils';

const ReligionPage: React.FC = () => {
  const [activeType, setActiveType] = useState<ReligionType>('buddhism');

  useDidShow(() => {
    console.log('[ReligionPage] 页面显示');
  });

  const religionTabs: Array<{ type: ReligionType; icon: string; name: string }> = [
    { type: 'buddhism', icon: '☸️', name: '佛教' },
    { type: 'taoism', icon: '☯️', name: '道教' },
    { type: 'christianity', icon: '✝️', name: '基督教' },
    { type: 'catholicism', icon: '⛪', name: '天主教' },
    { type: 'none', icon: '🌸', name: '无宗教' }
  ];

  const activeConfig = useMemo((): ReligionConfig | undefined => {
    return mockReligionConfigs.find(r => r.type === activeType);
  }, [activeType]);

  const activeSteps = useMemo(() => {
    return mockCeremonySteps[activeType] || [];
  }, [activeType]);

  if (!activeConfig) return null;

  return (
    <View className={styles.container}>
      <View className={styles.religionTabs}>
        {religionTabs.map(tab => (
          <View
            key={tab.type}
            className={classnames(styles.religionTab, activeType === tab.type && styles.active)}
            onClick={() => setActiveType(tab.type)}
          >
            <Text className={styles.tabIcon}>{tab.icon}</Text>
            <Text>{tab.name}</Text>
          </View>
        ))}
      </View>

      <View className={styles.religionHeader}>
        <Text className={styles.religionName}>
          {religionTabs.find(t => t.type === activeType)?.icon} {activeConfig.name}仪式
        </Text>
        <Text className={styles.religionDesc}>{activeConfig.description}</Text>
      </View>

      <View className={styles.card}>
        <SectionHeader title="仪式流程" subtitle={`共${activeSteps.length}个步骤`} />
        <View className={styles.stepsGrid}>
          {activeSteps.map((step, idx) => (
            <View key={step.id} className={styles.stepItem}>
              <View className={styles.stepNum}>{idx + 1}</View>
              <View className={styles.stepContent}>
                <Text className={styles.stepTitle}>{step.title}</Text>
                <Text className={styles.stepDesc}>
                  {step.duration}分钟 · {step.description}
                  {step.music && ` · 配乐：${step.music}`}
                </Text>
                {step.hostTips && (
                  <Text style={{ display: 'block', marginTop: 8, fontSize: 22, color: '#D69E2E' }}>
                    💡 {step.hostTips}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.card}>
        <SectionHeader title="民俗习惯" subtitle="遵循传统习俗" />
        <View className={styles.customsList}>
          {activeConfig.customs.map((custom, idx) => (
            <View key={idx} className={styles.customTag}>
              <Text>✅</Text>
              <Text>{custom}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.card}>
        <SectionHeader title="禁忌事项" subtitle="务必注意避免" />
        <View className={styles.taboosList}>
          {activeConfig.taboos.map((taboo, idx) => (
            <View key={idx} className={styles.tabooItem}>
              <Text className={styles.tabooIcon}>⚠️</Text>
              <Text className={styles.tabooText}>{taboo}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.card}>
        <SectionHeader title="推荐音乐" subtitle="精选适配曲目" />
        <View className={styles.musicList}>
          {activeConfig.musicRecommendations.map((music, idx) => (
            <View
              key={idx}
              className={styles.musicItem}
              onClick={() => Taro.showToast({ title: `播放：${music}`, icon: 'none' })}
            >
              <View className={styles.musicPlay}>▶</View>
              <View className={styles.musicInfo}>
                <Text className={styles.musicName}>{music}</Text>
                <Text className={styles.musicCategory}>{getReligionText(activeType)} · 推荐曲目</Text>
              </View>
              <Text className={styles.musicAction}>选用</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.card}>
        <SectionHeader title="快捷工具" subtitle="辅助主持准备" />
        <View className={styles.quickActions}>
          {[
            { icon: '📋', label: '流程模板', desc: '一键套用', onClick: () => Taro.switchTab({ url: '/pages/ceremony/index' }) },
            { icon: '📝', label: '悼词撰写', desc: '适配模板', onClick: () => Taro.navigateTo({ url: '/pages/eulogy/index' }) },
            { icon: '📚', label: '案例参考', desc: '优秀案例', onClick: () => Taro.switchTab({ url: '/pages/cases/index' }) },
            { icon: '📞', label: '家属沟通', desc: '需求确认', onClick: () => Taro.navigateTo({ url: '/pages/family/index' }) }
          ].map((action, idx) => (
            <View key={idx} className={styles.actionCard} onClick={action.onClick}>
              <Text className={styles.actionIcon}>{action.icon}</Text>
              <Text className={styles.actionLabel}>{action.label}</Text>
              <Text className={styles.actionDesc}>{action.desc}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default ReligionPage;
