import { ScheduleItem } from '@/types';

export const mockSchedules: ScheduleItem[] = [
  {
    id: 's001',
    date: '2026-06-17',
    time: '08:30-10:30',
    status: 'ongoing',
    deceasedName: '张建国',
    age: 78,
    gender: 'male',
    familyName: '张伟',
    familyPhone: '138****5678',
    location: '市殡仪馆',
    hallName: '追思厅A',
    religion: 'buddhism',
    ceremonyType: '佛教传统仪式',
    notes: '家属要求诵经环节由寺庙僧人主持',
    amount: 8800
  },
  {
    id: 's002',
    date: '2026-06-17',
    time: '14:00-16:00',
    status: 'booked',
    deceasedName: '李秀英',
    age: 82,
    gender: 'female',
    familyName: '李明',
    familyPhone: '139****1234',
    location: '市殡仪馆',
    hallName: '追思厅B',
    religion: 'none',
    ceremonyType: '现代简约仪式',
    notes: '逝者为教师，希望仪式中加入学生代表发言环节',
    amount: 6800
  },
  {
    id: 's003',
    date: '2026-06-18',
    time: '09:00-11:00',
    status: 'booked',
    deceasedName: '王德福',
    age: 85,
    gender: 'male',
    familyName: '王芳',
    familyPhone: '136****9876',
    location: '市殡仪馆',
    hallName: '追思厅C',
    religion: 'christianity',
    ceremonyType: '基督教追思礼拜',
    notes: '需要安排牧师主持祷告环节',
    amount: 7600
  },
  {
    id: 's004',
    date: '2026-06-19',
    time: '10:00-12:00',
    status: 'booked',
    deceasedName: '陈美华',
    age: 68,
    gender: 'female',
    familyName: '陈强',
    familyPhone: '137****4321',
    location: '市殡仪馆',
    hallName: '追思厅A',
    religion: 'taoism',
    ceremonyType: '道教传统仪式',
    notes: '需要道士做法事，安排全套道教仪式',
    amount: 9600
  },
  {
    id: 's005',
    date: '2026-06-20',
    time: '08:00-10:00',
    status: 'booked',
    deceasedName: '刘国栋',
    age: 72,
    gender: 'male',
    familyName: '刘洋',
    familyPhone: '135****8765',
    location: '市殡仪馆',
    hallName: '追思厅B',
    religion: 'none',
    ceremonyType: '定制追思会',
    notes: '逝者为退役军人，希望安排军乐演奏环节',
    amount: 12800
  },
  {
    id: 's006',
    date: '2026-06-15',
    time: '09:30-11:30',
    status: 'completed',
    deceasedName: '赵玉兰',
    age: 76,
    gender: 'female',
    familyName: '赵军',
    familyPhone: '138****2468',
    location: '市殡仪馆',
    hallName: '追思厅A',
    religion: 'buddhism',
    ceremonyType: '佛教传统仪式',
    notes: '仪式顺利完成，家属非常满意',
    amount: 8200
  },
  {
    id: 's007',
    date: '2026-06-14',
    time: '14:30-16:30',
    status: 'completed',
    deceasedName: '孙志明',
    age: 80,
    gender: 'male',
    familyName: '孙伟',
    familyPhone: '139****1357',
    location: '市殡仪馆',
    hallName: '追思厅C',
    religion: 'catholicism',
    ceremonyType: '天主教殡葬弥撒',
    notes: '安排了神父主持弥撒，仪式庄重圆满',
    amount: 8800
  },
  {
    id: 's008',
    date: '2026-06-21',
    time: '09:00-11:00',
    status: 'free',
    deceasedName: '',
    age: 0,
    gender: 'male',
    familyName: '',
    familyPhone: '',
    location: '',
    hallName: '',
    religion: 'none',
    ceremonyType: '',
    notes: ''
  },
  {
    id: 's009',
    date: '2026-06-22',
    time: '14:00-16:00',
    status: 'free',
    deceasedName: '',
    age: 0,
    gender: 'male',
    familyName: '',
    familyPhone: '',
    location: '',
    hallName: '',
    religion: 'none',
    ceremonyType: '',
    notes: ''
  }
];

export const getTodaySchedules = (): ScheduleItem[] => {
  const today = '2026-06-17';
  return mockSchedules.filter(s => s.date === today);
};

export const getSchedulesByDate = (date: string): ScheduleItem[] => {
  return mockSchedules.filter(s => s.date === date);
};

export const getSchedulesByStatus = (status: string): ScheduleItem[] => {
  return mockSchedules.filter(s => s.status === status);
};

export const getScheduleById = (id: string): ScheduleItem | undefined => {
  return mockSchedules.find(s => s.id === id);
};
