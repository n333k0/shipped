// inspo industry tag → our business categories. A discovered site joins a category only through
// this map, so a category shows sites of that industry and nothing else.
export const fromInspo = {
  ai: ['saas'], saas: ['saas'], 'developer-tools': ['saas'],
  agency: ['creative'], 'type-foundry': ['creative'],
  education: ['services'], // non-profit fits none of our categories
  ecommerce: ['ecommerce'], 'consumer-tech': ['ecommerce'], automotive: ['ecommerce'],
  furniture: ['architecture', 'ecommerce'], architecture: ['architecture'],
  // travel is booking apps and transport (Hopper, Lyft), not hospitality brands: hand-picked hotels fill that category
  health: ['health'],
  fashion: ['fashion', 'ecommerce'],
  culture: ['culture'], media: ['culture'], music: ['culture'], // gaming is platforms (Discord, Steam), not culture
  'food-beverage': ['food'],
  fintech: ['finance'], crypto: ['finance'],
  portfolio: ['personal', 'creative'], creator: ['personal'],
};

export const catsFor = (industries = []) => [...new Set(industries.flatMap((i) => fromInspo[i] ?? []))];
