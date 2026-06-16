import { CeremonyStep, MusicItem, ReligionConfig } from '@/types';

export const mockCeremonySteps: Record<string, CeremonyStep[]> = {
  buddhism: [
    { id: 'b1', order: 1, title: '入场仪式', duration: 10, description: '家属、来宾入场就座，司仪开场', hostTips: '引导来宾有序入场，保持肃静', music: '佛教梵音-入场', completed: true },
    { id: 'b2', order: 2, title: '诵经祈福', duration: 30, description: '僧人诵经为逝者超度祈福', hostTips: '引导家属配合诵经节奏，可跪拜', music: '地藏经-选段', completed: true },
    { id: 'b3', order: 3, title: '默哀致敬', duration: 5, description: '全体起立默哀三分钟', hostTips: '提醒全体起立，保持肃穆', music: '静默', completed: false },
    { id: 'b4', order: 4, title: '生平介绍', duration: 15, description: '由司仪介绍逝者生平事迹', hostTips: '语气庄重，语速适中', music: '轻缓佛乐', completed: false },
    { id: 'b5', order: 5, title: '家属致悼', duration: 20, description: '家属代表致悼词', hostTips: '准备纸巾，留意家属情绪', music: '哀思曲', completed: false },
    { id: 'b6', order: 6, title: '三鞠躬礼', duration: 5, description: '全体向逝者遗像三鞠躬', hostTips: '统一口令：一鞠躬，再鞠躬，三鞠躬', music: '庄重佛乐', completed: false },
    { id: 'b7', order: 7, title: '瞻仰遗容', duration: 20, description: '来宾依次瞻仰遗容并慰问家属', hostTips: '引导队伍有序前进，控制节奏', music: '舒缓梵音', completed: false },
    { id: 'b8', order: 8, title: '出殡仪式', duration: 15, description: '灵柩起灵，送往火化场', hostTips: '引导孝子摔盆等传统习俗', music: '起灵乐', completed: false }
  ],
  taoism: [
    { id: 't1', order: 1, title: '请神安位', duration: 20, description: '道士设坛请神，安奉逝者灵位', hostTips: '配合道士安排祭品摆放', music: '道教韵乐' },
    { id: 't2', order: 2, title: '诵经超度', duration: 40, description: '道士诵经超度亡魂', hostTips: '引导家属按仪轨行礼', music: '度人经' },
    { id: 't3', order: 3, title: '破狱科仪', duration: 30, description: '道教破狱救苦科仪', hostTips: '维持现场秩序，配合法事节奏', music: '救苦韵' },
    { id: 't4', order: 4, title: '生平追念', duration: 15, description: '司仪追忆逝者生平', hostTips: '融入道家对生死的阐释', music: '清虚乐' },
    { id: 't5', order: 5, title: '拜别送行', duration: 20, description: '家属依次拜别逝者', hostTips: '引导家属行礼顺序', music: '送仙乐' }
  ],
  christianity: [
    { id: 'c1', order: 1, title: '唱诗入场', duration: 10, description: '诗班唱诗，家属入场', hostTips: '安排诗班位置和曲目', music: '奇异恩典' },
    { id: 'c2', order: 2, title: '开场祷告', duration: 10, description: '牧师主持开场祷告', hostTips: '请牧师到台前', music: '轻声伴奏' },
    { id: 'c3', order: 3, title: '诵读经文', duration: 15, description: '诵读圣经相关章节', hostTips: '准备好经文内容', music: '静谧音乐' },
    { id: 'c4', order: 4, title: '追思证道', duration: 25, description: '牧师分享信仰信息与逝者生平', hostTips: '提前沟通证道内容', music: '舒缓圣乐' },
    { id: 'c5', order: 5, title: '家属分享', duration: 20, description: '家属分享与逝者的回忆', hostTips: '准备纸巾和水', music: '温柔钢琴' },
    { id: 'c6', order: 6, title: '主祷文', duration: 5, description: '全体同诵主祷文', hostTips: '引导全体起立', music: '主祷文配乐' },
    { id: 'c7', order: 7, title: '祝福差遣', duration: 10, description: '牧师祝福，仪式结束', hostTips: '引导来宾有序离场', music: '荣耀歌' }
  ],
  catholicism: [
    { id: 'ca1', order: 1, title: '弥撒开始', duration: 10, description: '天主教殡葬弥撒开始，进堂咏', hostTips: '安排神父、辅祭人员就位', music: '进堂曲' },
    { id: 'ca2', order: 2, title: '圣道礼仪', duration: 35, description: '读经、答唱咏、福音、讲道', hostTips: '准备读经台和经书', music: '答唱咏' },
    { id: 'ca3', order: 3, title: '圣祭礼仪', duration: 40, description: '奉献经、感恩经、圣体圣事', hostTips: '引导教友有序领圣体', music: '圣哉经' },
    { id: 'ca4', order: 4, title: '告别礼', duration: 20, description: '向灵柩致敬、洒圣水', hostTips: '准备圣水和十字架', music: '告别曲' }
  ],
  none: [
    { id: 'n1', order: 1, title: '入场就座', duration: 10, description: '家属来宾有序入场', hostTips: '引导入座，维持秩序', music: '轻柔入场曲', completed: true },
    { id: 'n2', order: 2, title: '默哀仪式', duration: 5, description: '全体肃立默哀三分钟', hostTips: '把控默哀时间', music: '静默', completed: true },
    { id: 'n3', order: 3, title: '生平追忆', duration: 25, description: '司仪讲述逝者生平故事', hostTips: '提前准备生平素材，情感真挚', music: '追忆似水年华', completed: false },
    { id: 'n4', order: 4, title: '家属致辞', duration: 20, description: '家属代表致悼词', hostTips: '多准备纸巾，给予支持', music: '温暖钢琴曲', completed: false },
    { id: 'n5', order: 5, title: '朋友追思', duration: 15, description: '生前好友发言', hostTips: '安排发言顺序和时间', music: '友谊地久天长', completed: false },
    { id: 'n6', order: 6, title: '三鞠躬礼', duration: 5, description: '全体向逝者三鞠躬告别', hostTips: '统一口令', music: '告别曲', completed: false },
    { id: 'n7', order: 7, title: '鲜花告别', duration: 20, description: '来宾依次献花并慰问家属', hostTips: '控制节奏，引导队伍', music: '鲜花曲', completed: false }
  ]
};

