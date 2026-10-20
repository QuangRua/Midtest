import { TABLE_NAMES, MSSV } from '../constants/config';
import { storageService } from './storageService';

const TIMEOUT_MS = 6000;

const fetchWithTimeout = async (url, options = {}, timeout = TIMEOUT_MS) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

export const mockApiService = {
  // Test connection to verify MockAPI URL
  async testConnection(customUrl) {
    const baseUrl = customUrl || (await storageService.getMockApiUrl());
    try {
      const res = await fetchWithTimeout(`${baseUrl}/${TABLE_NAMES.DISH_CATEGORY}`, { method: 'GET' }, 4000);
      return res.ok || res.status === 404; // 404 means server reached but endpoint might need creation
    } catch (e) {
      return false;
    }
  },

  // CATEGORIES API
  async getCategories() {
    const baseUrl = await storageService.getMockApiUrl();
    const url = `${baseUrl}/${TABLE_NAMES.DISH_CATEGORY}`;
    const response = await fetchWithTimeout(url, { method: 'GET' });
    if (!response.ok) {
      throw new Error(`MockAPI error ${response.status}: Failed to fetch categories`);
    }
    const data = await response.json();
    return (data || []).map((cat) => ({
      ...cat,
      [`${MSSV}_Id`]: String(cat[`${MSSV}_Id`] || cat.id),
      id: String(cat.id || cat[`${MSSV}_Id`]),
    }));
  },

  async createCategory(categoryData) {
    const baseUrl = await storageService.getMockApiUrl();
    const url = `${baseUrl}/${TABLE_NAMES.DISH_CATEGORY}`;
    const payload = {
      ...categoryData,
      [`${MSSV}_Name`]: categoryData[`${MSSV}_Name`],
      [`${MSSV}_Description`]: categoryData[`${MSSV}_Description`] || '',
    };
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`MockAPI error ${response.status}: Failed to create category`);
    }
    const created = await response.json();
    return {
      ...created,
      [`${MSSV}_Id`]: String(created[`${MSSV}_Id`] || created.id),
      id: String(created.id || created[`${MSSV}_Id`]),
    };
  },

  async updateCategory(id, categoryData) {
    const baseUrl = await storageService.getMockApiUrl();
    const url = `${baseUrl}/${TABLE_NAMES.DISH_CATEGORY}/${id}`;
    const response = await fetchWithTimeout(url, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
    if (!response.ok) {
      throw new Error(`MockAPI error ${response.status}: Failed to update category`);
    }
    const updated = await response.json();
    return {
      ...updated,
      [`${MSSV}_Id`]: String(updated[`${MSSV}_Id`] || updated.id),
      id: String(updated.id || updated[`${MSSV}_Id`]),
    };
  },

  async deleteCategory(id) {
    const baseUrl = await storageService.getMockApiUrl();
    const url = `${baseUrl}/${TABLE_NAMES.DISH_CATEGORY}/${id}`;
    const response = await fetchWithTimeout(url, { method: 'DELETE' });
    if (!response.ok && response.status !== 404) {
      throw new Error(`MockAPI error ${response.status}: Failed to delete category`);
    }
    return true;
  },

  // DISHES API
  async getDishes() {
    const baseUrl = await storageService.getMockApiUrl();
    const url = `${baseUrl}/${TABLE_NAMES.DISH}`;
    const response = await fetchWithTimeout(url, { method: 'GET' });
    if (!response.ok) {
      throw new Error(`MockAPI error ${response.status}: Failed to fetch dishes`);
    }
    const data = await response.json();
    return (data || []).map((dish) => ({
      ...dish,
      [`${MSSV}_Id`]: String(dish[`${MSSV}_Id`] || dish.id),
      id: String(dish.id || dish[`${MSSV}_Id`]),
      [`${MSSV}_Price`]: Number(dish[`${MSSV}_Price`] || 0),
      [`${MSSV}_PreparationTime`]: Number(dish[`${MSSV}_PreparationTime`] || 0),
      [`${MSSV}_IsAvailable`]: Boolean(dish[`${MSSV}_IsAvailable`]),
      [`${MSSV}_DishCategoryId`]: String(dish[`${MSSV}_DishCategoryId`] || ''),
      [`${MSSV}_DishImage`]: Array.isArray(dish[`${MSSV}_DishImage`]) ? dish[`${MSSV}_DishImage`] : [],
    }));
  },

  async createDish(dishData) {
    const baseUrl = await storageService.getMockApiUrl();
    const url = `${baseUrl}/${TABLE_NAMES.DISH}`;
    // Strip temporary local ID before posting to MockAPI so MockAPI assigns new ID
    const { id, [`${MSSV}_Id`]: mssvId, ...cleanPayload } = dishData;
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      body: JSON.stringify(cleanPayload),
    });
    if (!response.ok) {
      throw new Error(`MockAPI error ${response.status}: Failed to create dish`);
    }
    const created = await response.json();
    return {
      ...created,
      [`${MSSV}_Id`]: String(created[`${MSSV}_Id`] || created.id),
      id: String(created.id || created[`${MSSV}_Id`]),
    };
  },

  async updateDish(id, dishData) {
    const baseUrl = await storageService.getMockApiUrl();
    const url = `${baseUrl}/${TABLE_NAMES.DISH}/${id}`;
    const response = await fetchWithTimeout(url, {
      method: 'PUT',
      body: JSON.stringify(dishData),
    });
    if (!response.ok) {
      throw new Error(`MockAPI error ${response.status}: Failed to update dish`);
    }
    const updated = await response.json();
    return {
      ...updated,
      [`${MSSV}_Id`]: String(updated[`${MSSV}_Id`] || updated.id),
      id: String(updated.id || updated[`${MSSV}_Id`]),
    };
  },

  async deleteDish(id) {
    const baseUrl = await storageService.getMockApiUrl();
    const url = `${baseUrl}/${TABLE_NAMES.DISH}/${id}`;
    const response = await fetchWithTimeout(url, { method: 'DELETE' });
    if (!response.ok && response.status !== 404) {
      throw new Error(`MockAPI error ${response.status}: Failed to delete dish`);
    }
    return true;
  },
};
