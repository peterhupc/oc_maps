export const CATEGORIES = [
  '街邊小吃',
  '高檔餐廳',
  '日式',
  '韓式',
  '南美燒烤',
  '咖啡輕食',
  '素食',
] as const

export const CATEGORY_TO_PLACES_TYPE: Record<string, string[]> = {
  街邊小吃: ['food', 'meal_takeaway'],
  高檔餐廳: ['restaurant'],
  日式: ['japanese_restaurant', 'sushi_restaurant', 'ramen_restaurant'],
  韓式: ['korean_restaurant'],
  南美燒烤: ['brazilian_restaurant', 'argentine_restaurant', 'barbecue_restaurant'],
  咖啡輕食: ['cafe', 'bakery', 'dessert'],
  素食: ['vegan_restaurant', 'vegetarian_restaurant'],
}

export function categoriesToTypes(cats: string[]): string[] {
  return cats.flatMap((c) => CATEGORY_TO_PLACES_TYPE[c] ?? [])
}
