import { FamilyContact } from '@/types';

export const mockFamilyContacts: FamilyContact[] = [
  {
    id: 'f001',
    name: '张伟',
    relation: '长子',
    phone: '138****5678',
    scheduleId: 's001',
    communicationRecords: [
      { id: 'r001', date: '2026-06-16 09:30', content: '初次面谈，确认佛教仪式流程，家属希望邀请寺庙僧人诵经', type: 'meeting' },
      { id: 'r002', date: '2026-06-16 14:20', content: '确认僧人名单和法事用品清单，家属无异议', type: 'call' },
      { id: 'r003', date: '2026-06-17 07:15', content: '确认当天到场时间为8点整，提醒家属准备好逝者照片', type: 'message' }
    ],
    requirements: [
      '邀请寺庙12位僧人主持诵经法事',
      '设置49盏祈福莲灯供家属点灯',
      '仪式后安排素斋宴请亲友',
      '准备往生被和陀罗尼经被'
    ]
  },
  {
    id: 'f002',
    name: '李明',
    relation: '次子',
    phone: '139****1234',
    scheduleId: 's002',
    communicationRecords: [
      { id: 'r004', date: '2026-06-16 10:00', content: '电话确认仪式为现代简约风格，需要准备生平视频', type: 'call' },
      { id: 'r005', date: '2026-06-16 15:30', content: '家属发送照片和视频素材用于制作纪念视频', type: 'message' },
      { id: 'r006', date: '2026-06-16 19:00', content: '确认增加学生代表发言环节，需预留15分钟', type: 'call' }
    ],
    requirements: [
      '制作20分钟生平纪念视频',
      '邀请3-5名学生代表发言',
      '逝者为教师，现场布置需体现教育主题',
      '播放逝者生前喜爱的古典音乐'
    ]
  },
  {
    id: 'f003',
    name: '王芳',
    relation: '长女',
    phone: '136****9876',
    scheduleId: 's003',
    communicationRecords: [
      { id: 'r007', date: '2026-06-15 11:00', content: '面谈确认基督教追思礼拜流程，牧师为李牧师', type: 'meeting' },
      { id: 'r008', date: '2026-06-16 10:00', content: '确认诗班16人，曲目清单已发给家属', type: 'call' },
      { id: 'r009', date: '2026-06-17 08:00', content: '提醒家属提前到达教堂做准备', type: 'message' }
    ],
    requirements: [
      '在基督教堂举办追思礼拜',
      '安排教会诗班献唱',
      '布置鲜花十字架祭坛',
      '不烧纸钱不跪拜，遵循基督教礼仪'
    ]
  },
  {
    id: 'f004',
    name: '陈强',
    relation: '侄子',
    phone: '137****4321',
    scheduleId: 's004',
    communicationRecords: [
      { id: 'r010', date: '2026-06-17 14:00', content: '初次电话沟通，确认道教仪式需求', type: 'call' },
      { id: 'r011', date: '2026-06-17 16:30', content: '面谈确认道长名单和科仪内容', type: 'meeting' }
    ],
    requirements: [
      '全套道教超度法事',
      '搭设道教科仪坛场',
      '8位道长主持',
      '安排五七、百日后续道场'
    ]
  },
  {
    id: 'f005',
    name: '刘洋',
    relation: '孙子',
    phone: '135****8765',
    scheduleId: 's005',
    communicationRecords: [
      { id: 'r012', date: '2026-06-16 10:30', content: '面谈确认退役军人荣誉仪式方案', type: 'meeting' },
      { id: 'r013', date: '2026-06-17 09:00', content: '协调确认军乐队和老兵方阵出席', type: 'call' }
    ],
    requirements: [
      '国旗覆盖灵柩仪式',
      '军乐队现场演奏',
      '邀请老战友出席并致辞',
      '军功章荣誉展示'
    ]
  }
];

export const getFamilyByScheduleId = (scheduleId: string): FamilyContact | undefined => {
  return mockFamilyContacts.find(f => f.scheduleId === scheduleId);
};
