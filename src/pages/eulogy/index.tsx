import React, { useState, useMemo } from 'react';
import { View, Text, Textarea } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import SectionHeader from '@/components/SectionHeader';
import { mockEulogyTemplates } from '@/data/eulogy';
import { EulogyTemplate } from '@/types';

const EulogyPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('全部');
  const [selectedTemplate, setSelectedTemplate] = useState<EulogyTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '张建国',
    gender: 'male',
    age: 78,
    birthDate: '1948-05-12',
    deathDate: '2026-06-15',
    occupation: '退休干部',
    workUnit: '',
    childrenCount: 3,
    hometown: '江苏省南京市',
    highlights: '为人正直，热心公益'
  });
  const [content, setContent] = useState('');

  useDidShow(() => {
    console.log('[EulogyPage] 页面显示');
  });

  const categories = useMemo(() => {
    const cats = new Set(mockEulogyTemplates.map(t => t.category));
    return ['全部', ...Array.from(cats)];
  }, []);

  const filteredTemplates = useMemo(() => {
    if (activeCategory === '全部') return mockEulogyTemplates;
    return mockEulogyTemplates.filter(t => t.category === activeCategory);
  }, [activeCategory]);

  const handleSelectTemplate = (template: EulogyTemplate) => {
    setSelectedTemplate(template);
    let newContent = template.content;
    newContent = newContent
      .replace(/\[逝者姓名\]/g, formData.name)
      .replace(/\[姓名\]/g, formData.name)
      .replace(/\[出生年份\]/g, new Date(formData.birthDate).getFullYear().toString())
      .replace(/\[去世日期\]/g, formData.deathDate)
      .replace(/\[日期\]/g, '2026年6月17日')
      .replace(/\[年龄\]/g, formData.age.toString())
      .replace(/\[子女数\]/g, formData.childrenCount.toString())
      .replace(/\[工作单位\]/g, formData.workUnit || '原单位')
      .replace(/\[工作年限\]/g, '40')
      .replace(/\[事业名称\]/g, formData.occupation);

    setContent(newContent);
    Taro.showToast({ title: '模板已应用', icon: 'success' });
  };

  const handleFormChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (!content.trim()) {
      Taro.showToast({ title: '请输入悼词内容', icon: 'none' });
      return;
    }
    Taro.showToast({ title: '悼词已保存', icon: 'success' });
  };

  const handleExport = () => {
    Taro.showModal({
      title: '导出悼词',
      content: '悼词将复制到剪贴板，您可以粘贴到其他地方使用。',
      success: (res) => {
        if (res.confirm) {
          Taro.setClipboardData({ data: content });
          Taro.showToast({ title: '已复制到剪贴板', icon: 'success' });
        }
      }
    });
  };

  return (
    <View className={styles.container}>
      <View className={styles.formCard}>
        <SectionHeader title="逝者信息" subtitle="将自动填入悼词模板" />
        <View className={styles.formRow}>
          <View className={classnames(styles.formItem, styles.formRowItem)}>
            <Text className={styles.formLabel}>姓名</Text>
            <Textarea
              className={styles.formInput}
              value={formData.name}
              onInput={e => handleFormChange('name', e.detail.value)}
              style={{ height: 72 }}
            />
          </View>
          <View className={classnames(styles.formItem, styles.formRowItem)}>
            <Text className={styles.formLabel}>享年</Text>
            <Textarea
              className={styles.formInput}
              value={formData.age.toString()}
              onInput={e => handleFormChange('age', parseInt(e.detail.value) || 0)}
              style={{ height: 72 }}
              type="number"
            />
          </View>
        </View>
        <View className={styles.formRow}>
          <View className={classnames(styles.formItem, styles.formRowItem)}>
            <Text className={styles.formLabel}>出生日期</Text>
            <Textarea
              className={styles.formInput}
              value={formData.birthDate}
              onInput={e => handleFormChange('birthDate', e.detail.value)}
              style={{ height: 72 }}
            />
          </View>
          <View className={classnames(styles.formItem, styles.formRowItem)}>
            <Text className={styles.formLabel}>逝世日期</Text>
            <Textarea
              className={styles.formInput}
              value={formData.deathDate}
              onInput={e => handleFormChange('deathDate', e.detail.value)}
              style={{ height: 72 }}
            />
          </View>
        </View>
        <View className={styles.formRow}>
          <View className={classnames(styles.formItem, styles.formRowItem)}>
            <Text className={styles.formLabel}>生前职业</Text>
            <Textarea
              className={styles.formInput}
              value={formData.occupation}
              onInput={e => handleFormChange('occupation', e.detail.value)}
              style={{ height: 72 }}
            />
          </View>
          <View className={classnames(styles.formItem, styles.formRowItem)}>
            <Text className={styles.formLabel}>子女数</Text>
            <Textarea
              className={styles.formInput}
              value={formData.childrenCount.toString()}
              onInput={e => handleFormChange('childrenCount', parseInt(e.detail.value) || 0)}
              style={{ height: 72 }}
              type="number"
            />
          </View>
        </View>
      </View>

      <View className={styles.formCard}>
        <SectionHeader title="悼词模板库" subtitle="选择合适的模板快速生成" />
        <View className={styles.categoryTabs}>
          {categories.map(cat => (
            <View
              key={cat}
              className={classnames(styles.categoryTab, activeCategory === cat && styles.active)}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </View>
          ))}
        </View>

        {filteredTemplates.map(template => (
          <View
            key={template.id}
            className={classnames(
              styles.templateCard,
              selectedTemplate?.id === template.id && styles.selected
            )}
            onClick={() => handleSelectTemplate(template)}
          >
            <Text className={styles.templateTitle}>{template.title}</Text>
            <Text className={styles.templateSuitable}>{template.suitableFor}</Text>
            <Text className={styles.templatePreview}>{template.content}</Text>
          </View>
        ))}
      </View>

      <View className={styles.editorArea}>
        <Text className={styles.editorTitle}>📝 悼词编辑</Text>
        <View className={styles.toolbar}>
          <View className={styles.toolBtn} onClick={() => Taro.showToast({ title: '加粗', icon: 'none' })}>B 加粗</View>
          <View className={styles.toolBtn} onClick={() => Taro.showToast({ title: '斜体', icon: 'none' })}>I 斜体</View>
          <View className={styles.toolBtn} onClick={() => Taro.showToast({ title: '换行', icon: 'none' })}>↵ 换行</View>
          <View className={styles.toolBtn} onClick={() => Taro.showToast({ title: '插入模板', icon: 'none' })}>📋 插入</View>
        </View>
        <Textarea
          className={styles.editorContent}
          value={content}
          onInput={e => setContent(e.detail.value)}
          placeholder="请在此处编辑悼词内容，或选择上方模板自动填充..."
          autoHeight
          maxlength={20000}
        />
        <View style={{ marginTop: 16, fontSize: 24, color: '#A0AEC0', textAlign: 'right' }}>
          字数统计：{content.length} 字
        </View>
      </View>

      <View className={styles.bottomBar}>
        <View
          className={classnames(styles.bottomBtn, styles.secondary)}
          onClick={() => setContent('')}
        >
          🗑️ 清空
        </View>
        <View
          className={classnames(styles.bottomBtn, styles.warm)}
          onClick={handleExport}
        >
          📋 复制
        </View>
        <View
          className={classnames(styles.bottomBtn, styles.primary)}
          onClick={handleSave}
        >
          💾 保存
        </View>
      </View>
    </View>
  );
};

export default EulogyPage;
