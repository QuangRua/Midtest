import { storageService } from './storageService';
import { mockApiService } from './mockApiService';
import { MSSV } from '../constants/config';

let isSyncing = false;

export const syncService = {
  isCurrentlySyncing() {
    return isSyncing;
  },

  async processSyncQueue() {
    if (isSyncing) return { success: false, reason: 'Already syncing' };

    const queue = await storageService.getSyncQueue();
    if (!queue || queue.length === 0) {
      return { success: true, count: 0 };
    }

    isSyncing = true;
    const remainingQueue = [...queue];
    const idMap = new Map(); // Maps temp_id -> real MockAPI id
    let syncedCount = 0;

    try {
      let localDishes = (await storageService.getDishes()) || [];
      let localCategories = (await storageService.getCategories()) || [];

      for (let i = 0; i < queue.length; i++) {
        const item = queue[i];
        let targetId = item.payload?.[`${MSSV}_Id`] || item.payload?.id;

        // If targetId was previously mapped from a temp ID, resolve it
        if (idMap.has(targetId)) {
          targetId = idMap.get(targetId);
        }

        try {
          if (item.entity === 'dish') {
            if (item.action === 'CREATE') {
              // Create on MockAPI
              const created = await mockApiService.createDish(item.payload);
              const realId = created[`${MSSV}_Id`];
              const oldTempId = item.payload[`${MSSV}_Id`];
              
              if (oldTempId && oldTempId !== realId) {
                idMap.set(oldTempId, realId);
                // Update local dishes list replacing old temp id with real id
                localDishes = localDishes.map((d) =>
                  d[`${MSSV}_Id`] === oldTempId
                    ? { ...d, [`${MSSV}_Id`]: realId, id: realId }
                    : d
                );
                await storageService.saveDishes(localDishes);
              }
              syncedCount++;
            } else if (item.action === 'UPDATE') {
              // Update on MockAPI
              if (targetId && !targetId.toString().startsWith('temp_')) {
                await mockApiService.updateDish(targetId, item.payload);
                syncedCount++;
              }
            } else if (item.action === 'DELETE') {
              // Delete on MockAPI
              if (targetId && !targetId.toString().startsWith('temp_')) {
                await mockApiService.deleteDish(targetId);
                syncedCount++;
              }
            }
          } else if (item.entity === 'category') {
            if (item.action === 'CREATE') {
              const created = await mockApiService.createCategory(item.payload);
              const realId = created[`${MSSV}_Id`];
              const oldTempId = item.payload[`${MSSV}_Id`];
              
              if (oldTempId && oldTempId !== realId) {
                idMap.set(oldTempId, realId);
                localCategories = localCategories.map((c) =>
                  c[`${MSSV}_Id`] === oldTempId
                    ? { ...c, [`${MSSV}_Id`]: realId, id: realId }
                    : c
                );
                await storageService.saveCategories(localCategories);
              }
              syncedCount++;
            } else if (item.action === 'UPDATE') {
              if (targetId && !targetId.toString().startsWith('temp_')) {
                await mockApiService.updateCategory(targetId, item.payload);
                syncedCount++;
              }
            } else if (item.action === 'DELETE') {
              if (targetId && !targetId.toString().startsWith('temp_')) {
                await mockApiService.deleteCategory(targetId);
                syncedCount++;
              }
            }
          }

          // Remove the successfully synced item from remainingQueue
          const idx = remainingQueue.findIndex((q) => q.queueId === item.queueId);
          if (idx !== -1) {
            remainingQueue.splice(idx, 1);
            await storageService.saveSyncQueue(remainingQueue);
          }
        } catch (itemError) {
          console.warn(`Sync item failed (${item.action} ${item.entity}):`, itemError);
          // Stop queue processing on network drop; keep remaining in queue
          break;
        }
      }

      // After queue drain, fetch fresh data from MockAPI to ensure consistency
      try {
        const freshDishes = await mockApiService.getDishes();
        if (freshDishes && freshDishes.length > 0) {
          await storageService.saveDishes(freshDishes);
        }
        const freshCats = await mockApiService.getCategories();
        if (freshCats && freshCats.length > 0) {
          await storageService.saveCategories(freshCats);
        }
      } catch (refreshErr) {
        // MockAPI might still be down or endpoints empty, retain local
      }

      return { success: true, count: syncedCount, remaining: remainingQueue.length };
    } catch (err) {
      console.error('Fatal sync error:', err);
      return { success: false, error: err.message };
    } finally {
      isSyncing = false;
    }
  },
};
