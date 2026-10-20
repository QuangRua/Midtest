import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, DEFAULT_MOCKAPI_URL } from '../constants/config';
import { INITIAL_CATEGORIES, INITIAL_DISHES } from './initialData';

export const storageService = {
  // Categories
  async getCategories() {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error reading categories from AsyncStorage:', error);
      return null;
    }
  },

  async saveCategories(categories) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (error) {
      console.error('Error saving categories to AsyncStorage:', error);
    }
  },

  // Dishes
  async getDishes() {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.DISHES);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error reading dishes from AsyncStorage:', error);
      return null;
    }
  },

  async saveDishes(dishes) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.DISHES, JSON.stringify(dishes));
    } catch (error) {
      console.error('Error saving dishes to AsyncStorage:', error);
    }
  },

  // Sync Queue (Offline operations)
  async getSyncQueue() {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading sync queue:', error);
      return [];
    }
  },

  async saveSyncQueue(queue) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
    } catch (error) {
      console.error('Error saving sync queue:', error);
    }
  },

  async addToSyncQueue(operation) {
    try {
      const queue = await this.getSyncQueue();
      // operation: { id: timestamp/uuid, entity: 'dish'|'category', action: 'CREATE'|'UPDATE'|'DELETE', payload, timestamp }
      queue.push({
        ...operation,
        queueId: `queue_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp: Date.now(),
      });
      await this.saveSyncQueue(queue);
    } catch (error) {
      console.error('Error appending to sync queue:', error);
    }
  },

  async clearSyncQueue() {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.SYNC_QUEUE);
    } catch (error) {
      console.error('Error clearing sync queue:', error);
    }
  },

  // MockAPI URL config
  async getMockApiUrl() {
    try {
      const url = await AsyncStorage.getItem(STORAGE_KEYS.MOCKAPI_URL);
      return url || DEFAULT_MOCKAPI_URL;
    } catch (error) {
      return DEFAULT_MOCKAPI_URL;
    }
  },

  async saveMockApiUrl(url) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.MOCKAPI_URL, url.trim());
    } catch (error) {
      console.error('Error saving MockAPI URL:', error);
    }
  },

  // Offline Simulation Mode (For demo / grading)
  async getSimulateOffline() {
    try {
      const val = await AsyncStorage.getItem(STORAGE_KEYS.SIMULATE_OFFLINE);
      return val === 'true';
    } catch (error) {
      return false;
    }
  },

  async saveSimulateOffline(simulate) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SIMULATE_OFFLINE, simulate ? 'true' : 'false');
    } catch (error) {
      console.error('Error saving simulate offline:', error);
    }
  },

  // Filter State persistence (Requirement 4.2: keep conditions when returning)
  async getFilterState() {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.FILTER_STATE);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      return null;
    }
  },

  async saveFilterState(filterState) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.FILTER_STATE, JSON.stringify(filterState));
    } catch (error) {
      console.error('Error saving filter state:', error);
    }
  },

  // Initialize or Reset default dataset
  async seedInitialData(force = false) {
    const existingCategories = await this.getCategories();
    const existingDishes = await this.getDishes();

    if (force || !existingCategories || existingCategories.length === 0) {
      await this.saveCategories(INITIAL_CATEGORIES);
    }

    if (force || !existingDishes || existingDishes.length === 0) {
      await this.saveDishes(INITIAL_DISHES);
    }

    if (force) {
      await this.clearSyncQueue();
    }
  },
};
