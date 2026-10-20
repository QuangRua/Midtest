// Project & Student Configuration
export const MSSV = 'BIT240031';
export const APP_NAME = `${MSSV}_FoodManager`;

// Storage Keys
export const STORAGE_KEYS = {
  CATEGORIES: `@${MSSV}_DishCategory`,
  DISHES: `@${MSSV}_Dish`,
  SYNC_QUEUE: `@${MSSV}_SyncQueue`,
  LANGUAGE: `@${MSSV}_Language`,
  MOCKAPI_URL: `@${MSSV}_MockApiUrl`,
  SIMULATE_OFFLINE: `@${MSSV}_SimulateOffline`,
  FILTER_STATE: `@${MSSV}_FilterState`,
};

// MockAPI Base URL provided by student BIT240031
export const DEFAULT_MOCKAPI_URL = 'https://6ad7470795e98f36aef23112.mockapi.io/api/v1';

// Tables / Endpoints
export const TABLE_NAMES = {
  DISH_CATEGORY: `${MSSV}_DishCategory`,
  DISH: `${MSSV}_Dish`,
};

// Field Keys with prefix BIT240031_
export const FIELDS = {
  CATEGORY: {
    ID: `${MSSV}_Id`,
    NAME: `${MSSV}_Name`,
    DESCRIPTION: `${MSSV}_Description`,
  },
  DISH: {
    ID: `${MSSV}_Id`,
    NAME: `${MSSV}_Name`,
    PRICE: `${MSSV}_Price`,
    PREPARATION_TIME: `${MSSV}_PreparationTime`,
    IS_AVAILABLE: `${MSSV}_IsAvailable`,
    DESCRIPTION: `${MSSV}_Description`,
    DISH_CATEGORY_ID: `${MSSV}_DishCategoryId`,
    DISH_IMAGE: `${MSSV}_DishImage`,
    IMAGE_URL: `${MSSV}_ImageUrl`,
    IS_THUMBNAIL: `${MSSV}_IsThumbnail`,
  },
};
