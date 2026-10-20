import { MSSV } from '../constants/config';

// Pre-seeded initial categories (>= 3 categories)
export const INITIAL_CATEGORIES = [
  {
    id: '1',
    [`${MSSV}_Id`]: '1',
    [`${MSSV}_Name`]: 'Khai vị (Appetizers)',
    [`${MSSV}_Description`]: 'Light and refreshing dishes to start the meal',
  },
  {
    id: '2',
    [`${MSSV}_Id`]: '2',
    [`${MSSV}_Name`]: 'Món chính (Main Dishes)',
    [`${MSSV}_Description`]: 'Hearty traditional and modern main courses',
  },
  {
    id: '3',
    [`${MSSV}_Id`]: '3',
    [`${MSSV}_Name`]: 'Tráng miệng & Đồ uống (Desserts & Drinks)',
    [`${MSSV}_Description`]: 'Sweet treats and chilled artisan beverages',
  },
];

// Pre-seeded initial dishes (>= 5 dishes, multi-image, valid categories, valid prices)
export const INITIAL_DISHES = [
  {
    id: '1',
    [`${MSSV}_Id`]: '1',
    [`${MSSV}_Name`]: 'Phở Bò Tái Nạm',
    [`${MSSV}_Price`]: 65000,
    [`${MSSV}_PreparationTime`]: 12, // <= 15 min -> Quick
    [`${MSSV}_IsAvailable`]: true,
    [`${MSSV}_Description`]: 'Traditional Vietnamese beef noodle soup with tender beef slices, fresh herbs, scallions and rich 24-hour simmered bone broth.',
    [`${MSSV}_DishCategoryId`]: '2', // Main Dishes
    [`${MSSV}_DishImage`]: [
      {
        [`${MSSV}_ImageUrl`]: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&q=80',
        [`${MSSV}_IsThumbnail`]: true,
      },
      {
        [`${MSSV}_ImageUrl`]: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=800&q=80',
        [`${MSSV}_IsThumbnail`]: false,
      },
    ],
  },
  {
    id: '2',
    [`${MSSV}_Id`]: '2',
    [`${MSSV}_Name`]: 'Gỏi Cuốn Tôm Thịt',
    [`${MSSV}_Price`]: 45000,
    [`${MSSV}_PreparationTime`]: 10, // <= 15 min -> Quick
    [`${MSSV}_IsAvailable`]: true,
    [`${MSSV}_Description`]: 'Fresh rice paper spring rolls packed with poached prawns, tender pork belly, vermicelli, lettuce, and served with savory peanut dipping sauce.',
    [`${MSSV}_DishCategoryId`]: '1', // Appetizers
    [`${MSSV}_DishImage`]: [
      {
        [`${MSSV}_ImageUrl`]: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&q=80',
        [`${MSSV}_IsThumbnail`]: true,
      },
      {
        [`${MSSV}_ImageUrl`]: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=800&q=80',
        [`${MSSV}_IsThumbnail`]: false,
      },
    ],
  },
  {
    id: '3',
    [`${MSSV}_Id`]: '3',
    [`${MSSV}_Name`]: 'Cơm Tấm Sườn Bì Chả',
    [`${MSSV}_Price`]: 55000,
    [`${MSSV}_PreparationTime`]: 20, // > 15 min -> Regular
    [`${MSSV}_IsAvailable`]: true,
    [`${MSSV}_Description`]: 'Saigon broken rice topped with fragrant grilled lemongrass pork chop, shredded pork skin, steamed egg meatloaf, and sweet fish sauce.',
    [`${MSSV}_DishCategoryId`]: '2', // Main Dishes
    [`${MSSV}_DishImage`]: [
      {
        [`${MSSV}_ImageUrl`]: 'https://images.unsplash.com/photo-1505253758473-96b3d5ebcd97?w=800&q=80',
        [`${MSSV}_IsThumbnail`]: true,
      },
      {
        [`${MSSV}_ImageUrl`]: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
        [`${MSSV}_IsThumbnail`]: false,
      },
    ],
  },
  {
    id: '4',
    [`${MSSV}_Id`]: '4',
    [`${MSSV}_Name`]: 'Bò Kho Bánh Mì',
    [`${MSSV}_Price`]: 70000,
    [`${MSSV}_PreparationTime`]: 25, // > 15 min -> Regular
    [`${MSSV}_IsAvailable`]: false, // Unavailable / Ngừng bán
    [`${MSSV}_Description`]: 'Slow-braised aromatic beef shank stew with carrots, star anise, lemongrass, served piping hot with crusty French baguette.',
    [`${MSSV}_DishCategoryId`]: '2', // Main Dishes
    [`${MSSV}_DishImage`]: [
      {
        [`${MSSV}_ImageUrl`]: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80',
        [`${MSSV}_IsThumbnail`]: true,
      },
    ],
  },
  {
    id: '5',
    [`${MSSV}_Id`]: '5',
    [`${MSSV}_Name`]: 'Chè Hạt Sen Long Nhãn',
    [`${MSSV}_Price`]: 35000,
    [`${MSSV}_PreparationTime`]: 15, // <= 15 min -> Quick
    [`${MSSV}_IsAvailable`]: true,
    [`${MSSV}_Description`]: 'Sweet cooling soup made of fresh lotus seeds wrapped in juicy longan pulp with rock sugar syrup and jasmine aroma.',
    [`${MSSV}_DishCategoryId`]: '3', // Desserts & Drinks
    [`${MSSV}_DishImage`]: [
      {
        [`${MSSV}_ImageUrl`]: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&q=80',
        [`${MSSV}_IsThumbnail`]: true,
      },
      {
        [`${MSSV}_ImageUrl`]: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80',
        [`${MSSV}_IsThumbnail`]: false,
      },
    ],
  },
];
