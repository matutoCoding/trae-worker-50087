import { ReviewItem, SettlementItem, MasterProfile } from '@/types';

export const mockReviews: ReviewItem[] = [
  {
    id: 'rv001',
    scheduleId: 's006',
    familyName: '赵军',
    date: '2026-06-16',
    rating: 5.0,
    content: '李司仪非常专业，把奶奶的百岁喜丧办得庄重而温馨。每一个环节都安排得井井有条，家人都非常满意。感谢！',
    tags: ['专业', '细心', '有温度'],
    reply: '感谢赵先生的信任与认可！赵老太福寿圆满，是她老人家的福报。祝您全家平安顺遂！'
  },
  {
    id: 'rv002',
    scheduleId: 's007',
    familyName: '孙伟',
    date: '2026-06-15',
    rating: 4.9,
    content: '感谢李司仪帮助我们按照天主教礼仪送别父亲。弥撒安排得非常妥当，和教堂的协调也很顺畅。',
    tags: ['懂礼仪', '协调能力强', '认真负责'],
    reply: '孙先生客气了！能为您父亲做好最后一程的服务，是我的荣幸。节哀顺变！'
  },
  {
    id: 'rv003',
    scheduleId: '',
    familyName: '周女士',
    date: '2026-06-12',
    rating: 5.0,
    content: '李司仪对佛教仪轨非常熟悉，和僧团的配合也很默契。父亲的法会庄严圆满，家人都很安心。',
    tags: ['熟悉佛教仪轨', '配合默契', '庄重']
  },
  {
    id: 'rv004',
    scheduleId: '',
    familyName: '吴先生',
    date: '2026-06-08',
    rating: 4.8,
    content: '整个过程感受到了李司仪的用心和关怀。在我们最悲痛的时候，给予了我们很多安慰和支持。',
    tags: ['有同理心', '关怀家属', '服务周到'],
    reply: '送别亲人是人生最难过的时刻，能陪伴你们走过，是我应该做的。请多保重！'
  },
  {
    id: 'rv005',
    scheduleId: '',
    familyName: '郑女士',
    date: '2026-06-05',
    rating: 5.0,
    content: '母亲生前是教师，李司仪在仪式中特别加入了学生回忆的环节，让我们和所有到场的学生都非常感动。',
    tags: ['有创意', '理解需求', '感动全场']
  }
];

export const mockSettlements: SettlementItem[] = [
  {
    id: 'st001',
    scheduleId: 's006',
    date: '2026-06-15',
    deceasedName: '赵玉兰',
    amount: 8200,
    status: 'paid',
    paymentMethod: '银行转账',
    paidDate: '2026-06-15'
  },
  {
    id: 'st002',
    scheduleId: 's007',
    date: '2026-06-14',
    deceasedName: '孙志明',
    amount: 8800,
    status: 'paid',
    paymentMethod: '微信支付',
    paidDate: '2026-06-14'
  },
  {
    id: 'st003',
    scheduleId: '',
    date: '2026-06-10',
    deceasedName: '陈海天',
    amount: 15800,
    status: 'paid',
    paymentMethod: '银行转账',
    paidDate: '2026-06-10'
  },
  {
    id: 'st004',
    scheduleId: 's001',
    date: '2026-06-17',
    deceasedName: '张建国',
    amount: 8800,
    status: 'pending'
  },
  {
    id: 'st005',
    scheduleId: 's002',
    date: '2026-06-17',
    deceasedName: '李秀英',
    amount: 6800,
    status: 'pending'
  },
  {
    id: 'st006',
    scheduleId: '',
    date: '2026-06-08',
    deceasedName: '钱老先生',
    amount: 9200,
    status: 'paid',
    paymentMethod: '现金',
    paidDate: '2026-06-08'
  },
  {
    id: 'st007',
    scheduleId: '',
    date: '2026-06-05',
    deceasedName: '马老太',
    amount: 7600,
    status: 'paid',
    paymentMethod: '支付宝',
    paidDate: '2026-06-05'
  }
];

export const mockMasterProfile: MasterProfile = {
  name: '李明德',
  title: '高级殡仪司仪',
  avatar: 'https://picsum.photos/id/1027/200/200',
  experience: 18,
  ceremoniesCount: 2856,
  rating: 4.9,
  certifications: [
    '国家一级殡仪司仪资格证书',
    '中国殡葬协会高级会员',
    '佛教仪轨专业培训认证',
    '天主教殡葬礼仪培训证书',
    '心理咨询师（三级）'
  ]
};

export const getMonthlyIncome = (): { paid: number; pending: number; total: number } => {
  const paid = mockSettlements.filter(s => s.status === 'paid').reduce((sum, s) => sum + s.amount, 0);
  const pending = mockSettlements.filter(s => s.status === 'pending').reduce((sum, s) => sum + s.amount, 0);
  return { paid, pending, total: paid + pending };
};
