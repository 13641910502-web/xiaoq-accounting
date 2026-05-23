export interface DefaultCategory {
  id: string;
  name: string;
  type: 'main' | 'sub';
  parentId: string | null;
  icon: string;
  color: string;
  sortOrder: number;
}

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  // Main categories
  { id: 'food', name: '饮食', type: 'main', parentId: null, icon: '🍽️', color: '#FF6B6B', sortOrder: 0 },
  { id: 'shopping', name: '购物', type: 'main', parentId: null, icon: '🛍️', color: '#4ECDC4', sortOrder: 1 },
  { id: 'transport', name: '交通', type: 'main', parentId: null, icon: '🚗', color: '#6C5CE7', sortOrder: 2 },
  { id: 'housing', name: '住房', type: 'main', parentId: null, icon: '🏠', color: '#A29BFE', sortOrder: 3 },
  { id: 'entertainment', name: '娱乐', type: 'main', parentId: null, icon: '🎮', color: '#FD79A8', sortOrder: 4 },
  { id: 'medical', name: '医疗', type: 'main', parentId: null, icon: '🏥', color: '#E17055', sortOrder: 5 },
  { id: 'education', name: '教育', type: 'main', parentId: null, icon: '📚', color: '#00B894', sortOrder: 6 },
  { id: 'investment', name: '投资', type: 'main', parentId: null, icon: '📈', color: '#45B7D1', sortOrder: 7 },
  { id: 'relationship', name: '人情往来', type: 'main', parentId: null, icon: '🎁', color: '#F9CA24', sortOrder: 8 },
  { id: 'other', name: '其他', type: 'main', parentId: null, icon: '📦', color: '#B2BEC3', sortOrder: 9 },

  // Sub categories under 饮食
  { id: 'food-breakfast', name: '早餐', type: 'sub', parentId: 'food', icon: '🥐', color: '#FF6B6B', sortOrder: 0 },
  { id: 'food-lunch', name: '午餐', type: 'sub', parentId: 'food', icon: '🍱', color: '#FF6B6B', sortOrder: 1 },
  { id: 'food-dinner', name: '晚餐', type: 'sub', parentId: 'food', icon: '🍲', color: '#FF6B6B', sortOrder: 2 },
  { id: 'food-takeout', name: '外卖', type: 'sub', parentId: 'food', icon: '🛵', color: '#FF6B6B', sortOrder: 3 },
  { id: 'food-drinks', name: '饮品', type: 'sub', parentId: 'food', icon: '🧋', color: '#FF6B6B', sortOrder: 4 },
  { id: 'food-snacks', name: '零食', type: 'sub', parentId: 'food', icon: '🍿', color: '#FF6B6B', sortOrder: 5 },
  { id: 'food-gathering', name: '聚餐', type: 'sub', parentId: 'food', icon: '🍻', color: '#FF6B6B', sortOrder: 6 },
  { id: 'food-grocery', name: '买菜', type: 'sub', parentId: 'food', icon: '🥬', color: '#FF6B6B', sortOrder: 7 },

  // Sub categories under 购物
  { id: 'shop-clothing', name: '服装', type: 'sub', parentId: 'shopping', icon: '👗', color: '#4ECDC4', sortOrder: 0 },
  { id: 'shop-digital', name: '数码', type: 'sub', parentId: 'shopping', icon: '📱', color: '#4ECDC4', sortOrder: 1 },
  { id: 'shop-daily', name: '日用品', type: 'sub', parentId: 'shopping', icon: '🧴', color: '#4ECDC4', sortOrder: 2 },
  { id: 'shop-beauty', name: '美妆', type: 'sub', parentId: 'shopping', icon: '💄', color: '#4ECDC4', sortOrder: 3 },
  { id: 'shop-home', name: '家居', type: 'sub', parentId: 'shopping', icon: '🪑', color: '#4ECDC4', sortOrder: 4 },
  { id: 'shop-toys', name: '潮玩', type: 'sub', parentId: 'shopping', icon: '🎪', color: '#4ECDC4', sortOrder: 5 },
  { id: 'shop-books', name: '书籍', type: 'sub', parentId: 'shopping', icon: '📖', color: '#4ECDC4', sortOrder: 6 },
  { id: 'shop-pets', name: '宠物', type: 'sub', parentId: 'shopping', icon: '🐾', color: '#4ECDC4', sortOrder: 7 },

  // Sub categories under 交通
  { id: 'trans-bus', name: '公交', type: 'sub', parentId: 'transport', icon: '🚌', color: '#6C5CE7', sortOrder: 0 },
  { id: 'trans-metro', name: '地铁', type: 'sub', parentId: 'transport', icon: '🚇', color: '#6C5CE7', sortOrder: 1 },
  { id: 'trans-taxi', name: '打车', type: 'sub', parentId: 'transport', icon: '🚕', color: '#6C5CE7', sortOrder: 2 },
  { id: 'trans-fuel', name: '加油', type: 'sub', parentId: 'transport', icon: '⛽', color: '#6C5CE7', sortOrder: 3 },
  { id: 'trans-parking', name: '停车', type: 'sub', parentId: 'transport', icon: '🅿️', color: '#6C5CE7', sortOrder: 4 },
  { id: 'trans-train', name: '火车', type: 'sub', parentId: 'transport', icon: '🚄', color: '#6C5CE7', sortOrder: 5 },
  { id: 'trans-flight', name: '飞机', type: 'sub', parentId: 'transport', icon: '✈️', color: '#6C5CE7', sortOrder: 6 },

  // Sub categories under 住房
  { id: 'house-rent', name: '房租', type: 'sub', parentId: 'housing', icon: '🏢', color: '#A29BFE', sortOrder: 0 },
  { id: 'house-utility', name: '水电', type: 'sub', parentId: 'housing', icon: '💡', color: '#A29BFE', sortOrder: 1 },
  { id: 'house-gas', name: '燃气', type: 'sub', parentId: 'housing', icon: '🔥', color: '#A29BFE', sortOrder: 2 },
  { id: 'house-internet', name: '宽带', type: 'sub', parentId: 'housing', icon: '🌐', color: '#A29BFE', sortOrder: 3 },
  { id: 'house-repair', name: '维修', type: 'sub', parentId: 'housing', icon: '🔧', color: '#A29BFE', sortOrder: 4 },
  { id: 'house-supplies', name: '家装', type: 'sub', parentId: 'housing', icon: '🏗️', color: '#A29BFE', sortOrder: 5 },

  // Sub categories under 娱乐
  { id: 'ent-movie', name: '电影', type: 'sub', parentId: 'entertainment', icon: '🎬', color: '#FD79A8', sortOrder: 0 },
  { id: 'ent-gaming', name: '游戏', type: 'sub', parentId: 'entertainment', icon: '🎮', color: '#FD79A8', sortOrder: 1 },
  { id: 'ent-music', name: '音乐', type: 'sub', parentId: 'entertainment', icon: '🎵', color: '#FD79A8', sortOrder: 2 },
  { id: 'ent-travel', name: '旅行', type: 'sub', parentId: 'entertainment', icon: '✈️', color: '#FD79A8', sortOrder: 3 },
  { id: 'ent-sports', name: '运动', type: 'sub', parentId: 'entertainment', icon: '⚽', color: '#FD79A8', sortOrder: 4 },
  { id: 'ent-subscription', name: '订阅服务', type: 'sub', parentId: 'entertainment', icon: '📺', color: '#FD79A8', sortOrder: 5 },
  { id: 'ent-karaoke', name: 'KTV', type: 'sub', parentId: 'entertainment', icon: '🎤', color: '#FD79A8', sortOrder: 6 },

  // Sub categories under 医疗
  { id: 'med-hospital', name: '医院', type: 'sub', parentId: 'medical', icon: '🏥', color: '#E17055', sortOrder: 0 },
  { id: 'med-pharmacy', name: '药房', type: 'sub', parentId: 'medical', icon: '💊', color: '#E17055', sortOrder: 1 },
  { id: 'med-checkup', name: '体检', type: 'sub', parentId: 'medical', icon: '🩺', color: '#E17055', sortOrder: 2 },
  { id: 'med-dental', name: '牙科', type: 'sub', parentId: 'medical', icon: '🦷', color: '#E17055', sortOrder: 3 },

  // Sub categories under 教育
  { id: 'edu-tuition', name: '学费', type: 'sub', parentId: 'education', icon: '🎓', color: '#00B894', sortOrder: 0 },
  { id: 'edu-course', name: '培训', type: 'sub', parentId: 'education', icon: '📝', color: '#00B894', sortOrder: 1 },
  { id: 'edu-books', name: '教材', type: 'sub', parentId: 'education', icon: '📚', color: '#00B894', sortOrder: 2 },
  { id: 'edu-exam', name: '考试', type: 'sub', parentId: 'education', icon: '📋', color: '#00B894', sortOrder: 3 },

  // Sub categories under 投资
  { id: 'inv-stock', name: '股票', type: 'sub', parentId: 'investment', icon: '📊', color: '#45B7D1', sortOrder: 0 },
  { id: 'inv-fund', name: '基金', type: 'sub', parentId: 'investment', icon: '💰', color: '#45B7D1', sortOrder: 1 },
  { id: 'inv-insurance', name: '保险', type: 'sub', parentId: 'investment', icon: '🛡️', color: '#45B7D1', sortOrder: 2 },
  { id: 'inv-realestate', name: '房产', type: 'sub', parentId: 'investment', icon: '🏘️', color: '#45B7D1', sortOrder: 3 },

  // Sub categories under 人情往来
  { id: 'rel-gift', name: '礼物', type: 'sub', parentId: 'relationship', icon: '🎁', color: '#F9CA24', sortOrder: 0 },
  { id: 'rel-redpacket', name: '红包', type: 'sub', parentId: 'relationship', icon: '🧧', color: '#F9CA24', sortOrder: 1 },
  { id: 'rel-wedding', name: '婚礼', type: 'sub', parentId: 'relationship', icon: '💒', color: '#F9CA24', sortOrder: 2 },
  { id: 'rel-donate', name: '捐赠', type: 'sub', parentId: 'relationship', icon: '🤝', color: '#F9CA24', sortOrder: 3 },

  // Sub categories under 其他
  { id: 'other-phone', name: '通讯', type: 'sub', parentId: 'other', icon: '📞', color: '#B2BEC3', sortOrder: 0 },
  { id: 'other-express', name: '快递', type: 'sub', parentId: 'other', icon: '📦', color: '#B2BEC3', sortOrder: 1 },
  { id: 'other-fee', name: '手续费', type: 'sub', parentId: 'other', icon: '💳', color: '#B2BEC3', sortOrder: 2 },
  { id: 'other-unknown', name: '未知', type: 'sub', parentId: 'other', icon: '❓', color: '#B2BEC3', sortOrder: 99 },
];
