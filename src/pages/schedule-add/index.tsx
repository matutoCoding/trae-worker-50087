import React, { useState, useMemo } from 'react';
import { View, Text, Input, Textarea, Picker } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import SectionHeader from '@/components/SectionHeader';
import { useAppStore } from '@/store/AppContext';
import { ReligionType } from '@/types';
import { getReligionText } from '@/utils';

const ScheduleAddPage: React.FC = () => {
  const router = useRouter();
  const { addSchedule } = useAppStore();

  // 从空闲档期传入的默认值
  const defaultDate = router.params.date || '';
  const defaultTime = router.params.time || '';

  const [deceasedName, setDeceasedName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [familyName, setFamilyName] = useState('');
  const [familyPhone, setFamilyPhone] = useState('');
  const [date, setDate] = useState(defaultDate || '2026-06-18');
  const [time, setTime] = useState(defaultTime || '09:00-11:00');
  const [hallName, setHallName] = useState('追思厅A');
  const [religion, setReligion] = useState<ReligionType>('none');
  const [ceremonyType, setCeremonyType] = useState('现代简约仪式');
  const [amount, setAmount] = useState('6800');
  const [notes, setNotes] = useState('');

  useDidShow(() => {
    console.log('[ScheduleAdd] 默认值:', { defaultDate, defaultTime });
  });

  const religionOptions: { key: ReligionType; label: string }[] = [
    { key: 'none', label: '无宗教' },
    { key: 'buddhism', label: '☸️ 佛教' },
    { key: 'taoism', label: '☯️ 道教' },
    { key: 'christianity', label: '✝️ 基督教' },
    { key: 'catholicism', label: '⛪ 天主教' }
  ];

  const ceremonyOptions = [
    { key: '现代简约仪式', label: '现代简约', cls: '' },
    { key: '传统告别仪式', label: '传统仪式', cls: 'warm' },
    { key: '定制追思会', label: '定制追思', cls: 'gold' }
  ];

  // 根据宗教自动匹配仪式类型
  React.useEffect(() => {
    const map: Record<ReligionType, string> = {
      buddhism: '佛教传统仪式',
      taoism: '道教传统仪式',
      christianity: '基督教追思礼拜',
      catholicism: '天主教殡葬弥撒',
      none: '现代简约仪式'
    };
    setCeremonyType(map[religion]);
  }, [religion]);

  const canSubmit = useMemo(() => {
    return deceasedName.trim() && familyName.trim() && age && parseInt(age) > 0;
  }, [deceasedName, familyName, age]);

  const handleSubmit = () => {
    if (!canSubmit) {
      Taro.showToast({ title: '请填写完整逝者和家属信息', icon: 'none' });
      return;
    }
    const newSchedule = addSchedule({
      deceasedName: deceasedName.trim(),
      age: parseInt(age) || 0,
      gender,
      familyName: familyName.trim(),
      familyPhone: familyPhone.trim(),
      date,
      time,
      hallName,
      religion,
      ceremonyType,
      amount: parseInt(amount) || 0,
      notes: notes.trim(),
      status: 'booked'
    });
    Taro.showToast({ title: '预约创建成功', icon: 'success' });
    setTimeout(() => {
      Taro.switchTab({
        url: '/pages/schedule/index'
      });
    }, 800);
  };

  return (
    <View className={styles.container}>
      {/* 逝者信息 */}
      <View className={styles.card}>
        <SectionHeader title="逝者信息" subtitle="请如实填写" />
        <View className={styles.formRow}>
          <Text className={classnames(styles.formLabel, styles.required)}>姓名</Text>
          <Input
            className={styles.formInput}
            placeholder="请输入逝者姓名"
            value={deceasedName}
            onInput={e => setDeceasedName(e.detail.value)}
            maxLength={20}
          />
        </View>
        <View className={styles.rowTwo}>
          <View className={styles.formRow}>
            <Text className={classnames(styles.formLabel, styles.required)}>享年</Text>
            <Input
              className={styles.formInput}
              type="number"
              placeholder="年龄"
              value={age}
              onInput={e => setAge(e.detail.value)}
              maxLength={3}
            />
          </View>
          <View className={styles.formRow}>
            <Text className={styles.formLabel}>称谓</Text>
            <View className={styles.optionRow}>
              <View
                className={classnames(styles.optionItem, gender === 'male' && styles.active)}
                onClick={() => setGender('male')}
              >
                👨 先生
              </View>
              <View
                className={classnames(styles.optionItem, styles.warm, gender === 'female' && styles.active)}
                onClick={() => setGender('female')}
              >
                👩 女士
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* 家属信息 */}
      <View className={styles.card}>
        <SectionHeader title="家属联系方式" />
        <View className={styles.rowTwo}>
          <View className={styles.formRow}>
            <Text className={classnames(styles.formLabel, styles.required)}>家属姓名</Text>
            <Input
              className={styles.formInput}
              placeholder="主要联系人姓名"
              value={familyName}
              onInput={e => setFamilyName(e.detail.value)}
            />
          </View>
          <View className={styles.formRow}>
            <Text className={styles.formLabel}>联系电话</Text>
            <Input
              className={styles.formInput}
              type="number"
              placeholder="手机号"
              value={familyPhone}
              onInput={e => setFamilyPhone(e.detail.value)}
              maxLength={11}
            />
          </View>
        </View>
      </View>

      {/* 场次信息 */}
      <View className={styles.card}>
        <SectionHeader title="场次安排" />
        <View className={styles.rowTwo}>
          <View className={styles.formRow}>
            <Text className={styles.formLabel}>日期</Text>
            <Picker mode="date" value={date} onChange={e => setDate(e.detail.value)}>
              <View className={styles.formInput} style={{ display: 'flex', alignItems: 'center' }}>
                📅 {date}
              </View>
            </Picker>
          </View>
          <View className={styles.formRow}>
            <Text className={styles.formLabel}>时间</Text>
            <View className={styles.optionRow}>
              {['08:00-10:00', '09:00-11:00', '10:00-12:00', '14:00-16:00'].map(t => (
                <View
                  key={t}
                  className={classnames(styles.optionItem, time === t && styles.active)}
                  onClick={() => setTime(t)}
                >
                  {t}
                </View>
              ))}
            </View>
          </View>
        </View>
        <View className={styles.formRow} style={{ marginTop: 24 }}>
          <Text className={styles.formLabel}>厅堂</Text>
          <View className={styles.optionRow}>
            {['追思厅A', '追思厅B', '追思厅C', '主礼厅'].map(h => (
              <View
                key={h}
                className={classnames(styles.optionItem, hallName === h && styles.active)}
                onClick={() => setHallName(h)}
              >
                📍 {h}
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* 宗教与仪式类型 */}
      <View className={styles.card}>
        <SectionHeader title="宗教与仪式" />
        <View className={styles.formRow}>
          <Text className={styles.formLabel}>宗教信仰</Text>
          <View className={styles.optionRow}>
            {religionOptions.map(opt => (
              <View
                key={opt.key}
                className={classnames(styles.optionItem, religion === opt.key && styles.active)}
                onClick={() => setReligion(opt.key)}
              >
                {opt.label}
              </View>
            ))}
          </View>
        </View>
        <View className={styles.formRow} style={{ marginTop: 24 }}>
          <Text className={styles.formLabel}>仪式类型</Text>
          <View className={styles.optionRow}>
            {[
              `${ceremonyType}（推荐）`,
              '现代简约仪式',
              '传统告别仪式',
              '定制追思会'
            ].map((c, idx) => (
              <View
                key={c}
                className={classnames(
                  styles.optionItem,
                  (idx === 0 ? true : c === ceremonyType) && styles.active,
                  idx === 2 ? styles.warm : idx === 3 ? styles.gold : ''
                )}
                onClick={() => setCeremonyType(c.replace('（推荐）', ''))}
              >
                {c}
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* 服务费用 */}
      <View className={styles.card}>
        <SectionHeader title="服务费用" />
        <View className={styles.formRow}>
          <Text className={styles.formLabel}>主持费用</Text>
          <View className={styles.amountRow}>
            <Text className={styles.amountPrefix}>¥</Text>
            <Input
              className={styles.amountInput}
              type="number"
              placeholder="0"
              value={amount}
              onInput={e => setAmount(e.detail.value)}
            />
          </View>
          <View className={styles.quickAmounts}>
            {['5800', '6800', '8800', '12800'].map(a => (
              <View
                key={a}
                className={styles.quickAmount}
                onClick={() => setAmount(a)}
              >
                ¥{a}
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* 备注 */}
      <View className={styles.card}>
        <SectionHeader title="特殊要求备注" />
        <Textarea
          className={styles.formTextarea}
          placeholder="家属特殊要求、注意事项等..."
          value={notes}
          onInput={e => setNotes(e.detail.value)}
          maxLength={200}
        />
      </View>

      {/* 预约预览 */}
      <View className={styles.card}>
        <View className={styles.schedulePreview}>
          <Text className={styles.previewTitle}>📋 预约概览</Text>
          <View className={styles.previewContent}>
            <Text>
              <Text className={styles.previewHighlight}>{deceasedName || '（待填写）'}</Text>
              {parseInt(age) > 0 ? ` 享年${age}岁 ` : ' '}
              {gender === 'male' ? '先生' : '女士'}
            </Text>
            <Text style={{ display: 'block', marginTop: 8 }}>
              📅 {date} ⏰ {time} · 📍 {hallName}
            </Text>
            <Text style={{ display: 'block', marginTop: 8 }}>
              {getReligionText(religion)} · {ceremonyType}
            </Text>
            <Text style={{ display: 'block', marginTop: 8 }}>
              费用：<Text className={styles.previewHighlight} style={{ color: '#C53030' }}>
                ¥{parseInt(amount) || 0}
              </Text>
            </Text>
          </View>
        </View>
      </View>

      {/* 底部操作 */}
      <View className={styles.bottomBar}>
        <View
          className={classnames(styles.btn, styles.secondary)}
          onClick={() => Taro.navigateBack()}
        >
          取消
        </View>
        <View
          className={classnames(styles.btn, styles.primary)}
          style={{ opacity: canSubmit ? 1 : 0.5 }}
          onClick={handleSubmit}
        >
          ✓ 确认创建预约
        </View>
      </View>
    </View>
  );
};

export default ScheduleAddPage;
