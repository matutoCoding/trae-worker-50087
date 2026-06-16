import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Taro from '@tarojs/taro';
import {
  ScheduleItem,
  ReligionType,
  CeremonyStep,
  SettlementItem,
  FamilyContact,
  CommunicationRecord,
  BoardStepKey,
  BoardStepStatus
} from '@/types';
import { mockSchedules } from '@/data/schedule';
import { mockSettlements } from '@/data/settlement';
import { mockFamilyContacts, getFamilyByScheduleId } from '@/data/family';

const defaultBoardProgress = (): Record<BoardStepKey, BoardStepStatus> => ({
  booked: 'done',
  communicate: 'pending',
  flow_confirmed: 'pending',
  ceremony_start: 'pending',
  ceremony_complete: 'pending',
  settled: 'pending'
});

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
  caseAppliedHighlights: string[] | null;
  caseAppliedTitle: string | null;
  religionFromSchedule: ReligionType | null;
  settlements: SettlementItem[];
  familyMap: Record<string, FamilyContact>;
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
  setBoardStepStatus: (scheduleId: string, step: BoardStepKey, status: BoardStepStatus) => void;
  advanceBoardStep: (scheduleId: string, step: BoardStepKey) => void;
  getSettlementByScheduleId: (scheduleId: string) => SettlementItem | undefined;
  addOrUpdateSettlement: (schedule: ScheduleItem) => SettlementItem;
  applySettlementPaid: (scheduleId: string, method?: string) => void;
  getFamilyForSchedule: (scheduleId: string) => FamilyContact | undefined;
  addCommunicationRecord: (
    scheduleId: string,
    record: Omit<CommunicationRecord, 'id' | 'date'>
  ) => void;
  setCaseApplied: (title: string, highlights: string[]) => void;
  clearCaseApplied: () => void;
}

const STORAGE_KEY = 'funeral_app_state_v2';

const initScheduleWithDefaults = (s: ScheduleItem): ScheduleItem => ({
  ...s,
  boardProgress: s.boardProgress || defaultBoardProgress(),
  settlementStatus: s.settlementStatus || (s.status === 'completed' ? 'pending' : 'none')
});

