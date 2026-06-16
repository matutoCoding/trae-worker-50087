import React, { useState } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import styles from './index.module.scss';
import { mockMasterProfile, mockSettlements, mockReviews } from '@/data/settlement';
import { renderStars } from '@/utils';

const ProfilePage: React.FC = () => {
  const [profile] = useState(mockMasterProfile);

  useDidShow(() => {
    console.log('[ProfilePage] 页面显示');
  });

  usePullDownRefresh(() => {
    console.log('[ProfilePage] 下拉刷新');
    setTimeout(() => Taro.stopPullDownRefresh(), 1000);
  });

  const pendingCount = mockSettlements.filter(s => s.status === 'pending').length;
  const newReviewsCount = mockReviews.filter(r => !r.reply).length;

  const tools = [
    {
      icon: '📝',
      iconBg: '#EBF8FF',
      text: '悼词撰写',
      desc: '模板库 + 自定义编辑',
      onClick: () => Taro.navigateTo({ url: '/pages/eulogy/index' })
    },
    {
      icon: '👨‍👩‍👧‍👦',
      iconBg: '#F0FFF4',
      text: '家属沟通',
      desc: '沟通记录 + 需求清单',
      onClick: () => Taro.navigateTo({ url: '/pages/family/index' })
    },
    {
      icon: '⛪',
      iconBg: '#FAF5FF',
      text: '宗教适配',
      desc: '五教仪轨 + 民俗',
      onClick: () => Taro.navigateTo({ url: '/pages/religion/index' })
    },
    {
      icon: '💰',
      iconBg: '#FFFBEB',
      text: '评价结算',
      desc: '收入统计 + 评价管理',
      badge: pendingCount + newReviewsCount || undefined,
      onClick: () => Taro.navigateTo({ url: '/pages/settlement/index' })
    }
  ];

  const certList = [
    { icon: '🎓', iconBg: '#EBF4FF', text: '资质证书', desc: `${profile.certifications.length}项专业认证`, onClick: () => Taro.showToast({ title: '查看资质证书', icon: 'none' }) },
    { icon: '📊', iconBg: '#FDF6EC', text: '数据统计', desc: '查看详细服务数据', onClick: () => Taro.showToast({ title: '数据统计功能', icon: 'none' }) },
    { icon: '⚙️', iconBg: '#F7FAFC', text: '设置', desc: '账号与应用设置', onClick: () => Taro.showToast({ title: '设置功能', icon: 'none' }) }
  ];

  return (
    <View className={styles.container}>
      <View className={styles.profileHeader}>
        <View className={styles.profileRow}>
          <Image src={profile.avatar} className={styles.avatar} mode="aspectFill" />
          <View className={styles.profileInfo}>
            <Text className={styles.name}>{profile.name}</Text>
            <Text className={styles.title}>{profile.title}</Text>
            <View className={styles.ratingRow}>
              <Text className={styles.ratingStars}>{renderStars(profile.rating)}</Text>
              <Text>{profile.rating.toFixed(1)} 综合评分</Text>
            </View>
          </View>
        </View>

        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{profile.experience}</Text>
            <Text className={styles.statLabel}>从业年限</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{profile.ceremoniesCount}</Text>
            <Text className={styles.statLabel}>主持场次</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{profile.rating.toFixed(1)}</Text>
            <Text className={styles.statLabel}>客户好评</Text>
          </View>
        </View>
      </View>

      <View className={styles.menuSection}>
        <Text className={styles.menuTitle}>核心工具</Text>
        {tools.map((tool, idx) => (
          <View
            key={idx}
            className={styles.menuItem}
            onClick={tool.onClick}
          >
            <View className={styles.iconWrap}>
              <View className={styles.menuIcon} style={{ background: tool.iconBg }}>
                {tool.icon}
              </View>
              {tool.badge && <View className={styles.badge}>{tool.badge}</View>}
            </View>
            <View className={styles.menuContent}>
              <Text className={styles.menuText}>{tool.text}</Text>
              {tool.desc && <Text className={styles.menuDesc}>{tool.desc}</Text>}
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        ))}
      </View>

      <View className={styles.menuSection}>
        <Text className={styles.menuTitle}>其他</Text>
        {certList.map((item, idx) => (
          <View
            key={idx}
            className={styles.menuItem}
            onClick={item.onClick}
          >
            <View className={styles.menuIcon} style={{ background: item.iconBg }}>
              {item.icon}
            </View>
            <View className={styles.menuContent}>
              <Text className={styles.menuText}>{item.text}</Text>
              {item.desc && <Text className={styles.menuDesc}>{item.desc}</Text>}
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default ProfilePage;