export const mockMusicList: MusicItem[] = [
  { id: 'm01', name: '哀歌-传统版', artist: '传统民乐', duration: '05:20', category: '传统', mood: 'solemn' },
  { id: 'm02', name: '追思曲', artist: '交响乐团', duration: '06:30', category: '古典', mood: 'solemn' },
  { id: 'm03', name: '时间都去哪儿了', artist: '王铮亮', duration: '04:10', category: '流行', mood: 'warm' },
  { id: 'm04', name: '感恩的心', artist: '欧阳菲菲', duration: '04:45', category: '流行', mood: 'warm' },
  { id: 'm05', name: '奇异恩典', artist: '圣诗班', duration: '04:20', category: '宗教', mood: 'peaceful' },
  { id: 'm06', name: '大悲咒', artist: '佛教唱诵', duration: '08:15', category: '宗教', mood: 'solemn' },
  { id: 'm07', name: '道德经-选段', artist: '道教韵乐', duration: '05:50', category: '宗教', mood: 'tradition' },
  { id: 'm08', name: '夜曲-肖邦', artist: '钢琴独奏', duration: '05:00', category: '古典', mood: 'peaceful' },
  { id: 'm09', name: '烛光里的妈妈', artist: '毛阿敏', duration: '04:55', category: '流行', mood: 'warm' },
  { id: 'm10', name: '父亲', artist: '崔京浩', duration: '04:30', category: '流行', mood: 'warm' },
  { id: 'm11', name: '天空之城', artist: '久石让', duration: '04:15', category: '古典', mood: 'peaceful' },
  { id: 'm12', name: '故乡的原风景', artist: '宗次郎', duration: '04:40', category: '传统', mood: 'peaceful' }
];

export const mockReligionConfigs: ReligionConfig[] = [
  {
    type: 'buddhism',
    name: '佛教',
    description: '佛教强调因果轮回，超度亡者离苦得乐，往生西方极乐世界',
    ceremonySteps: ['请灵安位', '诵经超度', '供灯祈福', '放生回向', '佛号相送'],
    customs: ['设灵堂供佛灯', '供奉素斋', '家属可穿海青缦衣', '七七四十九天法事'],
    taboos: ['忌供荤腥', '忌喧哗嬉闹', '忌在灵堂杀生'],
    musicRecommendations: ['大悲咒', '阿弥陀佛圣号', '地藏经', '往生咒']
  },
  {
    type: 'taoism',
    name: '道教',
    description: '道教追求得道成仙，通过科仪超度亡魂脱离苦海，早登仙界',
    ceremonySteps: ['请神安位', '诵经礼忏', '破狱救苦', '炼度亡魂', '送神回驾'],
    customs: ['设坛供奉三清', '摆放五供祭品', '烧纸钱元宝', '做五七、百日道场'],
    taboos: ['忌用牛肉供神', '忌孕妇参加法事', '忌孝期嫁娶'],
    musicRecommendations: ['救苦赞', '送仙乐', '步虚韵', '白鹤飞']
  },
  {
    type: 'christianity',
    name: '基督教',
    description: '基督教相信复活永生，追思礼拜赞美上帝，安慰家属，送别亲人',
    ceremonySteps: ['唱诗入场', '祷告开场', '诵读经文', '追思证道', '祝福差遣'],
    customs: ['摆放鲜花十字架', '唱诗赞美', '读经祷告', '不烧纸钱不跪拜'],
    taboos: ['忌跪拜偶像', '忌烧纸祭祀', '忌哭号过度'],
    musicRecommendations: ['奇异恩典', '这一生最美的祝福', '耶稣恩友', '荣归天父歌']
  },
  {
    type: 'catholicism',
    name: '天主教',
    description: '天主教殡葬弥撒为亡者祈祷，求主赐其安息，等候复活之日',
    ceremonySteps: ['弥撒开始', '圣道礼仪', '圣祭礼仪', '领圣体', '告别礼'],
    customs: ['神父主持弥撒', '洒圣水', '奉香', '为亡者献弥撒'],
    taboos: ['忌非天主教徒领圣体', '忌礼仪期间喧哗', '忌不符合教义的习俗'],
    musicRecommendations: ['进堂曲', '答唱咏', '圣哉经', '羔羊颂']
  },
  {
    type: 'none',
    name: '无宗教',
    description: '现代简约追思仪式，尊重逝者遗愿，追忆生平，表达思念',
    ceremonySteps: ['入场默哀', '生平追忆', '亲友致辞', '鞠躬告别', '鲜花送别'],
    customs: ['播放逝者生平视频', '摆放生前照片', '播放喜爱的音乐', '收集亲友寄语'],
    taboos: ['避免过度喧闹', '尊重逝者及家属意愿'],
    musicRecommendations: ['逝者生前喜爱的音乐', '舒缓纯音乐', '温暖回忆类歌曲']
  }
];
