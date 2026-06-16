import React, { useState, useMemo } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import CaseCard from '@/components/CaseCard';
import SectionHeader from '@/components/SectionHeader';
import EmptyState from '@/components/EmptyState';
import { CaseCategory } from '@/types';
import { mockCases } from '@/data/cases';

const CasesPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<CaseCategory | 'all'>('all');
  const [cases, setCases] = useState(mockCases);

  useDidShow(() => {
    console.log('[CasesPage] 页面显示');
  });

  usePullDownRefresh(() => {
    console.log('[CasesPage] 下拉刷新');
    setTimeout(() => Taro.stopPullDownRefresh(), 1000);
  });

  const filteredCases = useMemo(() => {
    let list = cases;
    if (activeCategory !== 'all') {
      list = list.filter(c => c.category === activeCategory);
    }
    if (search.trim()) {
      const keyword = search.trim().toLowerCase();
      list = list.filter(c =>
        c.title.toLowerCase().includes(keyword) ||
        c.summary.toLowerCase().includes(keyword)
      );
    }
    return list;
  }, [cases, activeCategory, search]);

  const stats = useMemo(() => {
    return {
      total: cases.length,
      favorites: cases.reduce((sum, c) => sum + c.favorites, 0),
      avgRating: cases.length > 0 ? (cases.reduce((sum, c) => sum + c.rating, 0) / cases.length).toFixed(1) : '0'
    };
  }, [cases]);

  const categories: { value: CaseCategory | 'all'; label: string }[] = [
    { value: 'all', label: '全部案例' },
    { value: 'traditional', label: '传统仪式' },
    { value: 'modern', label: '现代简约' },
    { value: 'religious', label: '宗教仪式' },
    { value: 'customized', label: '定制追思' }
  ];

  return (
    <View className={styles.container}>
      <View className={styles.searchBox}>
        <Text className={styles.searchIcon}>🔍</Text>
        <Input
          className={styles.searchInput}
          placeholder="搜索案例关键词..."
          value={search}
          onInput={e => setSearch(e.detail.value)}
          confirmType="search"
        />
      </View>

      <View className={styles.statsCard}>
        <View className={styles.statsItem}>
          <Text className={styles.statsNum}>{stats.total}</Text>
          <Text className={styles.statsLabel}>总案例</Text>
        </View>
        <View className={styles.statsItem}>
          <Text className={styles.statsNum}>{stats.avgRating}</Text>
          <Text className={styles.statsLabel}>平均评分</Text>
        </View>
        <View className={styles.statsItem}>
          <Text className={styles.statsNum}>{stats.favorites}</Text>
          <Text className={styles.statsLabel}>总收藏</Text>
        </View>
      </View>

      <View className={styles.categoryRow}>
        {categories.map(cat => (
          <View
            key={cat.value}
            className={classnames(styles.categoryItem, activeCategory === cat.value && styles.active)}
            onClick={() => setActiveCategory(cat.value)}
          >
            {cat.label}
          </View>
        ))}
      </View>

      <SectionHeader
        title="案例列表"
        subtitle={`共${filteredCases.length}个案例`}
      />

      {filteredCases.length > 0 ? (
        filteredCases.map(c => (
          <CaseCard key={c.id} data={c} />
        ))
      ) : (
        <View className={styles.listEmpty}>
          <EmptyState
            icon="📚"
            title="暂无匹配的案例"
            description="试试其他分类或关键词吧"
          />
        </View>
      )}
    </View>
  );
};

export default CasesPage;
