import React, { useState, useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import ScheduleCard from '@/components/ScheduleCard';
import SectionHeader from '@/components/SectionHeader';
import EmptyState from '@/components/EmptyState';
import { ScheduleItem, ScheduleStatus } from '@/types';
import { mockSchedules, getSchedulesByStatus } from '@/data/schedule';
import { getMonthDays, getFirstDayOfMonth } from '@/utils';

type FilterType = 'all' | ScheduleStatus;

const SchedulePage: React.FC = () => {
  const [schedules, setSchedules] = useState<ScheduleItem[]>(mockSchedules);
  const [filter, setFilter] = useState<FilterType>('all');
  const [currentDate] = useState(new Date('2026-06-17'));
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(5);
  const [selectedDate, setSelectedDate] = useState<string>('2026-06-17');

  useDidShow(() => {
    console.log('[SchedulePage] 页面显示');
  });

  usePullDownRefresh(() => {
    console.log('[SchedulePage] 下拉刷新');
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 1000);
  });

  const stats = useMemo(() => {
    const todaySchedules = schedules.filter(s => s.date === '2026-06-17');
    return {
      total: schedules.filter(s => s.status !== 'free').length,
      ongoing: schedules.filter(s => s.status === 'ongoing').length,
      booked: schedules.filter(s => s.status === 'booked').length,
      free: schedules.filter(s => s.status === 'free').length,
      todayTotal: todaySchedules.filter(s => s.status !== 'free').length
    };
  }, [schedules]);

  const filteredSchedules = useMemo(() => {
    let list = schedules;
    if (filter !== 'all') {
      list = list.filter(s => s.status === filter);
    }
    if (selectedDate) {
      list = list.filter(s => s.date === selectedDate);
    }
    return list.sort((a, b) => a.time.localeCompare(b.time));
  }, [schedules, filter, selectedDate]);

  const calendarDays = useMemo(() => {
    const daysInMonth = getMonthDays(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days: { day: number; date: string; isOtherMonth: boolean; hasSchedule: boolean }[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push({ day: 0, date: '', isOtherMonth: true, hasSchedule: false });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const hasSchedule = schedules.some(s => s.date === date && s.status !== 'free');
      days.push({ day: d, date, isOtherMonth: false, hasSchedule });
    }

    return days;
  }, [year, month, schedules]);

  const changeMonth = (delta: number) => {
    let newMonth = month + delta;
    let newYear = year;
    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }
    setMonth(newMonth);
    setYear(newYear);
  };

  const handleDayClick = (date: string) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const filterOptions: { value: FilterType; label: string }[] = [
    { value: 'all', label: '全部' },
    { value: 'ongoing', label: '进行中' },
    { value: 'booked', label: '已预约' },
    { value: 'completed', label: '已完成' },
    { value: 'free', label: '空闲' }
  ];

  return (
    <View className={styles.container}>
      <View className={styles.statsRow}>
        <View className={styles.statsCard}>
          <Text className={styles.statsValue}>{stats.todayTotal}</Text>
          <Text className={styles.statsLabel}>今日档期</Text>
        </View>
        <View className={classnames(styles.statsCard, styles.ongoingCard)}>
          <Text className={styles.statsValue}>{stats.ongoing}</Text>
          <Text className={styles.statsLabel}>进行中</Text>
        </View>
        <View className={classnames(styles.statsCard, styles.freeCard)}>
          <Text className={styles.statsValue}>{stats.free}</Text>
          <Text className={styles.statsLabel}>可预约</Text>
        </View>
      </View>

      <View className={styles.filterBar}>
        {filterOptions.map(opt => (
          <View
            key={opt.value}
            className={classnames(styles.filterItem, filter === opt.value && styles.active)}
            onClick={() => setFilter(opt.value)}
          >
            {opt.label}
          </View>
        ))}
      </View>

      <View className={styles.calendarHeader}>
        <View className={styles.navBtn} onClick={() => changeMonth(-1)}>‹</View>
        <Text className={styles.monthText}>{year}年{month + 1}月</Text>
        <View className={styles.navBtn} onClick={() => changeMonth(1)}>›</View>
      </View>
      <View className={styles.calendar}>
        <View className={styles.weekRow}>
          {['日', '一', '二', '三', '四', '五', '六'].map(w => (
            <View key={w} className={styles.weekDay}>{w}</View>
          ))}
        </View>
        <View className={styles.daysGrid}>
          {calendarDays.map((item, idx) => (
            <View
              key={idx}
              className={classnames(
                styles.dayItem,
                item.day === 0 && styles.empty,
                item.isOtherMonth && styles.otherMonth,
                item.date === selectedDate && styles.today,
                item.hasSchedule && styles.hasSchedule
              )}
              onClick={() => handleDayClick(item.date)}
            >
              {item.day > 0 && (
                <>
                  <Text className={styles.dayNum}>{item.day}</Text>
                  {item.hasSchedule && (
                    <View className={styles.dayDots}>
                      <View className={styles.dayDot}></View>
                    </View>
                  )}
                </>
              )}
            </View>
          ))}
        </View>
      </View>

      <SectionHeader
        title="档期列表"
        subtitle={selectedDate ? `${selectedDate} 共${filteredSchedules.length}条` : ''}
        extra={
          <View
            className={styles.addBtn}
            onClick={() => Taro.showToast({ title: '新增档期功能', icon: 'none' })}
          >
            + 新增
          </View>
        }
      />

      {filteredSchedules.length > 0 ? (
        filteredSchedules.map(item => (
          <ScheduleCard key={item.id} data={item} />
        ))
      ) : (
        <EmptyState
          icon="📅"
          title="暂无档期"
          description="点击右上方新增按钮添加新档期"
        />
      )}
    </View>
  );
};

export default SchedulePage;
