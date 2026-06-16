import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Taro from '@tarojs/taro';
import { ScheduleItem, ReligionType, CeremonyStep } from '@/types';
import { mockSchedules } from '@/data/schedule';
import { mockCeremonySteps } from '@/data/ceremony';

// ===========================
// 全局状态类型定义
// ===========================
interface AppState {
  schedules: ScheduleItem[];
  currentScheduleId: string | null;
  casePlanData: {
    caseId: string;
    caseTitle: string;
    flow: string[];
    highlights: string[];
    religion: ReligionType;
  } | null;
  religionFromSchedule: ReligionType | null;
}

interface AppContextType extends AppState {
  addSchedule: (data: Partial<ScheduleItem>) => ScheduleItem;
  updateScheduleStatus: (id: string, status: ScheduleItem['status']) => void;
  updateSchedule: (id: string, data: Partial<ScheduleItem>) => void;
  setCurrentScheduleId: (id: string | null) => void;
  getCurrentSchedule: () => ScheduleItem | undefined;
  setCasePlan: (data: AppState['casePlanData']) => void;
  clearCasePlan: () => void;
  setReligionFromSchedule: (religion: ReligionType | null) => void;
}

const STORAGE_KEY = 'funeral_app_state_v1';

// ===========================
// 默认初始状态
// ===========================
const defaultState: AppState = {
  schedules: mockSchedules,
  currentScheduleId: null,
  casePlanData: null,
  religionFromSchedule: null
};

// ===========================
// Context
// ===========================
const AppContext = createContext<AppContextType | undefined>(undefined);

// ===========================
// 加载持久化数据
// ===========================
const loadPersistedState = (): Partial<AppState> => {
  try {
    const raw = Taro.getStorageSync(STORAGE_KEY);
    if (raw && typeof raw === 'object') {
      return raw;
    }
    if (typeof raw === 'string' && raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('[AppStore] 加载状态失败:', e);
  }
  return {};
};

// ===========================
// 保存持久化数据
// ===========================
const persistState = (state: Partial<AppState>) => {
  try {
    Taro.setStorage({
      key: STORAGE_KEY,
      data: JSON.stringify({
        schedules: state.schedules,
        currentScheduleId: state.currentScheduleId
      })
    });
  } catch (e) {
    console.warn('[AppStore] 保存状态失败:', e);
  }
};

// ===========================
// Provider 组件
// ===========================
export const AppStoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const persisted = loadPersistedState();
  const [state, setState] = useState<AppState>({
    ...defaultState,
    ...persisted
  });

  useEffect(() => {
    persistState(state);
  }, [state.schedules, state.currentScheduleId]);

  // 新增档期
  const addSchedule = (data: Partial<ScheduleItem>): ScheduleItem => {
    const newItem: ScheduleItem = {
      id: 's_' + Date.now().toString(36),
      date: data.date || new Date().toISOString().slice(0, 10),
      time: data.time || '09:00-11:00',
      status: 'booked',
      deceasedName: data.deceasedName || '',
      age: data.age || 0,
      gender: data.gender || 'male',
      familyName: data.familyName || '',
      familyPhone: data.familyPhone || '',
      location: data.location || '市殡仪馆',
      hallName: data.hallName || '',
      religion: data.religion || 'none',
      ceremonyType: data.ceremonyType || '现代简约仪式',
      notes: data.notes || '',
      amount: data.amount || 0
    };
    setState(prev => ({
      ...prev,
      schedules: [...prev.schedules, newItem]
    }));
    return newItem;
  };

  // 更新档期状态
  const updateScheduleStatus = (id: string, status: ScheduleItem['status']) => {
    setState(prev => ({
      ...prev,
      schedules: prev.schedules.map(s =>
        s.id === id ? { ...s, status } : s
      )
    }));
  };

  // 更新档期任意字段
  const updateSchedule = (id: string, data: Partial<ScheduleItem>) => {
    setState(prev => ({
      ...prev,
      schedules: prev.schedules.map(s =>
        s.id === id ? { ...s, ...data } : s
      )
    }));
  };

  // 设置当前活跃档期ID
  const setCurrentScheduleId = (id: string | null) => {
    setState(prev => ({ ...prev, currentScheduleId: id }));
  };

  // 获取当前活跃档期
  const getCurrentSchedule = () => {
    if (!state.currentScheduleId) return undefined;
    return state.schedules.find(s => s.id === state.currentScheduleId);
  };

  // 设置从案例套用的数据
  const setCasePlan = (data: AppState['casePlanData']) => {
    setState(prev => ({ ...prev, casePlanData: data }));
  };

  // 清除案例方案
  const clearCasePlan = () => {
    setState(prev => ({ ...prev, casePlanData: null }));
  };

  // 设置从档期传入的宗教类型
  const setReligionFromSchedule = (religion: ReligionType | null) => {
    setState(prev => ({ ...prev, religionFromSchedule: religion }));
  };

  const value: AppContextType = {
    ...state,
    addSchedule,
    updateScheduleStatus,
    updateSchedule,
    setCurrentScheduleId,
    getCurrentSchedule,
    setCasePlan,
    clearCasePlan,
    setReligionFromSchedule
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// ===========================
// Hook
// ===========================
export const useAppStore = (): AppContextType => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    console.warn('[AppStore] 未找到Provider，返回默认状态（仅用于静态检查）');
    return {
      ...defaultState,
      addSchedule: () => ({ id: 'temp' } as ScheduleItem),
      updateScheduleStatus: () => {},
      updateSchedule: () => {},
      setCurrentScheduleId: () => {},
      getCurrentSchedule: () => undefined,
      setCasePlan: () => {},
      clearCasePlan: () => {},
      setReligionFromSchedule: () => {}
    };
  }
  return ctx;
};

export default AppContext;