const defaultState: AppState = {
  schedules: mockSchedules.map(initScheduleWithDefaults),
  currentScheduleId: null,
  casePlanData: null,
  caseAppliedHighlights: null,
  caseAppliedTitle: null,
  religionFromSchedule: null,
  settlements: mockSettlements,
  familyMap: mockFamilyContacts.reduce((acc, f) => {
    if (f.scheduleId) acc[f.scheduleId] = f;
    return acc;
  }, {} as Record<string, FamilyContact>)
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const loadPersistedState = (): Partial<AppState> => {
  try {
    const raw = Taro.getStorageSync(STORAGE_KEY);
    if (raw && typeof raw === 'object') return raw;
    if (typeof raw === 'string' && raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('[AppStore] 加载状态失败:', e);
  }
  return {};
};

const persistState = (state: Partial<AppState>) => {
  try {
    Taro.setStorage({
      key: STORAGE_KEY,
      data: JSON.stringify({
        schedules: state.schedules,
        currentScheduleId: state.currentScheduleId,
        caseAppliedHighlights: state.caseAppliedHighlights,
        caseAppliedTitle: state.caseAppliedTitle,
        settlements: state.settlements,
        familyMap: state.familyMap
      })
    });
  } catch (e) {
    console.warn('[AppStore] 保存状态失败:', e);
  }
};

const mergeBoardByStatus = (
  schedule: ScheduleItem
): Record<BoardStepKey, BoardStepStatus> => {
  const base = schedule.boardProgress || defaultBoardProgress();
  const s = schedule.status;
  if (s === 'free') return base;
  base.booked = 'done';
  if (s === 'booked') {
    base.communicate = base.communicate === 'done' ? 'done' : 'doing';
  }
  if (s === 'ongoing') {
    base.communicate = 'done';
    base.flow_confirmed = 'done';
    base.ceremony_start = 'done';
    base.ceremony_complete = base.ceremony_complete === 'done' ? 'done' : 'doing';
  }
  if (s === 'completed') {
    base.communicate = 'done';
    base.flow_confirmed = 'done';
    base.ceremony_start = 'done';
    base.ceremony_complete = 'done';
    if (schedule.settlementStatus === 'paid') {
      base.settled = 'done';
    } else if (schedule.settlementStatus === 'pending') {
      base.settled = 'doing';
    }
  }
  return base;
};

export const AppStoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const persisted = loadPersistedState();
  const [state, setState] = useState<AppState>({
    ...defaultState,
    ...persisted,
    schedules: (persisted.schedules || defaultState.schedules).map(initScheduleWithDefaults)
  });

  useEffect(() => {
    persistState(state);
  }, [
    state.schedules,
    state.currentScheduleId,
    state.caseAppliedHighlights,
    state.caseAppliedTitle,
    state.settlements,
    state.familyMap
  ]);

  const addSchedule = (data: Partial<ScheduleItem>): ScheduleItem => {
    const newItem: ScheduleItem = initScheduleWithDefaults({
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
      amount: data.amount || 0,
      settlementStatus: 'none'
    });
    setState(prev => {
      const filtered = prev.schedules.filter(
        s => !(s.status === 'free' && s.date === newItem.date && s.time === newItem.time)
      );
      return {
        ...prev,
        schedules: [...filtered, newItem],
        familyMap: data.familyName
          ? {
              ...prev.familyMap,
              [newItem.id]: {
                id: 'f_' + newItem.id,
                name: data.familyName,
                relation: '家属',
                phone: data.familyPhone || '',
                scheduleId: newItem.id,
                communicationRecords: [],
                requirements: data.notes ? [data.notes] : []
              }
            }
          : prev.familyMap
      };
    });
    return newItem;
  };

  const updateScheduleStatus = (id: string, status: ScheduleItem['status']) => {
    setState(prev => ({
      ...prev,
      schedules: prev.schedules.map(s => {
        if (s.id !== id) return s;
        const updated: ScheduleItem = {
          ...s,
          status,
          settlementStatus:
            status === 'completed'
              ? s.settlementStatus === 'paid'
                ? 'paid'
                : 'pending'
              : s.settlementStatus || 'none'
        };
        updated.boardProgress = mergeBoardByStatus(updated);
        return updated;
      })
    }));
  };

  const updateSchedule = (id: string, data: Partial<ScheduleItem>) => {
    setState(prev => ({
      ...prev,
      schedules: prev.schedules.map(s => (s.id === id ? { ...s, ...data } : s))
    }));
  };

  const setCurrentScheduleId = (id: string | null) => {
    setState(prev => ({ ...prev, currentScheduleId: id }));
  };

  const getCurrentSchedule = () => {
    if (!state.currentScheduleId) return undefined;
    return state.schedules.find(s => s.id === state.currentScheduleId);
  };

  const setCasePlan = (data: AppState['casePlanData']) => {
    setState(prev => ({ ...prev, casePlanData: data }));
  };

  const clearCasePlan = () => {
    setState(prev => ({ ...prev, casePlanData: null }));
  };

  const setReligionFromSchedule = (religion: ReligionType | null) => {
    setState(prev => ({ ...prev, religionFromSchedule: religion }));
  };

  const setBoardStepStatus = (
    scheduleId: string,
    step: BoardStepKey,
    status: BoardStepStatus
  ) => {
    setState(prev => ({
      ...prev,
      schedules: prev.schedules.map(s =>
        s.id === scheduleId
          ? {
              ...s,
              boardProgress: {
                ...(s.boardProgress || defaultBoardProgress()),
                [step]: status
              }
            }
          : s
      )
    }));
  };

  const advanceBoardStep = (scheduleId: string, step: BoardStepKey) => {
    setBoardStepStatus(scheduleId, step, 'done');
  };

  const getSettlementByScheduleId = (scheduleId: string) => {
    return state.settlements.find(s => s.scheduleId === scheduleId);
  };

  const addOrUpdateSettlement = (schedule: ScheduleItem): SettlementItem => {
    const existing = state.settlements.find(s => s.scheduleId === schedule.id);
    if (existing) return existing;
    const newSettle: SettlementItem = {
      id: 'st_' + Date.now().toString(36),
      scheduleId: schedule.id,
      date: schedule.date,
      deceasedName: schedule.deceasedName,
      amount: schedule.amount || 0,
      status: 'pending'
    };
    setState(prev => ({
      ...prev,
      settlements: [...prev.settlements, newSettle],
      schedules: prev.schedules.map(s =>
        s.id === schedule.id ? { ...s, settlementStatus: 'pending' } : s
      )
    }));
    return newSettle;
  };

  const applySettlementPaid = (scheduleId: string, method: string = '微信支付') => {
    const now = new Date().toISOString().slice(0, 10);
    setState(prev => {
      const schedule = prev.schedules.find(s => s.id === scheduleId);
      let settlements = prev.settlements.map(s =>
        s.scheduleId === scheduleId
          ? { ...s, status: 'paid' as const, paymentMethod: method, paidDate: now }
          : s
      );
      if (!settlements.some(s => s.scheduleId === scheduleId) && schedule) {
        settlements.push({
          id: 'st_' + Date.now().toString(36),
          scheduleId,
          date: schedule.date,
          deceasedName: schedule.deceasedName,
          amount: schedule.amount || 0,
          status: 'paid',
          paymentMethod: method,
          paidDate: now
        });
      }
      const schedules = prev.schedules.map(s =>
        s.id === scheduleId
          ? {
              ...s,
              settlementStatus: 'paid',
              boardProgress: mergeBoardByStatus({
                ...s,
                settlementStatus: 'paid'
              })
            }
          : s
      );
      return { ...prev, settlements, schedules };
    });
  };

  const getFamilyForSchedule = (scheduleId: string): FamilyContact | undefined => {
    if (state.familyMap[scheduleId]) return state.familyMap[scheduleId];
    return getFamilyByScheduleId(scheduleId);
  };

  const addCommunicationRecord = (
    scheduleId: string,
    record: Omit<CommunicationRecord, 'id' | 'date'>
  ) => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;
    const newRecord: CommunicationRecord = {
      id: 'r_' + Date.now().toString(36),
      date: dateStr,
      ...record
    };
    setState(prev => {
      const existing = prev.familyMap[scheduleId];
      const base: FamilyContact = existing || {
        id: 'f_' + scheduleId,
        name: prev.schedules.find(s => s.id === scheduleId)?.familyName || '家属',
        relation: '家属',
        phone: prev.schedules.find(s => s.id === scheduleId)?.familyPhone || '',
        scheduleId,
        communicationRecords: [],
        requirements: []
      };
      const updated: FamilyContact = {
        ...base,
        communicationRecords: [newRecord, ...base.communicationRecords]
      };
      return {
        ...prev,
        familyMap: { ...prev.familyMap, [scheduleId]: updated },
        schedules: prev.schedules.map(s =>
          s.id === scheduleId
            ? {
                ...s,
                boardProgress: {
                  ...(s.boardProgress || defaultBoardProgress()),
                  communicate: 'done'
                }
              }
            : s
        )
      };
    });
  };

  const setCaseApplied = (title: string, highlights: string[]) => {
    setState(prev => ({
      ...prev,
      caseAppliedTitle: title,
      caseAppliedHighlights: highlights
    }));
  };

  const clearCaseApplied = () => {
    setState(prev => ({
      ...prev,
      caseAppliedTitle: null,
      caseAppliedHighlights: null
    }));
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
    setReligionFromSchedule,
    setBoardStepStatus,
    advanceBoardStep,
    getSettlementByScheduleId,
    addOrUpdateSettlement,
    applySettlementPaid,
    getFamilyForSchedule,
    addCommunicationRecord,
    setCaseApplied,
    clearCaseApplied
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

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
      setReligionFromSchedule: () => {},
      setBoardStepStatus: () => {},
      advanceBoardStep: () => {},
      getSettlementByScheduleId: () => undefined,
      addOrUpdateSettlement: () => ({ id: 'temp', date: '', deceasedName: '', amount: 0, status: 'pending' } as SettlementItem),
      applySettlementPaid: () => {},
      getFamilyForSchedule: () => undefined,
      addCommunicationRecord: () => {},
      setCaseApplied: () => {},
      clearCaseApplied: () => {}
    };
  }
  return ctx;
};

export default AppContext;
