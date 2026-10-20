import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { storageService } from '../services/storageService';
import { mockApiService } from '../services/mockApiService';
import { useNetwork } from './NetworkContext';
import { MSSV, FIELDS } from '../constants/config';

const FoodContext = createContext(null);

export const FoodProvider = ({ children }) => {
  const { isOnline, refreshPendingCount } = useNetwork();

  const [categories, setCategories] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Persistent Filter & Sort State (Requirement 4.2)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(''); // '' means All
  const [selectedStatus, setSelectedStatus] = useState('ALL'); // 'ALL' | 'AVAILABLE'
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('DEFAULT'); // 'DEFAULT' | 'PRICE_ASC' | 'PRICE_DESC' | 'PREP_TIME_ASC'

  // Load initial data
  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Ensure initial seed exists in local storage
      await storageService.seedInitialData(false);

      // 2. Load from local storage first (instant rendering)
      const localCats = (await storageService.getCategories()) || [];
      const localDishes = (await storageService.getDishes()) || [];
      setCategories(localCats);
      setDishes(localDishes);

      // 3. Load saved filter state if present
      const savedFilters = await storageService.getFilterState();
      if (savedFilters) {
        if (typeof savedFilters.searchQuery === 'string') setSearchQuery(savedFilters.searchQuery);
        if (typeof savedFilters.selectedCategory === 'string') setSelectedCategory(savedFilters.selectedCategory);
        if (typeof savedFilters.selectedStatus === 'string') setSelectedStatus(savedFilters.selectedStatus);
        if (typeof savedFilters.minPrice === 'string') setMinPrice(savedFilters.minPrice);
        if (typeof savedFilters.maxPrice === 'string') setMaxPrice(savedFilters.maxPrice);
        if (typeof savedFilters.sortBy === 'string') setSortBy(savedFilters.sortBy);
      }

      // 4. If online, fetch from MockAPI
      if (isOnline) {
        try {
          const apiCats = await mockApiService.getCategories();
          if (apiCats && apiCats.length > 0) {
            setCategories(apiCats);
            await storageService.saveCategories(apiCats);
          } else if (localCats.length > 0) {
            // If MockAPI is newly created and empty, seed MockAPI with local categories
            for (const cat of localCats) {
              try {
                await mockApiService.createCategory(cat);
              } catch (e) {}
            }
          }

          const apiDishes = await mockApiService.getDishes();
          if (apiDishes && apiDishes.length > 0) {
            setDishes(apiDishes);
            await storageService.saveDishes(apiDishes);
          } else if (localDishes.length > 0) {
            // Seed MockAPI with local dishes if MockAPI endpoint is empty
            for (const dish of localDishes) {
              try {
                await mockApiService.createDish(dish);
              } catch (e) {}
            }
          }
        } catch (apiErr) {
          console.warn('MockAPI fetch warning (using local cache):', apiErr.message);
        }
      }
    } catch (err) {
      console.error('Error in loadInitialData:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
      refreshPendingCount();
    }
  }, [isOnline, refreshPendingCount]);

  useEffect(() => {
    loadInitialData();
  }, []);

  // Persist filter conditions whenever they change (Requirement 4.2)
  useEffect(() => {
    const filterState = {
      searchQuery,
      selectedCategory,
      selectedStatus,
      minPrice,
      maxPrice,
      sortBy,
    };
    storageService.saveFilterState(filterState);
  }, [searchQuery, selectedCategory, selectedStatus, minPrice, maxPrice, sortBy]);

  // Reset filters
  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedStatus('ALL');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('DEFAULT');
  }, []);

  // Validation Helpers
  const validateDish = (dishData, existingId = null) => {
    const name = (dishData[`${MSSV}_Name`] || '').trim();
    const price = Number(dishData[`${MSSV}_Price`]);
    const prepTime = Number(dishData[`${MSSV}_PreparationTime`]);
    const categoryId = String(dishData[`${MSSV}_DishCategoryId`] || '');

    if (!name) {
      return { valid: false, errorKey: 'valNameRequired' };
    }
    if (isNaN(price) || price <= 0) {
      return { valid: false, errorKey: 'valPricePositive' };
    }
    if (isNaN(prepTime) || prepTime <= 0) {
      return { valid: false, errorKey: 'valPrepTimePositive' };
    }
    if (!categoryId || !categories.some((c) => String(c[`${MSSV}_Id`]) === categoryId)) {
      return { valid: false, errorKey: 'valCategoryRequired' };
    }

    // Dish name must not be duplicate within same category
    const isDuplicate = dishes.some((d) => {
      const dId = String(d[`${MSSV}_Id`]);
      if (existingId && dId === String(existingId)) return false;
      const sameCat = String(d[`${MSSV}_DishCategoryId`]) === categoryId;
      const sameName = (d[`${MSSV}_Name`] || '').trim().toLowerCase() === name.toLowerCase();
      return sameCat && sameName;
    });

    if (isDuplicate) {
      return { valid: false, errorKey: 'valDishNameDuplicate' };
    }

    return { valid: true };
  };

  // DISH CRUD
  const createDish = async (dishInput) => {
    const validation = validateDish(dishInput);
    if (!validation.valid) {
      throw new Error(validation.errorKey);
    }

    // Ensure thumbnail logic: at most 1 thumbnail
    let images = Array.isArray(dishInput[`${MSSV}_DishImage`]) ? [...dishInput[`${MSSV}_DishImage`]] : [];
    let hasThumb = false;
    images = images.map((img) => {
      if (img[`${MSSV}_IsThumbnail`] && !hasThumb) {
        hasThumb = true;
        return img;
      }
      return { ...img, [`${MSSV}_IsThumbnail`]: false };
    });
    if (!hasThumb && images.length > 0) {
      images[0][`${MSSV}_IsThumbnail`] = true;
    }

    const newDishData = {
      ...dishInput,
      [`${MSSV}_Name`]: dishInput[`${MSSV}_Name`].trim(),
      [`${MSSV}_Price`]: Number(dishInput[`${MSSV}_Price`]),
      [`${MSSV}_PreparationTime`]: Number(dishInput[`${MSSV}_PreparationTime`]),
      [`${MSSV}_IsAvailable`]: Boolean(dishInput[`${MSSV}_IsAvailable`]),
      [`${MSSV}_Description`]: (dishInput[`${MSSV}_Description`] || '').trim(),
      [`${MSSV}_DishCategoryId`]: String(dishInput[`${MSSV}_DishCategoryId`]),
      [`${MSSV}_DishImage`]: images,
    };

    if (isOnline) {
      try {
        const created = await mockApiService.createDish(newDishData);
        const updatedDishes = [created, ...dishes];
        setDishes(updatedDishes);
        await storageService.saveDishes(updatedDishes);
        return created;
      } catch (e) {
        console.warn('MockAPI create failed, saving to offline queue:', e);
        // Fallback to offline flow
      }
    }

    // Offline flow
    const tempId = `temp_${Date.now()}`;
    const offlineDish = {
      ...newDishData,
      id: tempId,
      [`${MSSV}_Id`]: tempId,
    };
    const updatedDishes = [offlineDish, ...dishes];
    setDishes(updatedDishes);
    await storageService.saveDishes(updatedDishes);
    await storageService.addToSyncQueue({
      entity: 'dish',
      action: 'CREATE',
      payload: offlineDish,
    });
    await refreshPendingCount();
    return offlineDish;
  };

  const updateDish = async (dishId, dishInput) => {
    const validation = validateDish(dishInput, dishId);
    if (!validation.valid) {
      throw new Error(validation.errorKey);
    }

    // Ensure thumbnail logic: at most 1 thumbnail
    let images = Array.isArray(dishInput[`${MSSV}_DishImage`]) ? [...dishInput[`${MSSV}_DishImage`]] : [];
    let hasThumb = false;
    images = images.map((img) => {
      if (img[`${MSSV}_IsThumbnail`] && !hasThumb) {
        hasThumb = true;
        return img;
      }
      return { ...img, [`${MSSV}_IsThumbnail`]: false };
    });
    if (!hasThumb && images.length > 0) {
      images[0][`${MSSV}_IsThumbnail`] = true;
    }

    const updatedDishData = {
      ...dishInput,
      id: String(dishId),
      [`${MSSV}_Id`]: String(dishId),
      [`${MSSV}_Name`]: dishInput[`${MSSV}_Name`].trim(),
      [`${MSSV}_Price`]: Number(dishInput[`${MSSV}_Price`]),
      [`${MSSV}_PreparationTime`]: Number(dishInput[`${MSSV}_PreparationTime`]),
      [`${MSSV}_IsAvailable`]: Boolean(dishInput[`${MSSV}_IsAvailable`]),
      [`${MSSV}_Description`]: (dishInput[`${MSSV}_Description`] || '').trim(),
      [`${MSSV}_DishCategoryId`]: String(dishInput[`${MSSV}_DishCategoryId`]),
      [`${MSSV}_DishImage`]: images,
    };

    // Update local state first for immediate UI feedback
    const updatedDishes = dishes.map((d) => (String(d[`${MSSV}_Id`]) === String(dishId) ? updatedDishData : d));
    setDishes(updatedDishes);
    await storageService.saveDishes(updatedDishes);

    if (isOnline && !String(dishId).startsWith('temp_')) {
      try {
        await mockApiService.updateDish(dishId, updatedDishData);
        return updatedDishData;
      } catch (e) {
        console.warn('MockAPI update failed, queueing offline update:', e);
      }
    }

    // Queue update for offline sync
    await storageService.addToSyncQueue({
      entity: 'dish',
      action: 'UPDATE',
      payload: updatedDishData,
    });
    await refreshPendingCount();
    return updatedDishData;
  };

  const deleteDish = async (dishId) => {
    const targetDish = dishes.find((d) => String(d[`${MSSV}_Id`]) === String(dishId));
    if (!targetDish) return false;

    const remainingDishes = dishes.filter((d) => String(d[`${MSSV}_Id`]) !== String(dishId));
    setDishes(remainingDishes);
    await storageService.saveDishes(remainingDishes);

    if (isOnline && !String(dishId).startsWith('temp_')) {
      try {
        await mockApiService.deleteDish(dishId);
        return true;
      } catch (e) {
        console.warn('MockAPI delete failed, queueing offline delete:', e);
      }
    }

    // Offline queue
    await storageService.addToSyncQueue({
      entity: 'dish',
      action: 'DELETE',
      payload: { id: dishId, [`${MSSV}_Id`]: dishId },
    });
    await refreshPendingCount();
    return true;
  };

  // CATEGORY MANAGEMENT
  const createCategory = async (catInput) => {
    const name = (catInput[`${MSSV}_Name`] || '').trim();
    if (!name) {
      throw new Error('valCategoryNameRequired');
    }
    const isDup = categories.some((c) => (c[`${MSSV}_Name`] || '').trim().toLowerCase() === name.toLowerCase());
    if (isDup) {
      throw new Error('valCategoryNameDuplicate');
    }

    const newCatData = {
      [`${MSSV}_Name`]: name,
      [`${MSSV}_Description`]: (catInput[`${MSSV}_Description`] || '').trim(),
    };

    if (isOnline) {
      try {
        const created = await mockApiService.createCategory(newCatData);
        const updatedCats = [...categories, created];
        setCategories(updatedCats);
        await storageService.saveCategories(updatedCats);
        return created;
      } catch (e) {
        console.warn('MockAPI category create failed, saving offline:', e);
      }
    }

    const tempId = `temp_${Date.now()}`;
    const offlineCat = {
      ...newCatData,
      id: tempId,
      [`${MSSV}_Id`]: tempId,
    };
    const updatedCats = [...categories, offlineCat];
    setCategories(updatedCats);
    await storageService.saveCategories(updatedCats);
    await storageService.addToSyncQueue({
      entity: 'category',
      action: 'CREATE',
      payload: offlineCat,
    });
    await refreshPendingCount();
    return offlineCat;
  };

  const deleteCategory = async (catId) => {
    // Constraint check (Requirement 4.4: "Không cho xóa loại món đang được sử dụng")
    const isUsed = dishes.some((d) => String(d[`${MSSV}_DishCategoryId`]) === String(catId));
    if (isUsed) {
      throw new Error('cannotDeleteCategoryInUse');
    }

    const remainingCats = categories.filter((c) => String(c[`${MSSV}_Id`]) !== String(catId));
    setCategories(remainingCats);
    await storageService.saveCategories(remainingCats);

    if (isOnline && !String(catId).startsWith('temp_')) {
      try {
        await mockApiService.deleteCategory(catId);
        return true;
      } catch (e) {
        console.warn('MockAPI category delete failed, queueing offline:', e);
      }
    }

    await storageService.addToSyncQueue({
      entity: 'category',
      action: 'DELETE',
      payload: { id: catId, [`${MSSV}_Id`]: catId },
    });
    await refreshPendingCount();
    return true;
  };

  // Reset to default dataset
  const resetToDefaultData = async () => {
    await storageService.seedInitialData(true);
    const defCats = (await storageService.getCategories()) || [];
    const defDishes = (await storageService.getDishes()) || [];
    setCategories(defCats);
    setDishes(defDishes);
    resetFilters();
    await refreshPendingCount();
  };

  // FILTERED AND SORTED DISHES (Requirement 4.2)
  const filteredDishes = useMemo(() => {
    return dishes
      .filter((dish) => {
        // 1. Search by partial name
        if (searchQuery.trim()) {
          const q = searchQuery.trim().toLowerCase();
          const name = (dish[`${MSSV}_Name`] || '').toLowerCase();
          if (!name.includes(q)) return false;
        }

        // 2. Filter by Category
        if (selectedCategory && selectedCategory !== '') {
          if (String(dish[`${MSSV}_DishCategoryId`]) !== String(selectedCategory)) {
            return false;
          }
        }

        // 3. Filter by Status: "món ngừng bán vẫn xuất hiện trong danh sách quản lý, nhưng không xuất hiện khi lọc trạng thái đang bán."
        if (selectedStatus === 'AVAILABLE') {
          if (dish[`${MSSV}_IsAvailable`] !== true) {
            return false;
          }
        }

        // 4. Filter by Price Range
        const price = Number(dish[`${MSSV}_Price`] || 0);
        if (minPrice !== '' && !isNaN(Number(minPrice))) {
          if (price < Number(minPrice)) return false;
        }
        if (maxPrice !== '' && !isNaN(Number(maxPrice))) {
          if (price > Number(maxPrice)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Sắp xếp theo giá tăng/giảm hoặc thời gian chế biến tăng
        if (sortBy === 'PRICE_ASC') {
          return Number(a[`${MSSV}_Price`] || 0) - Number(b[`${MSSV}_Price`] || 0);
        }
        if (sortBy === 'PRICE_DESC') {
          return Number(b[`${MSSV}_Price`] || 0) - Number(a[`${MSSV}_Price`] || 0);
        }
        if (sortBy === 'PREP_TIME_ASC') {
          return Number(a[`${MSSV}_PreparationTime`] || 0) - Number(b[`${MSSV}_PreparationTime`] || 0);
        }
        // Default sort by id or creation
        return 0;
      });
  }, [dishes, searchQuery, selectedCategory, selectedStatus, minPrice, maxPrice, sortBy]);

  return (
    <FoodContext.Provider
      value={{
        categories,
        dishes,
        filteredDishes,
        isLoading,
        error,
        // Filter states
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        selectedStatus,
        setSelectedStatus,
        minPrice,
        setMinPrice,
        maxPrice,
        setMaxPrice,
        sortBy,
        setSortBy,
        resetFilters,
        // CRUD
        createDish,
        updateDish,
        deleteDish,
        createCategory,
        deleteCategory,
        reload: loadInitialData,
        resetToDefaultData,
      }}
    >
      {children}
    </FoodContext.Provider>
  );
};

export const useFood = () => {
  const context = useContext(FoodContext);
  if (!context) {
    throw new Error('useFood must be used within FoodProvider');
  }
  return context;
};
