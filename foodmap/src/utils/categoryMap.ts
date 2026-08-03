export interface CategoryGroup {
  key: 'cuisine' | 'style'
  labelKey: string
  items: string[]
}

export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    key: 'cuisine',
    labelKey: 'filter.groupCuisine',
    items: [
      '台式小吃',
      '夜市小吃',
      '中式熱炒',
      '港式點心',
      '日式拉麵',
      '日式壽司',
      '日式定食',
      '韓式料理',
      '泰式料理',
      '越式料理',
      '義式料理',
      '美式料理',
      '星馬料理',
      '印度料理',
    ],
  },
  {
    key: 'style',
    labelKey: 'filter.groupStyle',
    items: [
      '火鍋',
      '燒烤',
      '牛排',
      '咖啡廳',
      '手搖飲',
      '甜點冰品',
      '早午餐',
      '餐酒館',
      '便當快餐',
      '麵包烘焙',
      '素食蔬食',
    ],
  },
]

export const CATEGORIES: string[] = CATEGORY_GROUPS.flatMap((g) => g.items)

export const CATEGORY_QUERY: Record<string, string> = {
  台式小吃: '台灣小吃',
  夜市小吃: '夜市美食',
  中式熱炒: '熱炒',
  港式點心: '港式點心',
  日式拉麵: '拉麵',
  日式壽司: '壽司',
  日式定食: '日式定食',
  韓式料理: '韓式料理',
  泰式料理: '泰式料理',
  越式料理: '越南料理',
  義式料理: '義式料理',
  美式料理: '美式料理',
  星馬料理: '新加坡料理',
  印度料理: '印度料理',
  火鍋: '火鍋',
  燒烤: '燒烤',
  牛排: '牛排',
  咖啡廳: '咖啡',
  手搖飲: '手搖飲',
  甜點冰品: '甜點',
  早午餐: '早午餐',
  餐酒館: '餐酒館',
  便當快餐: '便當',
  麵包烘焙: '麵包',
  素食蔬食: '素食',
}

export function categoriesToQueries(cats: string[]): string[] {
  return cats.map((c) => CATEGORY_QUERY[c]).filter((q): q is string => Boolean(q))
}
