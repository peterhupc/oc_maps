export interface CategoryGroup {
  key: string
  label: string
  items: string[]
}

export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    key: 'type',
    label: '停車場類型',
    items: ['公有停車場', '立體停車場', '平面停車場', '停車塔', '一般停車場'],
  },
]

export const CATEGORIES: string[] = CATEGORY_GROUPS.flatMap((g) => g.items)

export const CATEGORY_QUERY: Record<string, string> = {
  公有停車場: '公有停車場',
  立體停車場: '立體停車場',
  平面停車場: '平面停車場',
  停車塔: '停車塔',
  一般停車場: '停車場',
}

export function categoriesToQueries(cats: string[]): string[] {
  return cats.map((c) => CATEGORY_QUERY[c]).filter((q): q is string => Boolean(q))
}