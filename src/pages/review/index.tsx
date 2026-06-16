import React, { useState } from 'react';
import { View, Text, Input, Textarea } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import SectionHeader from '@/components/SectionHeader';
import { useAppStore } from '@/store/AppContext';
import { CeremonyReview } from '@/types';

const ReviewPage: React.FC = () => {
  const {
    getCurrentSchedule,
    saveReview,
    getReview,
    setScheduleReviewStatus,
    currentScheduleId
  } = useAppStore();

  const [scheduleName, setScheduleName] = useState<string>('');
  const [scenePhotos, setScenePhotos] = useState<{ id: string; url: string; note: string }[]>([]);
  const [emergencyHandling, setEmergencyHandling] = useState('');
  const [familyFeedback, setFamilyFeedback] = useState('');
  const [todos, setTodos] = useState<{ id: string; content: string; done: boolean }[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [overallNote, setOverallNote] = useState('');

  useDidShow(() => {
    console.log('[ReviewPage] 页面显示, currentScheduleId:', currentScheduleId);
    const schedule = getCurrentSchedule();
    if (schedule) {
      setScheduleName(`${schedule.deceasedName}${schedule.gender === 'male' ? '先生' : '女士'} · ${schedule.ceremonyType}`);
    } else {
      setScheduleName('');
    }
    if (currentScheduleId) {
      const review = getReview(currentScheduleId);
      if (review) {
        setScenePhotos(review.scenePhotos || []);
        setEmergencyHandling(review.emergencyHandling || '');
        setFamilyFeedback(review.familyFeedback || '');
        setTodos(review.todos || []);
        setOverallNote(review.overallNote || '');
      }
    }
  });

  const handleAddPhoto = () => {
    Taro.showToast({ title: '添加照片（功能待接入）', icon: 'none' });
  };

  const handleAddTodo = () => {
    if (!newTodo.trim()) {
      Taro.showToast({ title: '请输入待办内容', icon: 'none' });
      return;
    }
    setTodos(prev => [
      ...prev,
      { id: 't_' + Date.now().toString(36), content: newTodo.trim(), done: false }
    ]);
    setNewTodo('');
  };

  const handleToggleTodo = (todoId: string) => {
    setTodos(prev =>
      prev.map(t => (t.id === todoId ? { ...t, done: !t.done } : t))
    );
  };

  const collectReviewData = (): Partial<CeremonyReview> => ({
    scenePhotos,
    emergencyHandling,
    familyFeedback,
    todos,
    overallNote
  });

  const handleSaveDraft = () => {
    if (!currentScheduleId) {
      Taro.showToast({ title: '请先关联档期', icon: 'none' });
      return;
    }
    saveReview(currentScheduleId, collectReviewData());
    setScheduleReviewStatus(currentScheduleId, 'doing');
    Taro.showToast({ title: '草稿已保存', icon: 'success' });
    setTimeout(() => Taro.navigateBack(), 800);
  };

  const handleCompleteReview = () => {
    if (!currentScheduleId) {
      Taro.showToast({ title: '请先关联档期', icon: 'none' });
      return;
    }
    saveReview(currentScheduleId, collectReviewData());
    setScheduleReviewStatus(currentScheduleId, 'done');
    Taro.showToast({ title: '复盘已完成', icon: 'success' });
    setTimeout(() => Taro.navigateBack(), 800);
  };

  return (
    <View className={styles.container}>
      {scheduleName && (
        <View className={styles.scheduleHeader}>
          <Text className={styles.scheduleLabel}>📌 当前关联档期</Text>
          <Text className={styles.scheduleName}>{scheduleName}</Text>
        </View>
      )}

      <View className={styles.card}>
        <SectionHeader
          title="📷 现场照片说明"
          subtitle="记录仪式现场关键照片"
          extra={
            <Text
              style={{ color: '#2C5282', fontSize: 24 }}
              onClick={handleAddPhoto}
            >
              添加 +
            </Text>
          }
        />
        <View className={styles.photoList}>
          {scenePhotos.length === 0 ? (
            <View className={styles.photoEmpty}>
              <Text style={{ fontSize: 24, color: '#A0AEC0' }}>暂无照片，点击「添加」上传现场照片</Text>
            </View>
          ) : (
            scenePhotos.map(photo => (
              <View key={photo.id} className={styles.photoItem}>
                <View className={styles.photoPlaceholder}>🖼️</View>
                <Text className={styles.photoNote}>{photo.note || '未添加说明'}</Text>
              </View>
            ))
          )}
        </View>
      </View>

      <View className={styles.card}>
        <SectionHeader title="🚨 突发情况处理" subtitle="记录仪式中的突发情况及处理方式" />
        <Textarea
          className={styles.textarea}
          placeholder="请输入突发情况及处理方式..."
          value={emergencyHandling}
          onInput={e => setEmergencyHandling(e.detail.value)}
          maxlength={500}
        />
      </View>

      <View className={styles.card}>
        <SectionHeader title="💬 家属反馈摘要" subtitle="记录家属的主要反馈与评价" />
        <Textarea
          className={styles.textarea}
          placeholder="请输入家属反馈摘要..."
          value={familyFeedback}
          onInput={e => setFamilyFeedback(e.detail.value)}
          maxlength={500}
        />
      </View>

      <View className={styles.card}>
        <SectionHeader title="📋 后续待办" subtitle={`共${todos.length}项，已完成${todos.filter(t => t.done).length}项`} />
        <View className={styles.todoInputRow}>
          <Input
            className={styles.todoInput}
            placeholder="输入待办事项后点击添加"
            value={newTodo}
            onInput={e => setNewTodo(e.detail.value)}
            confirmType="done"
            onConfirm={handleAddTodo}
          />
          <View className={styles.todoAddBtn} onClick={handleAddTodo}>
            添加
          </View>
        </View>
        <View className={styles.todoList}>
          {todos.length === 0 && (
            <Text style={{ fontSize: 24, color: '#A0AEC0', padding: 16, textAlign: 'center' }}>
              暂无待办事项
            </Text>
          )}
          {todos.map(todo => (
            <View
              key={todo.id}
              className={classnames(styles.todoItem, todo.done && styles.done)}
              onClick={() => handleToggleTodo(todo.id)}
            >
              <Text className={styles.todoCheck}>{todo.done ? '✅' : '⬜'}</Text>
              <Text className={styles.todoText}>{todo.content}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.card}>
        <SectionHeader title="📝 总体复盘备注" subtitle="对本次仪式服务的整体复盘与改进建议" />
        <Textarea
          className={styles.textarea}
          placeholder="请输入总体复盘备注..."
          value={overallNote}
          onInput={e => setOverallNote(e.detail.value)}
          maxlength={1000}
        />
      </View>

      <View className={styles.bottomBar}>
        <View
          className={classnames(styles.bottomBtn, styles.secondary)}
          onClick={handleSaveDraft}
        >
          💾 保存草稿
        </View>
        <View
          className={classnames(styles.bottomBtn, styles.primary)}
          onClick={handleCompleteReview}
        >
          ✅ 完成复盘
        </View>
      </View>
    </View>
  );
};

export default ReviewPage;
