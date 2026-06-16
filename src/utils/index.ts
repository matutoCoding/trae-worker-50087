export const formatDate = (date: string): string => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateCN = (date: string): string => {
  const d = new Date(date);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
};

export const getWeekDay = (date: string): string => {
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return days[new Date(date).getDay()];
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const getStatusText = (status: string): string => {
  const map: Record<string, string> = {
    free: '空闲',
    booked: '已预约',
    ongoing: '进行中',
    completed: '已完成',
    pending: '待结算',
    paid: '已结算'
  };
  return map[status] || status;
};

export const getStatusColor = (status: string): string => {
  const map: Record<string, string> = {
    free: '#38A169',
    booked: '#3182CE',
    ongoing: '#D69E2E',
    completed: '#718096',
    pending: '#E53E3E',
    paid: '#38A169'
  };
  return map[status] || '#718096';
};

export const getReligionText = (type: string): string => {
  const map: Record<string, string> = {
    buddhism: '佛教',
    taoism: '道教',
    christianity: '基督教',
    catholicism: '天主教',
    none: '无宗教'
  };
  return map[type] || type;
};

export const getCategoryText = (category: string): string => {
  const map: Record<string, string> = {
    traditional: '传统仪式',
    modern: '现代简约',
    religious: '宗教仪式',
    customized: '定制追思'
  };
  return map[category] || category;
};

export const getCommunicationTypeText = (type: string): string => {
  const map: Record<string, string> = {
    call: '电话',
    message: '消息',
    meeting: '面谈'
  };
  return map[type] || type;
};

export const getMonthDays = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

export const getFirstDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month, 1).getDay();
};

export const formatMoney = (amount: number): string => {
  return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const renderStars = (rating: number): string => {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  let stars = '';
  for (let i = 0; i < full; i++) stars += '★';
  if (half) stars += '☆';
  return stars || '★★★★★';
};
