import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import { CeremonyStep } from '@/types';

interface StepTimelineProps {
  steps: CeremonyStep[];
  onStepClick?: (step: CeremonyStep) => void;
}

const StepTimeline: React.FC<StepTimelineProps> = ({ steps, onStepClick }) => {
  return (
    <View className={styles.timeline}>
      {steps.map((step, index) => (
        <View
          key={step.id}
          className={classnames(
            styles.stepItem,
            step.completed && styles.completed,
            index === steps.length - 1 && styles.last
          )}
          onClick={() => onStepClick?.(step)}
        >
          <View className={styles.left}>
            <View
              className={classnames(
                styles.dot,
                step.completed && styles.dotCompleted
              )}
            >
              {step.completed ? '✓' : step.order}
            </View>
            {index !== steps.length - 1 && <View className={styles.line} />}
          </View>
          <View className={styles.content}>
            <View className={styles.header}>
              <Text className={styles.title}>{step.title}</Text>
              <Text className={styles.duration}>{step.duration}分钟</Text>
            </View>
            <Text className={styles.description}>{step.description}</Text>
            {step.hostTips && (
              <View className={styles.tips}>
                <Text className={styles.tipsText}>💡 {step.hostTips}</Text>
              </View>
            )}
            {step.music && (
              <View className={styles.music}>
                <Text className={styles.musicText}>🎵 {step.music}</Text>
              </View>
            )}
          </View>
        </View>
      ))}
    </View>
  );
};

export default StepTimeline;
