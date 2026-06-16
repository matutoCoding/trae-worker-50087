export type ScheduleStatus = 'free' | 'booked' | 'ongoing' | 'completed';

export type ReligionType = 'buddhism' | 'taoism' | 'christianity' | 'catholicism' | 'none';

export type CaseCategory = 'traditional' | 'modern' | 'religious' | 'customized';

export type BoardStepKey =
  | 'booked'
  | 'communicate'
  | 'flow_confirmed'
  | 'ceremony_start'
  | 'ceremony_complete'
  | 'settled';

export type BoardStepStatus = 'pending' | 'doing' | 'done';

export interface ScheduleItem {
  id: string;
  date: string;
  time: string;
  status: ScheduleStatus;
  deceasedName: string;
  age: number;
  gender: 'male' | 'female';
  familyName: string;
  familyPhone: string;
  location: string;
  hallName: string;
  religion: ReligionType;
  ceremonyType: string;
  notes?: string;
  amount?: number;
  boardProgress?: Record<BoardStepKey, BoardStepStatus>;
  settlementStatus?: 'none' | 'pending' | 'paid';
}

export interface CeremonyStep {
  id: string;
  order: number;
  title: string;
  duration: number;
  description: string;
  hostTips?: string;
  music?: string;
  completed?: boolean;
}

export interface MusicItem {
  id: string;
  name: string;
  artist: string;
  duration: string;
  category: string;
  mood: 'solemn' | 'warm' | 'peaceful' | 'tradition';
}

export interface EulogyTemplate {
  id: string;
  title: string;
  category: string;
  content: string;
  suitableFor: string;
}

export interface FamilyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  scheduleId?: string;
  communicationRecords: CommunicationRecord[];
  requirements: string[];
}

export interface CommunicationRecord {
  id: string;
  date: string;
  content: string;
  type: 'call' | 'message' | 'meeting';
}

export interface CaseItem {
  id: string;
  title: string;
  category: CaseCategory;
  coverImage: string;
  summary: string;
  date: string;
  location: string;
  religion: ReligionType;
  deceasedName: string;
  age: number;
  ceremonyFlow: string[];
  highlights: string[];
  rating: number;
  familyFeedback: string;
  views: number;
  favorites: number;
}

export interface ReviewItem {
  id: string;
  scheduleId?: string;
  familyName: string;
  date: string;
  rating: number;
  content: string;
  tags: string[];
  reply?: string;
}

export interface SettlementItem {
  id: string;
  scheduleId?: string;
  date: string;
  deceasedName: string;
  amount: number;
  status: 'pending' | 'paid';
  paymentMethod?: string;
  paidDate?: string;
}

export interface MasterProfile {
  name: string;
  title: string;
  avatar: string;
  experience: number;
  ceremoniesCount: number;
  rating: number;
  certifications: string[];
}

export interface ReligionConfig {
  type: ReligionType;
  name: string;
  description: string;
  ceremonySteps: string[];
  customs: string[];
  taboos: string[];
  musicRecommendations: string[];
}
